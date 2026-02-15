import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get the subscription for this email (allow active, trialing, or past_due)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('email', email)
      .in('status', ['active', 'trialing', 'past_due'])
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heycasi.com'}/account?tab=subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
