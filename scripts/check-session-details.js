#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSessions() {
  console.log('🔍 Checking sessions with Twitch ID 883991643 (conzooo_)...\n')

  const { data: sessions } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('streamer_email', '883991643@twitch.casi.app')
    .order('session_start', { ascending: false })

  sessions?.forEach((session) => {
    console.log('='.repeat(60))
    console.log(`📺 Channel: ${session.channel_name}`)
    console.log(`   Email: ${session.streamer_email}`)
    console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
    console.log(`   Duration: ${session.duration_minutes} min`)
    console.log(`   Total Messages: ${session.total_messages || 0}`)
    console.log('')
  })

  console.log('\n🔍 Checking sessions with email 625401838@twitch.casi.app (millzaatv)...\n')

  const { data: millzaaSessions } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('streamer_email', '625401838@twitch.casi.app')
    .order('session_start', { ascending: false })
    .limit(5)

  millzaaSessions?.forEach((session) => {
    console.log('='.repeat(60))
    console.log(`📺 Channel: ${session.channel_name}`)
    console.log(`   Email: ${session.streamer_email}`)
    console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
    console.log(`   Duration: ${session.duration_minutes} min`)
    console.log(`   Total Messages: ${session.total_messages || 0}`)
    console.log('')
  })
}

checkSessions().catch(console.error)
