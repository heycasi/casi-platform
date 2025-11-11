#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const TWITCH_ID = process.argv[2] || '883991643'
const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN

async function checkTwitchId() {
  console.log(`🔍 Looking up Twitch ID: ${TWITCH_ID}...\n`)

  const response = await fetch(`https://api.twitch.tv/helix/users?id=${TWITCH_ID}`, {
    headers: {
      Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
      'Client-Id': CLIENT_ID,
    },
  })

  const data = await response.json()

  if (data.data && data.data.length > 0) {
    const user = data.data[0]
    console.log('✅ Found user:')
    console.log(`   Username: ${user.login}`)
    console.log(`   Display Name: ${user.display_name}`)
    console.log(`   Twitch ID: ${user.id}`)
    console.log(`   Profile: https://twitch.tv/${user.login}`)
  } else {
    console.log('❌ No user found with this Twitch ID')
    console.log('   This might be a deleted/banned account')
  }
}

checkTwitchId().catch(console.error)
