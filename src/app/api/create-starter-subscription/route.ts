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
          <h2>🎉 New User Joined!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Tier:</strong> ${tierName}</p>
          ${trialCode ? `<p><strong>Trial Code:</strong> ${trialCode}</p>` : ''}
          ${validUserId ? `<p><strong>User ID:</strong> ${validUserId}</p>` : '<p><em>User ID pending (will be linked)</em></p>'}
          <p><strong>Status:</strong> ${status}</p>
          ${trialEndsAt ? `<p><strong>Trial Ends:</strong> ${new Date(trialEndsAt).toLocaleString()}</p>` : ''}
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
