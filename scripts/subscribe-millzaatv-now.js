#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN
const WEBHOOK_URL = 'https://www.heycasi.com/api/webhooks/twitch-events'
const WEBHOOK_SECRET = process.env.TWITCH_EVENTSUB_SECRET

async function subscribeMillzaatv() {
  console.log('🔔 Subscribing millzaatv to EventSub...\n')

  // Get millzaatv's Twitch ID
  const BROADCASTER_ID = '625401838'

  const events = [
    { type: 'channel.subscribe', version: '1' },
    { type: 'channel.subscription.message', version: '1' },
    { type: 'channel.subscription.gift', version: '1' },
    { type: 'channel.follow', version: '2', needsModerator: true },
    { type: 'channel.cheer', version: '1' },
    { type: 'channel.raid', version: '1', useToField: true },
  ]

  const results = []

  for (const event of events) {
    console.log(`📌 Subscribing to ${event.type}...`)

    const condition = event.useToField
      ? { to_broadcaster_user_id: BROADCASTER_ID }
      : event.needsModerator
        ? { broadcaster_user_id: BROADCASTER_ID, moderator_user_id: BROADCASTER_ID }
        : { broadcaster_user_id: BROADCASTER_ID }

    try {
      const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
          'Client-Id': CLIENT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: event.type,
          version: event.version,
          condition: condition,
          transport: {
            method: 'webhook',
            callback: WEBHOOK_URL,
            secret: WEBHOOK_SECRET,
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.data?.[0]) {
        console.log(`   ✅ ${data.data[0].status}`)
        results.push({ type: event.type, status: 'success', id: data.data[0].id })
      } else {
        console.log(`   ❌ ${data.message || data.error || 'Failed'}`)
        results.push({ type: event.type, status: 'failed', error: data.message })
      }
    } catch (error) {
      console.log(`   ❌ ${error.message}`)
      results.push({ type: event.type, status: 'error', error: error.message })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.status === 'success').length
  const failed = results.filter((r) => r.status !== 'success').length

  console.log(`✅ Successful: ${successful}/6`)
  console.log(`❌ Failed: ${failed}/6`)

  if (successful > 0) {
    console.log('\n🎉 MillzaaTV is now subscribed to EventSub!')
    console.log('Gift subs should now appear in Activity Feed')
  } else {
    console.log('\n⚠️  No subscriptions created - check errors above')
  }
}

subscribeMillzaatv().catch(console.error)
