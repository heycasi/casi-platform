#!/usr/bin/env node

const https = require('https')
require('dotenv').config({ path: '.env.local' })

const BROADCASTER_ID = '883991643' // conzooo_
const ACCESS_TOKEN = 'yr774aiqcia5xluq1k29g309nc1wdg' // conzooo_'s current valid token

async function subscribeToEvents() {
  console.log('🚀 Subscribing conzooo_ to all EventSub events...\n')

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

  if (data.subscriptions && data.subscriptions.length > 0) {
    console.log('\n🎉 Successfully subscribed to:')
    data.subscriptions.forEach((sub) => {
      console.log(`  ✓ ${sub.type} (${sub.status}) - ID: ${sub.id}`)
    })
  }

  if (data.errors && data.errors.length > 0) {
    console.log('\n⚠️  Failed subscriptions:')
    data.errors.forEach((err) => {
      console.log(`  ✗ ${err.type}: ${err.error}`)
    })
  }

  console.log('\n📊 Summary:')
  console.log(`  Successful: ${data.subscriptions?.length || 0}`)
  console.log(`  Failed: ${data.errors?.length || 0}`)
}

subscribeToEvents().catch(console.error)
