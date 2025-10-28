// API to subscribe to Twitch EventSub for a specific user
// Called when a user signs up or links their Twitch account
// Uses the user's access token to create subscriptions that require authorization

import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
const WEBHOOK_URL = 'https://www.heycasi.com/api/webhooks/twitch-events'
const WEBHOOK_SECRET = process.env.TWITCH_EVENTSUB_SECRET!

async function subscribeToEvent(eventType: string, version: string, condition: any) {
  // Use app access token for webhook subscriptions (required by Twitch)
  const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN!

  const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
      'Client-Id': CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: eventType,
      version: version,
      condition: condition,
      transport: {
        method: 'webhook',
        callback: WEBHOOK_URL,
        secret: WEBHOOK_SECRET,
      },
    }),
  })

  const data = await response.json()
  return { response, data }
}

export async function POST(request: NextRequest) {
  try {
    const { broadcaster_user_id, user_access_token } = await request.json()

    if (!broadcaster_user_id) {
      return NextResponse.json({ error: 'broadcaster_user_id is required' }, { status: 400 })
    }

    if (!user_access_token) {
      return NextResponse.json({ error: 'user_access_token is required' }, { status: 400 })
    }

    const subscriptions = []
    const errors = []

    // channel.subscribe
    try {
      const { response, data } = await subscribeToEvent('channel.subscribe', '1', {
        broadcaster_user_id,
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.subscribe',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.subscribe',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.subscribe', error: error.message })
    }

    // channel.subscription.message (resubs)
    try {
      const { response, data } = await subscribeToEvent('channel.subscription.message', '1', {
        broadcaster_user_id,
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.subscription.message',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.subscription.message',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.subscription.message', error: error.message })
    }

    // channel.subscription.gift (gifted subs)
    try {
      const { response, data } = await subscribeToEvent('channel.subscription.gift', '1', {
        broadcaster_user_id,
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.subscription.gift',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.subscription.gift',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.subscription.gift', error: error.message })
    }

    // channel.follow
    try {
      const { response, data } = await subscribeToEvent('channel.follow', '2', {
        broadcaster_user_id,
        moderator_user_id: broadcaster_user_id, // User must be moderator of their own channel
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.follow',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.follow',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.follow', error: error.message })
    }

    // channel.cheer
    try {
      const { response, data } = await subscribeToEvent('channel.cheer', '1', {
        broadcaster_user_id,
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.cheer',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.cheer',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.cheer', error: error.message })
    }

    // channel.raid
    try {
      const { response, data } = await subscribeToEvent('channel.raid', '1', {
        to_broadcaster_user_id: broadcaster_user_id,
      })

      if (response.ok && data.data?.[0]) {
        subscriptions.push({
          type: 'channel.raid',
          status: data.data[0].status,
          id: data.data[0].id,
        })
      } else {
        errors.push({
          type: 'channel.raid',
          error: data.message || data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      errors.push({ type: 'channel.raid', error: error.message })
    }

    console.log(`✅ EventSub subscriptions created for broadcaster ${broadcaster_user_id}`)
    console.log(`   Successful: ${subscriptions.length}`)
    console.log(`   Failed: ${errors.length}`)

    return NextResponse.json({
      success: subscriptions.length > 0,
      broadcaster_user_id,
      subscriptions,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Failed to subscribe to events:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to events', details: error.message },
      { status: 500 }
    )
  }
}
