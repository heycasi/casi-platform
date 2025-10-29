#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN.replace(/"/g, '')
const WEBHOOK_SECRET = process.env.TWITCH_EVENTSUB_SECRET
const BROADCASTER_ID = '883991643' // conzooo_

async function subscribeToGiftSubs() {
  console.log('🎁 Subscribing to channel.subscription.gift event...\n')

  const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      Authorization: `Bearer ${APP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'channel.subscription.gift',
      version: '1',
      condition: {
        broadcaster_user_id: BROADCASTER_ID,
      },
      transport: {
        method: 'webhook',
        callback: 'https://www.heycasi.com/api/webhooks/twitch-events',
        secret: WEBHOOK_SECRET,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Failed to subscribe:', data)
    process.exit(1)
  }

  console.log('✅ Subscription created:')
  console.log('  Type:', data.data[0].type)
  console.log('  Status:', data.data[0].status)
  console.log('  ID:', data.data[0].id)
  console.log('  Created:', new Date(data.data[0].created_at).toLocaleString())
}

subscribeToGiftSubs().catch(console.error)
