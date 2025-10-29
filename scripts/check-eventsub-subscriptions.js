#!/usr/bin/env node

const https = require('https')
require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN.replace(/"/g, '')
const BROADCASTER_ID = '883991643' // conzooo_

function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(JSON.parse(data)))
      })
      .on('error', reject)
  })
}

async function checkSubscriptions() {
  console.log('🔍 Checking all EventSub subscriptions...\n')

  const url = 'https://api.twitch.tv/helix/eventsub/subscriptions'
  const headers = {
    'Client-ID': CLIENT_ID,
    Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
  }

  const response = await makeRequest(url, headers)

  console.log(`📊 Total EventSub subscriptions: ${response.data.length}\n`)

  // Filter for conzooo_'s subscriptions
  const conzoooSubs = response.data.filter((sub) => {
    const condition = sub.condition
    return (
      condition.broadcaster_user_id === BROADCASTER_ID ||
      condition.to_broadcaster_user_id === BROADCASTER_ID ||
      condition.moderator_user_id === BROADCASTER_ID
    )
  })

  console.log(`🎯 Subscriptions for conzooo_ (${BROADCASTER_ID}): ${conzoooSubs.length}\n`)

  if (conzoooSubs.length === 0) {
    console.log('❌ No subscriptions found for conzooo_')
  } else {
    console.log('✅ Active subscriptions:')
    conzoooSubs.forEach((sub) => {
      const statusEmoji =
        sub.status === 'enabled'
          ? '✅'
          : sub.status === 'webhook_callback_verification_pending'
            ? '⏳'
            : '❌'
      console.log(`  ${statusEmoji} ${sub.type}`)
      console.log(`     Status: ${sub.status}`)
      console.log(`     ID: ${sub.id}`)
      console.log(`     Created: ${new Date(sub.created_at).toLocaleString()}`)
      console.log(`     Callback: ${sub.transport.callback}`)
      console.log('')
    })
  }

  // Show all subscriptions
  console.log('\n📋 All subscriptions in system:')
  response.data.forEach((sub) => {
    console.log(
      `  - ${sub.type} (${sub.status}) - Broadcaster: ${sub.condition.broadcaster_user_id || sub.condition.to_broadcaster_user_id || 'N/A'}`
    )
  })
}

checkSubscriptions().catch(console.error)
