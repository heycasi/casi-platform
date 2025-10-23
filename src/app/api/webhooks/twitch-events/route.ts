// Twitch EventSub Webhook Handler
// Receives real-time events from Twitch (subs, follows, bits, raids)
// Docs: https://dev.twitch.tv/docs/eventsub/handling-webhook-events/

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TWITCH_WEBHOOK_SECRET = process.env.TWITCH_EVENTSUB_SECRET || 'your-secret-here'

// Verify Twitch signature
function verifyTwitchSignature(request: NextRequest, body: string): boolean {
  const messageId = request.headers.get('Twitch-Eventsub-Message-Id')
  const timestamp = request.headers.get('Twitch-Eventsub-Message-Timestamp')
  const signature = request.headers.get('Twitch-Eventsub-Message-Signature')

  if (!messageId || !timestamp || !signature) {
    return false
  }

  const message = messageId + timestamp + body
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', TWITCH_WEBHOOK_SECRET)
    .update(message)
    .digest('hex')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    // Verify Twitch signature
    if (!verifyTwitchSignature(request, body)) {
      console.error('❌ Invalid Twitch signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const messageType = request.headers.get('Twitch-Eventsub-Message-Type')

    // Handle webhook verification challenge
    if (messageType === 'webhook_callback_verification') {
      console.log('✅ Webhook verification challenge received')
      return new NextResponse(data.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Handle revocation
    if (messageType === 'revocation') {
      console.log('⚠️ Webhook revoked:', data.subscription)
      return NextResponse.json({ received: true })
    }

    // Handle notification
    if (messageType === 'notification') {
      const subscription = data.subscription
      const event = data.event

      console.log(`📩 Received ${subscription.type} event`)

      // Map event to our database structure
      let eventType = ''
      let eventData: any = {}
      let userId = ''
      let userName = ''
      let userDisplayName = ''

      switch (subscription.type) {
        case 'channel.subscribe':
          eventType = event.is_gift ? 'gift_sub' : 'subscription'
          userId = event.user_id
          userName = event.user_login
          userDisplayName = event.user_name
          eventData = {
            tier: event.tier,
            is_gift: event.is_gift || false
          }
          break

        case 'channel.subscription.message':
          eventType = 'resub'
          userId = event.user_id
          userName = event.user_login
          userDisplayName = event.user_name
          eventData = {
            tier: event.tier,
            cumulative_months: event.cumulative_months,
            streak_months: event.streak_months,
            duration_months: event.duration_months,
            message: event.message?.text || ''
          }
          break

        case 'channel.follow':
          eventType = 'follow'
          userId = event.user_id
          userName = event.user_login
          userDisplayName = event.user_name
          eventData = {
            followed_at: event.followed_at
          }
          break

        case 'channel.cheer':
          eventType = 'bits'
          userId = event.user_id || 'anonymous'
          userName = event.user_login || 'anonymous'
          userDisplayName = event.user_name || 'Anonymous'
          eventData = {
            amount: event.bits,
            message: event.message || '',
            is_anonymous: event.is_anonymous || false
          }
          break

        case 'channel.raid':
          eventType = 'raid'
          userId = event.from_broadcaster_user_id
          userName = event.from_broadcaster_user_login
          userDisplayName = event.from_broadcaster_user_name
          eventData = {
            viewer_count: event.viewers
          }
          break

        default:
          console.log(`⚠️ Unknown event type: ${subscription.type}`)
          return NextResponse.json({ received: true })
      }

      // Get broadcaster email from user_id
      const broadcasterId = event.broadcaster_user_id

      // Find the channel email by looking up Twitch user ID in auth metadata
      const { data: users } = await supabase.auth.admin.listUsers()
      const channelUser = users?.users.find(u =>
        u.user_metadata?.twitch_id === broadcasterId
      )

      if (!channelUser?.email) {
        console.error(`❌ Could not find channel email for broadcaster ID: ${broadcasterId}`)
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }

      // Store event in database
      const { error: insertError } = await supabase
        .from('stream_events')
        .insert({
          event_type: eventType,
          event_id: `${subscription.type}_${event.id || Date.now()}`,
          channel_email: channelUser.email,
          channel_name: event.broadcaster_user_login,
          user_id: userId,
          user_name: userName,
          user_display_name: userDisplayName,
          event_data: eventData,
          event_timestamp: new Date().toISOString()
        })

      if (insertError) {
        console.error('❌ Failed to store event:', insertError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log(`✅ Stored ${eventType} event from ${userDisplayName}`)
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ error: 'Unknown message type' }, { status: 400 })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: 'Twitch EventSub webhook endpoint',
    ready: true
  })
}
