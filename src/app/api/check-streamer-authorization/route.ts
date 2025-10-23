// API to check if a streamer has authorized the app
// Returns whether they have a stored access token (and thus full event access)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelName = searchParams.get('channelName')

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName parameter is required' },
        { status: 400 }
      )
    }

    // Find user by Twitch username (stored in preferred_username)
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users.find(u =>
      u.user_metadata?.preferred_username?.toLowerCase() === channelName.toLowerCase()
    )

    if (!user) {
      return NextResponse.json({
        authorized: false,
        hasAccount: false,
        message: `${channelName} has not created an account yet`
      })
    }

    const hasAccessToken = !!user.user_metadata?.twitch_access_token

    return NextResponse.json({
      authorized: hasAccessToken,
      hasAccount: true,
      twitchId: user.user_metadata?.twitch_id,
      message: hasAccessToken
        ? `${channelName} has authorized full event access`
        : `${channelName} needs to log in to authorize full event access`
    })

  } catch (error: any) {
    console.error('Check streamer authorization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
