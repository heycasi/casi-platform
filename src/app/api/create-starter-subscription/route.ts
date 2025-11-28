import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Wait for user to appear in public users table (handles DB trigger race condition)
 * Retries up to 5 times with 500ms delay between attempts (max 2.5s wait)
 */
async function waitForUserInPublicTable(userId: string): Promise<boolean> {
  const MAX_ATTEMPTS = 5
  const DELAY_MS = 500

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!error && user) {
      console.log(`✅ User ${userId} found in public.users table (attempt ${attempt})`)
      return true
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(
        `⏳ User ${userId} not yet in public.users table (attempt ${attempt}/${MAX_ATTEMPTS}), waiting ${DELAY_MS}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }
  }

  console.warn(
    `⚠️ User ${userId} not found in public.users table after ${MAX_ATTEMPTS} attempts (${MAX_ATTEMPTS * DELAY_MS}ms)`
  )
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { email, userId, trialCode } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('email', email)
      .single()
    if (existing) return NextResponse.json({ message: 'Subscription already exists' })

    // Handle user_id validation with retry mechanism
    let validUserId: string | null = null
    if (userId) {
      // First verify user exists in auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

      if (!authError && authUser) {
        // User exists in auth.users, now wait for trigger to copy to public.users
        const userExistsInPublicTable = await waitForUserInPublicTable(userId)

        if (userExistsInPublicTable) {
          validUserId = userId
        } else {
          // Fallback: User not in public.users yet, but we'll create subscription anyway
          // Set user_id to null to avoid foreign key constraint violation
          console.warn(
            `⚠️ Creating subscription with user_id=null for ${email} (will be linked later via trigger/cron)`
          )
          validUserId = null
        }
      } else {
        console.warn(`⚠️ User ${userId} not found in auth.users: ${authError?.message}`)
      }
    }

    // Determine plan details based on trial code
    let tierName = 'Starter'
    let planName = 'Starter'
    let status = 'active'
    let trialEndsAt: string | null = null

    if (trialCode === 'vip7') {
      console.log(`🎁 Applying VIP7 trial for ${email}`)
      tierName = 'Pro'
      planName = 'Pro'
      status = 'trialing'
      // 7 days from now
      trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Create Subscription
    const { error } = await supabase.from('subscriptions').insert({
      email,
      user_id: validUserId,
      tier_name: tierName,
      plan_name: planName,
      status: status,
      trial_ends_at: trialEndsAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    if (validUserId) {
      console.log(
        `✅ Created ${tierName} subscription for ${email} with user_id=${validUserId}${
          trialCode ? ` (Trial: ${trialCode})` : ''
        }`
      )
    } else {
      console.log(
        `✅ Created ${tierName} subscription for ${email} without user_id (will be linked later)`
      )
    }

    // Send admin notification email (non-blocking)
    try {
      await resend.emails.send({
        from: 'System <system@heycasi.com>',
        to: 'casi@heycasi.com',
        subject: `🚀 New User Signup: ${email}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New User Signup</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f12;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f12; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid rgba(105, 50, 255, 0.3); box-shadow: 0 8px 32px rgba(105, 50, 255, 0.2);">

                      <!-- Header with Logo -->
                      <tr>
                        <td style="padding: 40px 40px 24px 40px; text-align: center;">
                          <img src="https://heycasi.com/landing-logo.png" alt="Casi" style="max-width: 160px; height: auto; margin-bottom: 20px; filter: brightness(1.2);" />
                        </td>
                      </tr>

                      <!-- Title -->
                      <tr>
                        <td style="padding: 0 40px 32px 40px; text-align: center;">
                          <h1 style="margin: 0; background: linear-gradient(135deg, #6932FF 0%, #932FFE 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">
                            🎉 New User Joined!
                          </h1>
                        </td>
                      </tr>

                      <!-- Details Section -->
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background: rgba(105, 50, 255, 0.1); border: 2px solid rgba(105, 50, 255, 0.3); border-radius: 12px; padding: 24px;">

                            <!-- Email -->
                            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Email</div>
                              <div style="color: white; font-size: 16px; font-weight: 600;">${email}</div>
                            </div>

                            <!-- Tier -->
                            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Tier</div>
                              <div style="color: white; font-size: 16px; font-weight: 600;">${tierName}</div>
                            </div>

                            ${
                              trialCode
                                ? `
                            <!-- Trial Code -->
                            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Trial Code</div>
                              <div style="display: inline-block; background: #932FFE; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 700;">${trialCode}</div>
                            </div>
                            `
                                : ''
                            }

                            <!-- User ID -->
                            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">User ID</div>
                              <div style="color: white; font-size: 14px; font-weight: 500; font-family: monospace;">${validUserId || '<em style="color: rgba(255, 255, 255, 0.5);">Pending (will be linked)</em>'}</div>
                            </div>

                            <!-- Status -->
                            <div style="margin-bottom: ${trialEndsAt ? '16px' : '0'}; ${trialEndsAt ? 'padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);' : ''}">
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Status</div>
                              <div style="display: inline-block; background: ${status === 'active' ? '#10B981' : '#f59e0b'}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase;">${status}</div>
                            </div>

                            ${
                              trialEndsAt
                                ? `
                            <!-- Trial Ends -->
                            <div>
                              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Trial Ends</div>
                              <div style="color: white; font-size: 16px; font-weight: 600;">${new Date(
                                trialEndsAt
                              ).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</div>
                            </div>
                            `
                                : ''
                            }

                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.3); text-align: center; border-radius: 0 0 16px 16px;">
                          <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                            Admin notification from Casi Platform
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      })
      console.log(`📧 Admin notification sent for new signup: ${email}`)
    } catch (emailError) {
      // Don't fail the signup if email notification fails
      console.error('Failed to send admin notification email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
