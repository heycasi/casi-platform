// Admin API endpoint for user management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin usernames
const ADMIN_USERNAMES = ['conzooo_']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminUsername = searchParams.get('adminUsername')
    const filterPlan = searchParams.get('plan') // creator, pro, streamer+, or 'all'

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
    }

    // Get all users from auth.users with their metadata
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Failed to fetch auth users:', authError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get subscription data for all users
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')

    if (subsError) {
      console.error('Failed to fetch subscriptions:', subsError)
    }

    // Create maps for matching subscriptions by both email and user_id
    // Prefer active subscriptions, and most recent if there are multiple
    const subscriptionByEmail = new Map()
    const subscriptionByUserId = new Map()

    subscriptions?.forEach((sub) => {
      // Helper to update map only if this sub is better than existing
      const updateIfBetter = (map: Map<any, any>, key: any) => {
        const existing = map.get(key)
        if (
          !existing ||
          (sub.status === 'active' && existing.status !== 'active') ||
          (sub.status === existing.status &&
            new Date(sub.updated_at || sub.created_at) >
              new Date(existing.updated_at || existing.created_at))
        ) {
          map.set(key, sub)
        }
      }

      if (sub.email) updateIfBetter(subscriptionByEmail, sub.email)
      if (sub.user_email) updateIfBetter(subscriptionByEmail, sub.user_email)
      if (sub.user_id) updateIfBetter(subscriptionByUserId, sub.user_id)
    })

    // Combine user data with subscription data
    const users = authUsers.users.map((user) => {
      // Try to match by user_id first (most reliable), then fall back to email
      const subscription = subscriptionByUserId.get(user.id) || subscriptionByEmail.get(user.email)
      const metadata = user.user_metadata || {}

      // Debug logging for subscription matching
      if (subscription) {
        console.log(`[Admin Users] User ${user.email}:`, {
          tier_name: subscription.tier_name,
          plan_name: subscription.plan_name,
          tier: subscription.tier,
          stripe_price_id: subscription.stripe_price_id,
          status: subscription.status,
        })
      }

      return {
        id: user.id,
        email: user.email,
        twitch_id: metadata.twitch_id || null,
        twitch_username: metadata.preferred_username || metadata.display_name || 'Unknown',
        display_name: metadata.display_name || 'Unknown',
        avatar_url: metadata.avatar_url || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        subscription_tier:
          subscription?.tier_name || subscription?.plan_name || subscription?.tier || 'None',
        subscription_status: subscription?.status || 'inactive',
        subscription_id: subscription?.stripe_subscription_id || null,
        stripe_customer_id: subscription?.stripe_customer_id || null,
        current_period_end: subscription?.current_period_end || null,
        cancel_at_period_end: subscription?.cancel_at_period_end || false,
      }
    })

    // Filter by plan if specified
    let filteredUsers = users
    if (filterPlan && filterPlan !== 'all') {
      filteredUsers = users.filter(
        (u) => u.subscription_tier.toLowerCase() === filterPlan.toLowerCase()
      )
    }

    // Sort by most recent
    filteredUsers.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      total: filteredUsers.length,
      stats: {
        total: users.length,
        starter: users.filter((u) => u.subscription_tier === 'Starter').length,
        pro: users.filter((u) => u.subscription_tier === 'Pro').length,
        agency: users.filter((u) => u.subscription_tier === 'Agency').length,
        no_subscription: users.filter((u) => u.subscription_tier === 'None').length,
        active: users.filter((u) => u.subscription_status === 'active').length,
      },
    })
  } catch (error) {
    console.error('[Admin Users] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminUsername, action, userId, email } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 403 })
    }

    switch (action) {
      case 'suspend': {
        // Ban the user
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: '876000h', // 100 years = effectively permanent
        })

        if (error) {
          console.error('Failed to suspend user:', error)
          return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: `User ${email} suspended successfully`,
        })
      }

      case 'unsuspend': {
        // Unban the user
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: 'none',
        })

        if (error) {
          console.error('Failed to unsuspend user:', error)
          return NextResponse.json({ error: 'Failed to unsuspend user' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: `User ${email} unsuspended successfully`,
        })
      }

      case 'delete': {
        // Delete the user completely
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) {
          console.error('Failed to delete user:', error)
          return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
        }

        // Also delete their subscription record
        await supabase.from('subscriptions').delete().eq('user_email', email)

        return NextResponse.json({
          success: true,
          message: `User ${email} deleted successfully`,
        })
      }

      case 'grant_pro_trial': {
        // Grant Pro access for 7 days
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)

        // Find or create subscription record
        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`user_email.eq.${email},email.eq.${email}`)
          .single()

        if (findError && findError.code !== 'PGRST116') {
          console.error('Failed to find subscription:', findError)
          return NextResponse.json({ error: 'Failed to find subscription' }, { status: 500 })
        }

        if (existingSub) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              tier_name: 'Pro',
              plan_name: 'Pro',
              status: 'trialing',
              trial_ends_at: trialEndsAt.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)

          if (updateError) {
            console.error('Failed to update subscription:', updateError)
            return NextResponse.json({ error: 'Failed to grant Pro access' }, { status: 500 })
          }
        } else {
          // Create new subscription
          const { error: createError } = await supabase.from('subscriptions').insert({
            user_id: userId,
            user_email: email,
            email: email,
            tier_name: 'Pro',
            plan_name: 'Pro',
            status: 'trialing',
            trial_ends_at: trialEndsAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (createError) {
            console.error('Failed to create subscription:', createError)
            return NextResponse.json({ error: 'Failed to grant Pro access' }, { status: 500 })
          }
        }

        return NextResponse.json({
          success: true,
          message: `Pro access granted to ${email} for 7 days (expires ${trialEndsAt.toLocaleDateString()})`,
        })
      }

      case 'grant_agency': {
        // Step A: UPSERT subscription to Agency tier
        // Try to find existing subscription by user_id first (most reliable)
        const { data: existingSubById } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        // If not found by user_id, try by email
        let existingSub = existingSubById
        if (!existingSub) {
          const { data: existingSubByEmail } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_email', email)
            .maybeSingle()
          existingSub = existingSubByEmail

          // Also try the 'email' column as fallback
          if (!existingSub) {
            const { data: existingSubByEmailAlt } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('email', email)
              .maybeSingle()
            existingSub = existingSubByEmailAlt
          }
        }

        if (existingSub) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              user_id: userId, // Ensure user_id is set
              tier_name: 'Agency',
              plan_name: 'Agency',
              status: 'active',
              trial_ends_at: null, // Clear any trial
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)

          if (updateError) {
            console.error('Failed to update subscription:', updateError)
            return NextResponse.json({ error: 'Failed to grant Agency access' }, { status: 500 })
          }
        } else {
          // Create new subscription
          const { error: createError } = await supabase.from('subscriptions').insert({
            user_id: userId,
            user_email: email,
            email: email,
            tier_name: 'Agency',
            plan_name: 'Agency',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (createError) {
            console.error('Failed to create subscription:', createError)
            return NextResponse.json({ error: 'Failed to grant Agency access' }, { status: 500 })
          }
        }

        // Step B: Check if user already owns an organization
        const { data: existingOrg, error: orgCheckError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', userId)
          .single()

        if (orgCheckError && orgCheckError.code !== 'PGRST116') {
          console.error('Failed to check existing organization:', orgCheckError)
          return NextResponse.json({ error: 'Failed to check organization' }, { status: 500 })
        }

        let organizationId = existingOrg?.id

        if (!existingOrg) {
          // Create new organization
          const { data: authUser } = await supabase.auth.admin.getUserById(userId)
          const displayName =
            authUser.user?.user_metadata?.display_name ||
            authUser.user?.user_metadata?.preferred_username ||
            email.split('@')[0]

          const { data: newOrg, error: orgCreateError } = await supabase
            .from('organizations')
            .insert({
              owner_id: userId,
              name: `${displayName}'s Agency`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (orgCreateError) {
            console.error('Failed to create organization:', orgCreateError)
            return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
          }

          organizationId = newOrg.id

          // Add owner as member
          const { error: memberError } = await supabase.from('organization_members').insert({
            organization_id: organizationId,
            user_id: userId,
            role: 'owner',
            joined_at: new Date().toISOString(),
          })

          if (memberError) {
            console.error('Failed to add owner as member:', memberError)
            // Don't fail the whole operation if this fails
          }

          return NextResponse.json({
            success: true,
            message: `🏢 Agency access granted to ${email}! Organization "${displayName}'s Agency" created.`,
          })
        } else {
          return NextResponse.json({
            success: true,
            message: `🏢 Agency access granted to ${email}! Using existing organization "${existingOrg.name}".`,
          })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Admin Users Action] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
