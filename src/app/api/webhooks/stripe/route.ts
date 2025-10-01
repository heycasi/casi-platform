import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

  // Create Supabase account if customer email is provided
  if (session.customer_details?.email) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', session.customer_details.email)
        .single()

      if (!existingUsers) {
        // Create new Supabase account with temporary password
        // User will need to reset password via email
        const tempPassword = Math.random().toString(36).slice(-16)

        const { error: signUpError } = await supabase.auth.admin.createUser({
          email: session.customer_details.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email since they paid
          user_metadata: {
            stripe_customer_id: session.customer,
            created_via: 'stripe_checkout'
          }
        })

        if (signUpError) {
          console.error('Failed to create Supabase user:', signUpError)
        } else {
          console.log('✅ Created Supabase account for:', session.customer_details.email)

          // Send password reset email so user can set their password
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            session.customer_details.email,
            {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
            }
          )

          if (resetError) {
            console.error('Failed to send password reset:', resetError)
          }
        }
      }
    } catch (error) {
      console.error('Error checking/creating user:', error)
    }
  }

  await upsertSubscription(subscription, session.customer_details?.email)

  // Send confirmation email
  if (session.customer_details?.email && resend) {
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

    try {
      await resend.emails.send({
        from: 'Casi <casi@heycasi.com>',
        to: [session.customer_details.email],
        subject: `🎉 Welcome to Casi ${planName}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          </head>
          <body style="font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome to Casi!</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Thanks for subscribing to <strong style="color: #6932FF;">Casi ${planName}</strong>!</p>
                <div style="background: #f8f9fb; border-left: 4px solid #6932FF; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; color: #666;"><strong>Plan:</strong> ${planName}</p>
                  <p style="margin: 10px 0 0 0; color: #666;"><strong>Billing:</strong> £${amount}/${billingInterval}</p>
                </div>
                <h2 style="color: #6932FF; font-size: 20px; margin-top: 30px;">🚀 Next Steps:</h2>
                <ol style="color: #666; line-height: 1.8;">
                  <li>Connect your Twitch account</li>
                  <li>Set up your dashboard preferences</li>
                  <li>Start tracking your stream chat</li>
                </ol>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.heycasi.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6932FF, #932FFE); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600;">
                    Go to Dashboard
                  </a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions, just reply to this email. We're here to help!</p>
              </div>
              <div style="background: #f8f9fb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6932FF; font-weight: 700;">Casi</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your stream's brainy co-pilot</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
      console.log('✅ Subscription confirmation email sent')
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
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
