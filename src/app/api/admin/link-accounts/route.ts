// Admin API to manually link duplicate accounts
// POST /api/admin/link-accounts

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
    const { adminUsername, primaryEmail, twitchEmail } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    if (!primaryEmail || !twitchEmail) {
      return NextResponse.json(
        { error: 'Both primaryEmail and twitchEmail are required' },
        { status: 400 }
      )
    }

    // Step 1: Find both accounts
    const { data: userData } = await supabase.auth.admin.listUsers()
    const primaryAccount = userData?.users.find(u => u.email?.toLowerCase() === primaryEmail.toLowerCase())
    const twitchAccount = userData?.users.find(u => u.email?.toLowerCase() === twitchEmail.toLowerCase())

    if (!primaryAccount) {
      return NextResponse.json(
        { error: `Primary account not found: ${primaryEmail}` },
        { status: 404 }
      )
    }

    if (!twitchAccount) {
      return NextResponse.json(
        { error: `Twitch account not found: ${twitchEmail}` },
        { status: 404 }
      )
    }

    console.log(`🔗 [Admin] Linking accounts:`)
    console.log(`   Primary: ${primaryAccount.email} (${primaryAccount.id})`)
    console.log(`   Twitch: ${twitchAccount.email} (${twitchAccount.id})`)

    // Step 2: Update primary account with Twitch metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      primaryAccount.id,
      {
        user_metadata: {
          ...primaryAccount.user_metadata,
          twitch_id: twitchAccount.user_metadata?.twitch_id,
          twitch_linked: true,
          twitch_display_name: twitchAccount.user_metadata?.display_name,
          twitch_login: twitchAccount.user_metadata?.preferred_username,
          twitch_avatar: twitchAccount.user_metadata?.avatar_url,
          twitch_linked_at: new Date().toISOString(),
          linked_from_email: twitchEmail
        }
      }
    )

    if (updateError) {
      console.error('Failed to update primary account:', updateError)
      return NextResponse.json(
        { error: 'Failed to update primary account' },
        { status: 500 }
      )
    }

    // Step 3: Transfer subscription from Twitch account to primary account
    const { data: twitchSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', twitchEmail)
      .single()

    const { data: primarySubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', primaryEmail)
      .single()

    let subscriptionAction = 'none'

    if (twitchSubscription && !primarySubscription) {
      // Transfer subscription from Twitch to primary
      const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update({
          email: primaryEmail,
          updated_at: new Date().toISOString()
        })
        .eq('email', twitchEmail)

      if (subUpdateError) {
        console.error('Failed to transfer subscription:', subUpdateError)
      } else {
        subscriptionAction = 'transferred'
        console.log(`✅ Transferred subscription from ${twitchEmail} to ${primaryEmail}`)
      }
    } else if (twitchSubscription && primarySubscription) {
      // Both have subscriptions - keep the better one
      const twitchIsTrial = twitchSubscription.status === 'trialing'
      const primaryIsTrial = primarySubscription.status === 'trialing'
      const twitchIsActive = twitchSubscription.status === 'active'
      const primaryIsActive = primarySubscription.status === 'active'

      if (twitchIsActive && !primaryIsActive) {
        // Twitch has active subscription, primary doesn't - replace
        await supabase
          .from('subscriptions')
          .delete()
          .eq('email', primaryEmail)

        await supabase
          .from('subscriptions')
          .update({
            email: primaryEmail,
            updated_at: new Date().toISOString()
          })
          .eq('email', twitchEmail)

        subscriptionAction = 'replaced_with_twitch'
        console.log(`✅ Replaced primary subscription with Twitch (active) subscription`)
      } else if (twitchIsTrial && !primaryIsTrial && !primaryIsActive) {
        // Twitch has trial, primary has nothing active - transfer trial
        await supabase
          .from('subscriptions')
          .delete()
          .eq('email', primaryEmail)

        await supabase
          .from('subscriptions')
          .update({
            email: primaryEmail,
            updated_at: new Date().toISOString()
          })
          .eq('email', twitchEmail)

        subscriptionAction = 'replaced_with_twitch_trial'
        console.log(`✅ Replaced primary subscription with Twitch trial`)
      } else {
        // Primary subscription is better or equal - delete Twitch subscription
        await supabase
          .from('subscriptions')
          .delete()
          .eq('email', twitchEmail)

        subscriptionAction = 'kept_primary'
        console.log(`✅ Kept primary subscription, deleted Twitch subscription`)
      }
    } else if (primarySubscription && !twitchSubscription) {
      subscriptionAction = 'primary_already_exists'
    }

    // Step 4: Optionally delete the Twitch-only account
    // (Commented out for safety - you can manually delete later if needed)
    // await supabase.auth.admin.deleteUser(twitchAccount.id)

    return NextResponse.json({
      success: true,
      message: `Successfully linked Twitch account to primary account`,
      details: {
        primaryAccount: {
          id: primaryAccount.id,
          email: primaryAccount.email
        },
        twitchAccount: {
          id: twitchAccount.id,
          email: twitchAccount.email,
          twitch_id: twitchAccount.user_metadata?.twitch_id
        },
        subscriptionAction,
        note: 'Twitch account not deleted - can be removed manually if needed'
      }
    })

  } catch (error) {
    console.error('[Admin Link Accounts] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
