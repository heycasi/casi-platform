#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN
const MILLZAATV_TWITCH_ID = '625401838'

async function checkMillzaatvEventSub() {
  console.log('🔔 Checking EventSub subscriptions for millzaatv...\n')

  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?user_id=${MILLZAATV_TWITCH_ID}`,
    {
      headers: {
        Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
        'Client-Id': CLIENT_ID,
      },
    }
  )

  const data = await response.json()

  console.log('Response status:', response.status)

  if (data.data && data.data.length > 0) {
    console.log(`\n✅ Found ${data.data.length} EventSub subscriptions:\n`)
    data.data.forEach((sub) => {
      console.log(`📌 ${sub.type}`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   ID: ${sub.id}`)
      console.log(`   Created: ${sub.created_at}`)
      console.log('')
    })
  } else {
    console.log('\n❌ NO EventSub subscriptions found for millzaatv!')
    console.log('   This is why events are not showing in Activity Feed')
    console.log('\n   SOLUTION: Run subscription script:')
    console.log('   node scripts/create-subscription.sh 625401838')
  }

  // Also check stream_events table
  const { createClient } = require('@supabase/supabase-js')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: events } = await supabase
    .from('stream_events')
    .select('*')
    .eq('channel_name', 'millzaatv')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n📊 Recent events in database:')
  if (events && events.length > 0) {
    events.forEach((e) => {
      console.log(
        `   - ${e.event_type} from ${e.user_display_name} at ${new Date(e.created_at).toLocaleString()}`
      )
    })
  } else {
    console.log('   ⚠️  No events in database')
  }
}

checkMillzaatvEventSub().catch(console.error)
