import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Link Twitch Account API
 * POST /api/link-twitch-account
 *
 * Links a Twitch account to an existing email account
 * Transfers subscriptions and merges account data
 */
export async function POST(request: NextRequest) {
  try {
    const { twitchUserId, twitchEmail, twitchUserData } = await request.json()

    if (!twitchUserId || !twitchEmail) {
      return NextResponse.json(
        { error: 'Twitch user ID and email are required' },
        { status: 400 }
      )
    }

    // Step 1: Check if there's a subscription for this Twitch email
    const { data: twitchSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', twitchEmail)
      .single()

    // Step 2: Try to find an existing primary account
    // Look for users with real email addresses (not @twitch.casi.app)
    const { data: allUsers } = await supabase.auth.admin.listUsers()

    // Find potential matching accounts by checking:
    // 1. User metadata that might have the same Twitch ID
    // 2. Display name matches
    // 3. Subscriptions with matching personal emails
    let primaryAccount = null
    let matchReason = ''

    // Check if user already has a linked account in metadata
    const existingTwitchAccount = allUsers?.users.find(u =>
      u.user_metadata?.twitch_id === twitchUserId
    )

    if (existingTwitchAccount && !existingTwitchAccount.email?.includes('@twitch.casi.app')) {
      primaryAccount = existingTwitchAccount
      matchReason = 'twitch_id_match'
    }

    // If no match found, check if there's a subscription with a real email that we should link to
    if (!primaryAccount && twitchSubscription) {
      // Check if the subscription has a different email (real email from Stripe checkout)
      const { data: allSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .neq('email', twitchEmail)
        .not('email', 'like', '%@twitch.casi.app')

      // Try to find a subscription that might belong to this user
      // (This would require manual admin intervention or additional logic)
    }

    // Step 3: If we found a primary account, link them
    if (primaryAccount) {
      console.log(`🔗 Linking Twitch account ${twitchUserId} to primary account ${primaryAccount.email} (${matchReason})`)

      // Update the primary account's metadata with Twitch info
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        primaryAccount.id,
        {
          user_metadata: {
            ...primaryAccount.user_metadata,
            twitch_id: twitchUserId,
            twitch_linked: true,
            twitch_display_name: twitchUserData?.display_name,
            twitch_login: twitchUserData?.login,
            twitch_avatar: twitchUserData?.profile_image_url,
            twitch_linked_at: new Date().toISOString()
          }
        }
      )

      if (updateError) {
        console.error('Failed to update user metadata:', updateError)
      }

      // Transfer subscription from Twitch email to primary account email
      if (twitchSubscription) {
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({
            email: primaryAccount.email,
            updated_at: new Date().toISOString()
          })
          .eq('email', twitchEmail)

        if (subUpdateError) {
          console.error('Failed to transfer subscription:', subUpdateError)
        } else {
          console.log(`✅ Transferred subscription from ${twitchEmail} to ${primaryAccount.email}`)
        }
      }

      return NextResponse.json({
        success: true,
        linked: true,
        primaryAccount: {
          id: primaryAccount.id,
          email: primaryAccount.email
        },
        matchReason,
        subscriptionTransferred: !!twitchSubscription,
        message: 'Twitch account successfully linked to your primary account'
      })
    }

    // Step 4: No primary account found, this is a standalone Twitch login
    return NextResponse.json({
      success: true,
      linked: false,
      message: 'No existing account found to link. Proceeding with Twitch-only account.'
    })

  } catch (error) {
    console.error('[Link Twitch Account] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
