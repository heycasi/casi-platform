// Admin API to set up raid subscriptions for any streamer
// Uses app access token so no user authorization required
// Only creates raid events - other events require user authorization

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!
const WEBHOOK_URL = 'https://www.heycasi.com/api/webhooks/twitch-events'
const WEBHOOK_SECRET = process.env.TWITCH_EVENTSUB_SECRET!

async function getAppAccessToken() {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`
  })
  const data = await response.json()
  return data.access_token
}

async function getTwitchUserId(username: string, accessToken: string): Promise<string | null> {
  const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': CLIENT_ID
    }
  })
  const data = await response.json()
  return data.data?.[0]?.id || null
}

async function checkExistingSubscription(
  accessToken: string,
  broadcasterUserId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?type=channel.raid`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': CLIENT_ID
      }
    }
  )
  const data = await response.json()

  // Check if there's already a raid subscription for this broadcaster
  const existing = data.data?.find((sub: any) =>
    sub.condition.to_broadcaster_user_id === broadcasterUserId &&
    (sub.status === 'enabled' || sub.status === 'webhook_callback_verification_pending')
  )

  return !!existing
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { channelName } = await request.json()

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName is required' },
        { status: 400 }
      )
    }

    // Get app access token
    const accessToken = await getAppAccessToken()

    // Get Twitch user ID from username
    const broadcasterUserId = await getTwitchUserId(channelName, accessToken)

    if (!broadcasterUserId) {
      return NextResponse.json(
        { error: 'Twitch user not found' },
        { status: 404 }
      )
    }

    // Check if subscription already exists
    const exists = await checkExistingSubscription(accessToken, broadcasterUserId)

    if (exists) {
      return NextResponse.json({
        success: true,
        message: 'Raid subscription already exists',
        broadcaster_user_id: broadcasterUserId,
        subscription: { type: 'channel.raid', status: 'enabled' }
      })
    }

    // Create raid subscription (works with app token)
    const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'channel.raid',
        version: '1',
        condition: { to_broadcaster_user_id: broadcasterUserId },
        transport: {
          method: 'webhook',
          callback: WEBHOOK_URL,
          secret: WEBHOOK_SECRET
        }
      })
    })

    const data = await response.json()

    if (response.ok && data.data?.[0]) {
      console.log(`✅ Admin created raid subscription for ${channelName} (${broadcasterUserId})`)
      return NextResponse.json({
        success: true,
        broadcaster_user_id: broadcasterUserId,
        subscription: {
          type: 'channel.raid',
          status: data.data[0].status,
          id: data.data[0].id
        }
      })
    } else {
      console.error(`❌ Failed to create raid subscription:`, data)
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to create subscription' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Admin setup-raid-subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
