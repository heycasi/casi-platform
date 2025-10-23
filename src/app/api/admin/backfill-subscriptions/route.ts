// Admin endpoint to backfill event subscriptions for existing users
// GET /api/admin/backfill-subscriptions

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!
const WEBHOOK_URL = 'https://heycasi.com/api/webhooks/twitch-events'
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

async function subscribeToEvents(accessToken: string, broadcasterUserId: string) {
  const events = [
    { type: 'channel.subscribe', version: '1', condition: { broadcaster_user_id: broadcasterUserId } },
    { type: 'channel.subscription.message', version: '1', condition: { broadcaster_user_id: broadcasterUserId } },
    { type: 'channel.raid', version: '1', condition: { to_broadcaster_user_id: broadcasterUserId } }
  ]

  const results = []

  for (const event of events) {
    try {
      const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': CLIENT_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: event.type,
          version: event.version,
          condition: event.condition,
          transport: {
            method: 'webhook',
            callback: WEBHOOK_URL,
            secret: WEBHOOK_SECRET
          }
        })
      })

      const data = await response.json()
      results.push({
        type: event.type,
        success: response.ok,
        status: data.data?.[0]?.status || data.error || 'unknown'
      })

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: any) {
      results.push({
        type: event.type,
        success: false,
        error: error.message
      })
    }
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    // Get all users with Twitch IDs
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const twitchUsers = users.users
      .filter(u => u.user_metadata?.twitch_id)
      .map(u => ({
        id: u.id,
        twitch_id: u.user_metadata.twitch_id,
        username: u.user_metadata.preferred_username || u.user_metadata.display_name,
        email: u.email
      }))

    console.log(`Found ${twitchUsers.length} users with Twitch accounts`)

    // Get app access token
    const accessToken = await getAppAccessToken()

    // Subscribe each user
    const results = []
    for (const user of twitchUsers) {
      console.log(`Subscribing events for ${user.username} (${user.twitch_id})...`)

      const subscriptions = await subscribeToEvents(accessToken, user.twitch_id)

      results.push({
        user: user.username,
        twitch_id: user.twitch_id,
        email: user.email,
        subscriptions
      })

      // Rate limit between users
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const successCount = results.filter(r =>
      r.subscriptions.every(s => s.success)
    ).length

    return NextResponse.json({
      success: true,
      total_users: twitchUsers.length,
      successful: successCount,
      failed: twitchUsers.length - successCount,
      results
    })

  } catch (error: any) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      { error: 'Backfill failed', details: error.message },
      { status: 500 }
    )
  }
}
