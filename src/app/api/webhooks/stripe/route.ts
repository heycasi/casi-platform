import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { EmailService } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log the event
    await logSubscriptionEvent(event)

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Webhook handler failed: ${error.message}`)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  await upsertSubscription(subscription, session.customer_details?.email)

  // Send confirmation email
  if (session.customer_details?.email) {
    const priceId = subscription.items.data[0].price.id
    const price = await stripe.prices.retrieve(priceId)

    let planName = 'Creator'
    if (priceId.includes('pro') || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY) {
      planName = 'Pro'
    } else if (priceId.includes('streamer') || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY) {
      planName = 'Streamer+'
    }

    const amount = (price.unit_amount || 0) / 100
    const billingInterval = price.recurring?.interval || 'month'

    await EmailService.sendSubscriptionConfirmation(
      session.customer_details.email,
      planName,
      billingInterval,
      amount
    )
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await upsertSubscription(subscription)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  await supabase
    .from('subscription_events')
    .insert({
      subscription_id: await getSubscriptionId(invoice.subscription as string),
      event_type: 'payment_succeeded',
      event_data: {
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        invoice_id: invoice.id
      }
    })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Update subscription status to past_due
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription)

  await supabase
    .from('subscription_events')
    .insert({
      subscription_id: await getSubscriptionId(invoice.subscription as string),
      event_type: 'payment_failed',
      event_data: {
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        invoice_id: invoice.id,
        attempt_count: invoice.attempt_count
      }
    })
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  email?: string | null
) {
  const priceId = subscription.items.data[0].price.id
  const price = await stripe.prices.retrieve(priceId)

  // Determine plan name from price ID
  let planName = 'Creator'
  if (priceId.includes('pro') || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY) {
    planName = 'Pro'
  } else if (priceId.includes('streamer') || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY) {
    planName = 'Streamer+'
  }

  const subscriptionData = {
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_name: planName,
    billing_interval: price.recurring?.interval || 'month',
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  }

  // Get customer email if not provided
  if (!email) {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    email = (customer as Stripe.Customer).email || undefined
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      ...subscriptionData,
      email: email || 'unknown@email.com'
    }, {
      onConflict: 'stripe_subscription_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }
}

async function getSubscriptionId(stripeSubscriptionId: string): Promise<string> {
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()

  return data?.id
}

async function logSubscriptionEvent(event: Stripe.Event) {
  // Optional: Log all webhook events for debugging
  console.log(`Processed Stripe webhook: ${event.type}`)
}
