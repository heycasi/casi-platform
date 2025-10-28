// API endpoint to update user tokens in user_metadata
// This uses service role to ensure permissions

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, twitchUserId, tokens, userData } = await request.json()

    if (!tokens || !userData) {
      return NextResponse.json({ error: 'tokens and userData are required' }, { status: 400 })
    }

    console.log('🔄 Updating tokens for Twitch user:', userData.login, twitchUserId || userId)

    // Find the Supabase user by Twitch ID
    let supabaseUserId = userId

    if (!supabaseUserId && twitchUserId) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find((u) => u.user_metadata?.twitch_id === twitchUserId)
      supabaseUserId = user?.id

      if (!supabaseUserId) {
        return NextResponse.json(
          { error: 'User not found with Twitch ID: ' + twitchUserId },
          { status: 404 }
        )
      }

      console.log('✅ Found Supabase user ID:', supabaseUserId, 'for Twitch ID:', twitchUserId)
    }

    // Update user metadata with service role (has full permissions)
    const { data, error } = await supabase.auth.admin.updateUserById(supabaseUserId, {
      user_metadata: {
        twitch_access_token: tokens.access_token,
        twitch_refresh_token: tokens.refresh_token,
        twitch_id: userData.id,
        display_name: userData.display_name,
        preferred_username: userData.login,
        avatar_url: userData.profile_image_url,
      },
    })

    if (error) {
      console.error('❌ Failed to update user metadata:', error)
      return NextResponse.json(
        { error: 'Failed to update user metadata', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ User metadata updated successfully:', {
      userId,
      username: userData.login,
      hasAccessToken: !!data?.user?.user_metadata?.twitch_access_token,
      hasRefreshToken: !!data?.user?.user_metadata?.twitch_refresh_token,
    })

    return NextResponse.json({
      success: true,
      hasAccessToken: !!data?.user?.user_metadata?.twitch_access_token,
      hasRefreshToken: !!data?.user?.user_metadata?.twitch_refresh_token,
    })
  } catch (error: any) {
    console.error('Update tokens error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
