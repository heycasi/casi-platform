#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMillzaatvStatus() {
  console.log('🔍 Checking MillzaaTV account status...\n')

  // Get all users to find millzaatv
  const { data: users } = await supabase.auth.admin.listUsers()

  // Find millzaatv by email or username
  const millzaatv = users?.users.find(
    (u) =>
      u.email?.toLowerCase().includes('millzaa') ||
      u.user_metadata?.preferred_username?.toLowerCase() === 'millzaatv' ||
      u.user_metadata?.display_name?.toLowerCase() === 'millzaatv'
  )

  if (!millzaatv) {
    console.error('❌ Could not find millzaatv user')
    return
  }

  console.log('📧 Email:', millzaatv.email)
  console.log('🆔 User ID:', millzaatv.id)
  console.log('🎮 Twitch Username:', millzaatv.user_metadata?.preferred_username)
  console.log('🎮 Twitch Display Name:', millzaatv.user_metadata?.display_name)
  console.log('🔢 Twitch ID:', millzaatv.user_metadata?.twitch_id)
  console.log('\n📝 User Metadata:', JSON.stringify(millzaatv.user_metadata, null, 2))

  console.log('\n🔑 Token Status:')
  console.log(
    '   Access Token:',
    millzaatv.user_metadata?.twitch_access_token
      ? '✅ Present (' + millzaatv.user_metadata.twitch_access_token.substring(0, 10) + '...)'
      : '❌ Missing'
  )
  console.log(
    '   Refresh Token:',
    millzaatv.user_metadata?.twitch_refresh_token ? '✅ Present' : '❌ Missing'
  )

  // Check if EventSub subscriptions exist for this broadcaster
  if (millzaatv.user_metadata?.twitch_id) {
    console.log('\n🔔 Checking EventSub subscriptions...')

    const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN
    const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID

    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/eventsub/subscriptions?user_id=${millzaatv.user_metadata.twitch_id}`,
        {
          headers: {
            Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
            'Client-Id': CLIENT_ID,
          },
        }
      )

      const data = await response.json()

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ Found ${data.data.length} subscriptions`)
        data.data.forEach((sub) => {
          console.log(`      - ${sub.type}: ${sub.status}`)
        })
      } else {
        console.log('   ❌ No EventSub subscriptions found for this broadcaster')
        console.log('   💡 Need to subscribe to events for millzaatv')
      }
    } catch (error) {
      console.error('   ❌ Error checking EventSub:', error.message)
    }
  }

  // Check stream_events table for recent events
  const { data: events, error: eventsError } = await supabase
    .from('stream_events')
    .select('*')
    .eq('channel_name', 'millzaatv')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n📊 Recent Events:')
  if (eventsError) {
    console.error('   ❌ Error fetching events:', eventsError.message)
  } else if (!events || events.length === 0) {
    console.log('   ⚠️  No events found for millzaatv')
  } else {
    console.log(`   ✅ Found ${events.length} recent events`)
    events.forEach((e) => {
      console.log(
        `      - ${e.event_type} from ${e.user_display_name} at ${new Date(e.created_at).toLocaleString()}`
      )
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('DIAGNOSIS:')
  console.log('='.repeat(60))

  if (!millzaatv.user_metadata?.twitch_access_token) {
    console.log('❌ ISSUE: No access token found')
    console.log('   FIX: Millzaatv needs to log out and back in')
  } else {
    console.log('✅ Access token is present')
    console.log('⚠️  If Activity Feed still shows "Limited Event Access":')
    console.log('   1. Check if EventSub subscriptions exist (see above)')
    console.log('   2. Verify the Activity Feed is checking the correct user')
    console.log('   3. Check browser console for errors')
  }
}

checkMillzaatvStatus().catch(console.error)
