import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * User Access Check API
 * GET /api/user-access?email=user@example.com
 *
 * Checks if a user has active access (paid subscription or valid trial)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Get user's subscription/trial status
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .single()

    // No subscription found
    if (subError || !subscription) {
      return NextResponse.json({
        has_access: false,
        status: 'no_subscription',
        message: 'No subscription found. Please subscribe or use a beta code to access the dashboard.',
        require_subscription: true
      })
    }

    // Check if it's a trial (either is_beta_trial flag or status='trialing')
    const isTrialing = subscription.is_beta_trial || subscription.status === 'trialing'
    const trialEndDate = subscription.trial_ends_at || subscription.trial_end

    if (isTrialing && trialEndDate) {
      const trialEndsAt = new Date(trialEndDate)
      const now = new Date()

      if (trialEndsAt > now) {
        // Trial is still active
        const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return NextResponse.json({
          has_access: true,
          status: 'trial',
          is_trial: true,
          trial_ends_at: trialEndDate,
          trial_days_remaining: daysRemaining,
          plan_name: subscription.plan_name || subscription.tier_name,
          beta_code: subscription.beta_code,
          message: `You have ${daysRemaining} days remaining in your beta trial.`
        })
      } else {
        // Trial has expired
        return NextResponse.json({
          has_access: false,
          status: 'trial_expired',
          is_trial: true,
          trial_ended: true,
          trial_ends_at: trialEndDate,
          message: 'Your beta trial has expired. Please subscribe to continue using Casi.',
          require_subscription: true
        })
      }
    }

    // Check if it's an active paid subscription
    if (subscription.status === 'active') {
      return NextResponse.json({
        has_access: true,
        status: 'active',
        is_trial: false,
        plan_name: subscription.plan_name,
        tier_name: subscription.tier_name,
        current_period_end: subscription.current_period_end,
        message: `Active ${subscription.plan_name} subscription`
      })
    }

    // Subscription exists but is not active
    return NextResponse.json({
      has_access: false,
      status: subscription.status,
      plan_name: subscription.plan_name,
      message: `Your subscription is ${subscription.status}. Please update your payment method or subscribe.`,
      require_subscription: true
    })

  } catch (error: any) {
    console.error('User access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
