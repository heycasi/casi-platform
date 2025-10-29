#!/usr/bin/env node

const https = require('https')
require('dotenv').config({ path: '.env.local' })

const BROADCASTER_ID = '883991643' // conzooo_
const ACCESS_TOKEN = 'yr774aiqcia5xluq1k29g309nc1wdg' // conzooo_'s token

async function subscribeToGiftSubs() {
  console.log('🎁 Subscribing conzooo_ to gift sub events...\n')

  const response = await fetch('http://localhost:3000/api/subscribe-user-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      broadcaster_user_id: BROADCASTER_ID,
      user_access_token: ACCESS_TOKEN,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Subscription failed:', data)
    process.exit(1)
  }

  console.log('✅ Subscription response:', JSON.stringify(data, null, 2))

  // Find the gift sub subscription
  const giftSubSub = data.subscriptions?.find((sub) => sub.type === 'channel.subscription.gift')

  if (giftSubSub) {
    console.log('\n🎉 Successfully subscribed to gift subs:')
    console.log(`  ✓ ${giftSubSub.type} (${giftSubSub.status}) - ID: ${giftSubSub.id}`)
  } else {
    const giftSubError = data.errors?.find((err) => err.type === 'channel.subscription.gift')
    if (giftSubError) {
      console.log('\n⚠️  Failed to subscribe to gift subs:')
      console.log(`  ✗ ${giftSubError.type}: ${giftSubError.error}`)
    }
  }
}

subscribeToGiftSubs().catch(console.error)
