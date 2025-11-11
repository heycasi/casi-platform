import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Beta Code Validation API
 * POST /api/beta-code/validate
 *
 * Validates a beta code and creates a trial subscription
 */
export async function POST(req: NextRequest) {
  try {
    const { code, email, userId } = await req.json()

    if (!code || !email) {
      return NextResponse.json({ error: 'Beta code and email are required' }, { status: 400 })
    }

    // 1. Check if beta code exists and is valid
    const { data: betaCode, error: codeError } = await supabase
      .from('beta_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single()

    if (codeError || !betaCode) {
      return NextResponse.json({ error: 'Invalid or inactive beta code' }, { status: 404 })
    }

    // 2. Check if code has expired
    if (betaCode.expires_at && new Date(betaCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This beta code has expired' }, { status: 410 })
    }

    // 3. Check if code has reached max uses
    if (betaCode.current_uses >= betaCode.max_uses) {
      return NextResponse.json(
        { error: 'This beta code has reached its maximum number of uses' },
        { status: 410 }
      )
    }

    // 4. Check if user already has an active subscription or trial
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .in('status', ['active', 'trialing'])
      .single()

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription or trial' },
        { status: 409 }
      )
    }

    // 5. Create trial subscription
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + betaCode.trial_days)

    // Build subscription data - only include user_id if it's a valid UUID
    const subscriptionData: any = {
      email,
      status: 'trialing',
      plan_name: 'Beta Trial',
      tier_name: 'Creator', // Give Creator tier features during trial
      is_beta_trial: true,
      beta_code: code.toUpperCase(),
      trial_ends_at: trialEndsAt.toISOString(),
      created_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: trialEndsAt.toISOString(),
      // Viewer limit columns (handle both avg_viewer_limit and viewer_limit)
      avg_viewer_limit: 50, // Creator tier limit
      viewer_limit: 50, // In case DB has viewer_limit column instead
      // Stripe columns are NULL for beta trials (migration makes them nullable)
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      billing_interval: null,
      // Trial tracking
      trial_start: new Date().toISOString(),
      trial_end: trialEndsAt.toISOString(),
      cancel_at_period_end: false,
      // Tier tracking defaults
      avg_viewers_30d: 0,
      days_over_limit: 0,
      tier_status: 'within_limit',
    }

    // Only add user_id if it looks like a UUID (not a Twitch ID)
    if (userId && userId.includes('-')) {
      subscriptionData.user_id = userId
    }

    const { data: newSubscription, error: subError } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (subError) {
      console.error('Error creating trial subscription:', subError)
      console.error('Subscription error details:', {
        code: subError.code,
        message: subError.message,
        details: subError.details,
        hint: subError.hint,
      })
      return NextResponse.json(
        {
          error: 'Failed to create trial subscription',
          details: subError.message,
          hint: subError.hint,
        },
        { status: 500 }
      )
    }

    // 6. Increment beta code usage count
    await supabase
      .from('beta_codes')
      .update({ current_uses: betaCode.current_uses + 1 })
      .eq('code', code.toUpperCase())

    // 7. Log the beta code redemption
    await supabase.from('subscription_events').insert({
      subscription_id: newSubscription.id,
      event_type: 'beta_trial_started',
      event_data: {
        beta_code: code.toUpperCase(),
        trial_days: betaCode.trial_days,
        trial_ends_at: trialEndsAt.toISOString(),
      },
      created_at: new Date().toISOString(),
    })

    console.log(`✅ Beta trial created for ${email} with code ${code.toUpperCase()}`)

    return NextResponse.json({
      success: true,
      subscription: {
        plan_name: newSubscription.plan_name,
        status: newSubscription.status,
        trial_ends_at: newSubscription.trial_ends_at,
        trial_days: betaCode.trial_days,
      },
      message: `Beta trial activated! You have ${betaCode.trial_days} days of free access.`,
    })
  } catch (error: any) {
    console.error('Beta code validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Check beta code validity without redeeming it
 * GET /api/beta-code/validate?code=CASIBETA25
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Beta code is required' }, { status: 400 })
    }

    const { data: betaCode, error: codeError } = await supabase
      .from('beta_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single()

    if (codeError || !betaCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or inactive beta code' },
        { status: 404 }
      )
    }

    // Check if expired
    if (betaCode.expires_at && new Date(betaCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This beta code has expired' },
        { status: 410 }
      )
    }

    // Check if max uses reached
    if (betaCode.current_uses >= betaCode.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'This beta code has reached its maximum uses' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      valid: true,
      trial_days: betaCode.trial_days,
      description: betaCode.description,
      uses_remaining: betaCode.max_uses - betaCode.current_uses,
    })
  } catch (error: any) {
    console.error('Beta code check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
