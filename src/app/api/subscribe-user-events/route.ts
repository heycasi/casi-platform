// API to subscribe to Twitch EventSub for a specific user
// Called when a user signs up or links their Twitch account

import { NextRequest, NextResponse } from 'next/server'

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

async function subscribeToEvent(
  accessToken: string,
  eventType: string,
  version: string,
  condition: any
) {
  const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': CLIENT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: eventType,
      version: version,
      condition: condition,
      transport: {
        method: 'webhook',
        callback: WEBHOOK_URL,
        secret: WEBHOOK_SECRET
      }
    })
  })

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { broadcaster_user_id } = await request.json()

    if (!broadcaster_user_id) {
      return NextResponse.json(
        { error: 'broadcaster_user_id is required' },
        { status: 400 }
      )
    }

    // Get app access token
    const accessToken = await getAppAccessToken()

    // Subscribe to events
    const subscriptions = []
    const errors = []

    // channel.subscribe
    try {
      const result = await subscribeToEvent(accessToken, 'channel.subscribe', '1', {
        broadcaster_user_id
      })
      subscriptions.push({ type: 'channel.subscribe', status: result.data?.[0]?.status || 'success' })
    } catch (error: any) {
      errors.push({ type: 'channel.subscribe', error: error.message })
    }

    // channel.subscription.message (resubs)
    try {
      const result = await subscribeToEvent(accessToken, 'channel.subscription.message', '1', {
        broadcaster_user_id
      })
      subscriptions.push({ type: 'channel.subscription.message', status: result.data?.[0]?.status || 'success' })
    } catch (error: any) {
      errors.push({ type: 'channel.subscription.message', error: error.message })
    }

    // channel.raid
    try {
      const result = await subscribeToEvent(accessToken, 'channel.raid', '1', {
        to_broadcaster_user_id: broadcaster_user_id
      })
      subscriptions.push({ type: 'channel.raid', status: result.data?.[0]?.status || 'success' })
    } catch (error: any) {
      errors.push({ type: 'channel.raid', error: error.message })
    }

    return NextResponse.json({
      success: true,
      broadcaster_user_id,
      subscriptions,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Failed to subscribe to events:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to events', details: error.message },
      { status: 500 }
    )
  }
}
