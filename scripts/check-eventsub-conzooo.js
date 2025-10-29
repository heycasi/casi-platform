#!/usr/bin/env node

const https = require('https')
require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const ACCESS_TOKEN = 'kbyg1bofwkh47odtfrjaatxm9vqg41' // conzooo_'s token
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

async function checkEventSubSubscriptions() {
  console.log('🔍 Checking EventSub subscriptions for conzooo_...\n')

  const url = 'https://api.twitch.tv/helix/eventsub/subscriptions'
  const headers = {
    'Client-ID': CLIENT_ID,
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  }

  const response = await makeRequest(url, headers)

  const conzoSubs = response.data.filter(
    (sub) => sub.condition.broadcaster_user_id === BROADCASTER_ID
  )

  console.log(`📊 Total EventSub subscriptions: ${response.data.length}`)
  console.log(`🎯 Subscriptions for conzooo_: ${conzoSubs.length}\n`)

  if (conzoSubs.length === 0) {
    console.log('❌ NO EVENTSUB SUBSCRIPTIONS FOUND for conzooo_')
    console.log("\n💡 This is why you're not getting follow/sub notifications!")
    console.log('\nTo fix: Call /api/subscribe-user-events for conzooo_')
  } else {
    console.log('✅ Active subscriptions:')
    conzoSubs.forEach((sub) => {
      console.log(`  - ${sub.type} (${sub.status})`)
      console.log(`    Created: ${new Date(sub.created_at).toLocaleString()}`)
    })
  }
}

checkEventSubSubscriptions().catch(console.error)
