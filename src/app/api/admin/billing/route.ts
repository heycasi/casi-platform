// Admin API endpoint for subscription and billing logs

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Admin usernames
const ADMIN_USERNAMES = ['conzooo_']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminUsername = searchParams.get('adminUsername')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
    }

    // Get subscription records from Supabase
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (subsError) {
      console.error('Failed to fetch subscriptions:', subsError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Get subscription event logs
    const { data: eventLogs, error: logsError } = await supabase
      .from('subscription_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (logsError) {
      console.error('Failed to fetch event logs:', logsError)
    }

    // Enrich subscription data with latest Stripe info
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          if (!sub.stripe_subscription_id) return sub

          const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
          const customer = await stripe.customers.retrieve(sub.stripe_customer_id)

          return {
            ...sub,
            stripe_status: stripeSub.status,
            stripe_current_period_end: stripeSub.current_period_end,
            stripe_cancel_at_period_end: stripeSub.cancel_at_period_end,
            stripe_canceled_at: stripeSub.canceled_at,
            stripe_latest_invoice: stripeSub.latest_invoice,
            customer_name: (customer as any).name || null,
            customer_email: (customer as any).email || sub.user_email,
          }
        } catch (error) {
          console.error(`Failed to enrich subscription ${sub.id}:`, error)
          return sub
        }
      })
    )

    // Calculate stats
    const stats = {
      total_subscriptions: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'active').length,
      canceled: subscriptions.filter((s) => s.status === 'canceled').length,
      past_due: subscriptions.filter((s) => s.status === 'past_due').length,
      trialing: subscriptions.filter((s) => s.status === 'trialing').length,
      total_mrr: subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => {
          const amount =
            s.tier === 'Starter' ? 19 : s.tier === 'Pro' ? 37 : s.tier === 'Agency' ? 75 : 0
          return sum + amount
        }, 0),
    }

    return NextResponse.json({
      success: true,
      subscriptions: enrichedSubscriptions,
      eventLogs: eventLogs || [],
      stats,
    })
  } catch (error) {
    console.error('[Admin Billing] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get specific customer's billing history
export async function POST(request: NextRequest) {
  try {
    const { adminUsername, customerId, action } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
    }

    if (action === 'get_invoices') {
      // Get all invoices for a customer
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 20,
      })

      return NextResponse.json({
        success: true,
        invoices: invoices.data.map((inv) => ({
          id: inv.id,
          amount: inv.amount_paid / 100,
          currency: inv.currency,
          status: inv.status,
          created: inv.created,
          paid: inv.paid,
          invoice_pdf: inv.invoice_pdf,
          hosted_invoice_url: inv.hosted_invoice_url,
        })),
      })
    }

    if (action === 'get_portal_link') {
      // Generate Stripe Customer Portal link for admin access
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://heycasi.com'}/admin/billing`,
      })

      return NextResponse.json({
        success: true,
        url: session.url,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Admin Billing Action] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
