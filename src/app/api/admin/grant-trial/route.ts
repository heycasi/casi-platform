// Admin API endpoint to manually grant trial access to users
// POST /api/admin/grant-trial

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin usernames
const ADMIN_USERNAMES = ['conzooo_']

export async function POST(request: NextRequest) {
  try {
    const { adminUsername, userEmail, trialDays = 14, tierName = 'Starter' } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Find the user by email
    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users.find((u) => u.email?.toLowerCase() === userEmail.toLowerCase())

    if (!user) {
      return NextResponse.json(
        {
          error: `User not found with email: ${userEmail}`,
          message:
            'The user must create an account first before you can grant them trial access. Ask them to sign up at https://heycasi.com/signup',
        },
        { status: 404 }
      )
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)

    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays)

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'trialing',
          tier_name: tierName,
          plan_name: tierName,
          trial_end: trialEndsAt.toISOString(),
          beta_code: 'ADMIN_GRANTED',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update trial access' }, { status: 500 })
      }

      console.log(`✅ Updated trial for ${userEmail}: ${trialDays} days, ${tierName} tier`)

      return NextResponse.json({
        success: true,
        message: `Updated trial access for ${userEmail}`,
        details: {
          userId: user.id,
          email: userEmail,
          tier: tierName,
          trialDays: trialDays,
          trialEndsAt: trialEndsAt.toISOString(),
        },
      })
    }

    // Create new subscription with trial
    const { data: insertData, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        email: userEmail.toLowerCase(),
        stripe_customer_id: `manual_trial_${user.id}`,
        stripe_subscription_id: `trial_${user.id}_${Date.now()}`,
        stripe_price_id: 'manual_trial',
        plan_name: tierName,
        tier_name: tierName,
        billing_interval: 'trial',
        status: 'trialing',
        trial_start: new Date().toISOString(),
        trial_end: trialEndsAt.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndsAt.toISOString(),
        cancel_at_period_end: false,
      })
      .select()

    if (insertError) {
      console.error('Failed to create trial subscription:', insertError)
      console.error('Full error details:', JSON.stringify(insertError, null, 2))
      return NextResponse.json(
        { error: 'Failed to grant trial access', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Manual trial granted to ${userEmail}: ${trialDays} days, ${tierName} tier`)

    return NextResponse.json({
      success: true,
      message: `Trial access granted to ${userEmail}`,
      details: {
        userId: user.id,
        email: userEmail,
        tier: tierName,
        trialDays: trialDays,
        trialEndsAt: trialEndsAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Admin Grant Trial] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
