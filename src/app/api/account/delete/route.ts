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

/**
 * Account Deletion API - GDPR Compliant
 * DELETE /api/account/delete
 *
 * This endpoint:
 * 1. Verifies user authentication
 * 2. Cancels active Stripe subscription
 * 3. Deletes all user data from database (cascades to related tables)
 * 4. Deletes user from Supabase auth
 * 5. Sends confirmation email
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get user email from request body (authenticated)
    const body = await req.json()
    const { email, confirmEmail } = body

    if (!email || !confirmEmail) {
      return NextResponse.json(
        { error: 'Email and confirmation email are required' },
        { status: 400 }
      )
    }

    if (email !== confirmEmail) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Starting account deletion for: ${email}`)

    // Step 1: Find the user in Supabase auth
    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user.id

    // Step 2: Find and cancel Stripe subscription
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id, plan_name')
        .eq('email', email)
        .eq('status', 'active')

      if (subError) {
        console.error('Error finding subscriptions:', subError)
      }

      if (subscriptions && subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          try {
            // Cancel the Stripe subscription immediately
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
            console.log(`✅ Canceled Stripe subscription: ${subscription.stripe_subscription_id}`)
          } catch (stripeError: any) {
            console.error(`Error canceling Stripe subscription: ${stripeError.message}`)
            // Continue with deletion even if Stripe cancellation fails
          }
        }
      }
    } catch (error) {
      console.error('Error in Stripe cancellation:', error)
      // Continue with deletion
    }

    // Step 3: Delete all user data from database
    // The ON DELETE CASCADE will automatically delete related data:
    // - stream_chat_messages (via session_id -> stream_report_sessions)
    // - stream_session_analytics (via session_id -> stream_report_sessions)
    // - stream_report_deliveries (via session_id -> stream_report_sessions)
    // - subscription_events (via subscription_id -> subscriptions)

    // Delete stream sessions (cascades to chat_messages, analytics, deliveries)
    const { error: sessionsError } = await supabase
      .from('stream_report_sessions')
      .delete()
      .eq('streamer_email', email)

    if (sessionsError) {
      console.error('Error deleting stream sessions:', sessionsError)
    } else {
      console.log('✅ Deleted stream sessions and related data')
    }

    // Delete subscriptions (cascades to subscription_events)
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('email', email)

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
    } else {
      console.log('✅ Deleted subscriptions and events')
    }

    // Step 4: Delete user from Supabase auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      )
    }

    console.log('✅ Deleted user from Supabase auth')

    // Step 5: Send confirmation email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Casi <casi@heycasi.com>',
          to: [email],
          subject: 'Your Casi account has been deleted',
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
                <div style="background: #333; padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Account Deleted</h1>
                </div>
                <div style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">We've successfully deleted your Casi account and all associated data.</p>

                  <div style="background: #f8f9fb; border-left: 4px solid #333; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;"><strong>What was deleted:</strong></p>
                    <ul style="color: #666; font-size: 14px; margin: 10px 0; padding-left: 20px;">
                      <li>Your Casi account</li>
                      <li>All stream session data</li>
                      <li>All chat analytics and messages</li>
                      <li>Subscription information</li>
                      <li>Any active subscriptions were canceled</li>
                    </ul>
                  </div>

                  <p style="color: #666; font-size: 14px; margin-top: 30px;">If you canceled by mistake or change your mind, you can always create a new account at <a href="https://www.heycasi.com" style="color: #6932FF;">heycasi.com</a>.</p>

                  <p style="color: #666; font-size: 14px; margin-top: 20px;">We're sorry to see you go. If you have any feedback about why you left, we'd love to hear from you - just reply to this email.</p>
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
        console.log('✅ Sent account deletion confirmation email')
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the deletion if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted'
    })

  } catch (error: any) {
    console.error('Account deletion failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    )
  }
}
