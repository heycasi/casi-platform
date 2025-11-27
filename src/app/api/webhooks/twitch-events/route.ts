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
  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', TWITCH_WEBHOOK_SECRET).update(message).digest('hex')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    const messageType = request.headers.get('Twitch-Eventsub-Message-Type')

    // Handle webhook verification challenge FIRST (before signature check)
    if (messageType === 'webhook_callback_verification') {
      console.log('✅ Webhook verification challenge received')
      console.log('Headers:', {
        messageId: request.headers.get('Twitch-Eventsub-Message-Id'),
        timestamp: request.headers.get('Twitch-Eventsub-Message-Timestamp'),
        signature: request.headers.get('Twitch-Eventsub-Message-Signature'),
      })
      console.log('Body length:', body.length)
      console.log('Has secret:', !!process.env.TWITCH_EVENTSUB_SECRET)
      console.log('Secret length:', process.env.TWITCH_EVENTSUB_SECRET?.length)

      // Verify signature for the challenge
      if (!verifyTwitchSignature(request, body)) {
        console.error('❌ Invalid Twitch signature for verification challenge')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
      console.log('✅ Signature verified successfully!')
      return new NextResponse(data.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    // Verify Twitch signature for all other message types
    if (!verifyTwitchSignature(request, body)) {
      console.error('❌ Invalid Twitch signature')
      console.error('Message Type:', messageType)
      console.error('Has Secret:', !!process.env.TWITCH_EVENTSUB_SECRET)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
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
          // For gifted subs, store the recipient info
          if (event.is_gift) {
            eventType = 'gift_sub_received'
            userId = event.user_id
            userName = event.user_login
            userDisplayName = event.user_name
            eventData = {
              tier: event.tier,
              is_gift: true,
              recipient_id: event.user_id,
              recipient_login: event.user_login,
              recipient_name: event.user_name,
            }
          } else {
            eventType = 'subscription'
            userId = event.user_id
            userName = event.user_login
            userDisplayName = event.user_name
            eventData = {
              tier: event.tier,
              is_gift: false,
            }
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
            message: event.message?.text || '',
          }
          break

        case 'channel.subscription.gift':
          eventType = 'gift_sub'
          // This event shows the gifter, not individual recipients
          userId = event.user_id || 'anonymous'
          userName = event.user_login || 'anonymous'
          userDisplayName = event.user_name || 'Anonymous'
          eventData = {
            tier: event.tier,
            total: event.total, // Number of subs gifted in this event
            cumulative_total: event.cumulative_total, // Total subs ever gifted by this user
            is_anonymous: event.is_anonymous || false,
            gifter_id: event.user_id,
            gifter_login: event.user_login,
            gifter_name: event.user_name,
          }
          break

        case 'channel.follow':
          eventType = 'follow'
          userId = event.user_id
          userName = event.user_login
          userDisplayName = event.user_name
          eventData = {
            followed_at: event.followed_at,
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
            is_anonymous: event.is_anonymous || false,
          }
          break

        case 'channel.raid':
          eventType = 'raid'
          userId = event.from_broadcaster_user_id
          userName = event.from_broadcaster_user_login
          userDisplayName = event.from_broadcaster_user_name
          eventData = {
            viewer_count: event.viewers,
          }
          break

        case 'stream.offline':
          console.log(
            `🔴 Stream offline event received for broadcaster: ${event.broadcaster_user_login}`
          )
          const offlineBroadcasterId = event.broadcaster_user_id

          // Find the active session for this channel
          const { data: activeSession, error: sessionError } = await supabase
            .from('stream_report_sessions')
            .select('id')
            .eq('channel_name', event.broadcaster_user_login.toLowerCase())
            .is('session_end', null) // Only consider active sessions
            .order('session_start', { ascending: false })
            .limit(1)
            .single()

          if (sessionError || !activeSession) {
            console.error(
              `❌ Could not find active session for offline stream: ${event.broadcaster_user_login}`,
              sessionError
            )
            return NextResponse.json({ received: true })
          }

          // Update session with end time
          const { error: updateSessionError } = await supabase
            .from('stream_report_sessions')
            .update({ session_end: new Date().toISOString() })
            .eq('id', activeSession.id)

          if (updateSessionError) {
            console.error(
              `❌ Failed to update session ${activeSession.id} with end time:`,
              updateSessionError
            )
            return NextResponse.json({ received: true })
          }

          console.log(`✅ Session ${activeSession.id} closed for ${event.broadcaster_user_login}`)
          return NextResponse.json({ received: true })

        default:
          console.log(`⚠️ Unknown event type: ${subscription.type}`)
          return NextResponse.json({ received: true })
      }

      // Get broadcaster email from user_id
      const broadcasterId = event.broadcaster_user_id

      // For stream.offline events, we don't need to store a new stream_event record
      // The session closure is the primary action. So we exit early.
      if (subscription.type === 'stream.offline') {
        return NextResponse.json({ received: true })
      }

      // Find the channel email by looking up Twitch user ID in auth metadata
      const { data: users } = await supabase.auth.admin.listUsers()
      const channelUser = users?.users.find((u) => u.user_metadata?.twitch_id === broadcasterId)

      if (!channelUser?.email) {
        console.error(`❌ Could not find channel email for broadcaster ID: ${broadcasterId}`)
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }

      // Store event in database
      const { error: insertError } = await supabase.from('stream_events').insert({
        event_type: eventType,
        event_id: `${subscription.type}_${event.id || Date.now()}`,
        channel_email: channelUser.email,
        channel_name: event.broadcaster_user_login,
        user_id: userId,
        user_name: userName,
        user_display_name: userDisplayName,
        event_data: eventData,
        event_timestamp: new Date().toISOString(),
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
    ready: true,
  })
}
