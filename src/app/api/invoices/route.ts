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

/**
 * Invoice Download API
 * GET /api/invoices?email=user@example.com
 * GET /api/invoices?email=user@example.com&invoiceId=in_xxx (for specific invoice)
 *
 * Returns list of invoices or redirects to Stripe-hosted invoice PDF
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const invoiceId = searchParams.get('invoiceId')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, plan_name, status')
      .eq('email', email)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'No subscription found for this email' }, { status: 404 })
    }

    // Check if we have a Stripe customer ID
    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            'No billing information found. Your account may not have an active payment method.',
        },
        { status: 404 }
      )
    }

    // If specific invoice ID is provided, return that invoice details
    if (invoiceId) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId)

        // Verify this invoice belongs to the user
        if (invoice.customer !== subscription.stripe_customer_id) {
          return NextResponse.json(
            { error: 'Invoice does not belong to this user' },
            { status: 403 }
          )
        }

        // Return invoice details with PDF link
        return NextResponse.json({
          invoice: {
            id: invoice.id,
            number: invoice.number,
            amount_due: invoice.amount_due / 100, // Convert cents to pounds
            amount_paid: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: invoice.status,
            created: new Date(invoice.created * 1000).toISOString(),
            due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
            paid_at: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : null,
            pdf_url: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
            description: invoice.description || `${subscription.plan_name} subscription`,
            period_start: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : null,
            period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
          },
        })
      } catch (error: any) {
        console.error('Error retrieving invoice:', error)
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
    }

    // Otherwise, return list of all invoices for this customer
    try {
      const invoices = await stripe.invoices.list({
        customer: subscription.stripe_customer_id,
        limit: 100, // Get last 100 invoices
      })

      const invoiceList = invoices.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount_due: invoice.amount_due / 100,
        amount_paid: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        created: new Date(invoice.created * 1000).toISOString(),
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        paid_at: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : null,
        pdf_url: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        description: invoice.description || `${subscription.plan_name} subscription`,
        period_start: invoice.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      }))

      return NextResponse.json({
        subscription: {
          plan_name: subscription.plan_name,
          status: subscription.status,
          stripe_customer_id: subscription.stripe_customer_id,
        },
        invoices: invoiceList,
        total: invoiceList.length,
      })
    } catch (error: any) {
      console.error('Error listing invoices:', error)
      return NextResponse.json({ error: 'Failed to retrieve invoices' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Invoice API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
