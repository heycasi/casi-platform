// scripts/debug-ingestion.js
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIngestion() {
  console.log('🔍 Starting Ingestion Diagnostics...\n')

  // 1. Check Recent Stream Sessions
  console.log('1️⃣ Checking Recent Stream Sessions (last 5)...')
  const { data: sessions, error: sessionError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .order('session_start', { ascending: false })
    .limit(5)

  if (sessionError) {
    console.error('❌ Error fetching sessions:', sessionError.message)
  } else if (!sessions || sessions.length === 0) {
    console.log('⚠️ No sessions found.')
  } else {
    console.table(
      sessions.map((s) => ({
        id: s.id,
        channel: s.channel_name,
        start: new Date(s.session_start).toLocaleString(),
        end: s.session_end ? new Date(s.session_end).toLocaleString() : 'ACTIVE',
        msgs_count: s.total_messages,
      }))
    )

    // 2. Deep Dive into the most recent ACTIVE or last session
    const activeSession = sessions.find((s) => !s.session_end) || sessions[0]
    if (activeSession) {
      console.log(`\n🔎 Inspecting Session: ${activeSession.id} (${activeSession.channel_name})`)

      // Check message count in `stream_chat_messages`
      const { count, error: msgError } = await supabase
        .from('stream_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', activeSession.id)

      if (msgError) console.error('❌ Error counting messages:', msgError.message)
      else console.log(`   👉 Real Message Count (stream_chat_messages table): ${count}`)
      console.log(`   👉 Cached Message Count (session record): ${activeSession.total_messages}`)

      if (count !== activeSession.total_messages) {
        console.warn('   ⚠️ Mismatch detected between real count and cached session count.')
      }
    }
  }

  // 3. Check for any 'stream.offline' or similar events in `stream_events`
  console.log('\n2️⃣ Checking Recent Webhook Events (stream_events table)...')
  const { data: events, error: eventError } = await supabase
    .from('stream_events')
    .select('event_type, channel_name, event_timestamp')
    // Checking for both standard event types and potential raw types
    .in('event_type', ['stream.online', 'stream.offline', 'stream-online', 'stream-offline'])
    .order('event_timestamp', { ascending: false })
    .limit(10)

  if (eventError) {
    console.error('❌ Error fetching events:', eventError.message)
  } else if (!events || events.length === 0) {
    console.log('⚠️ No stream.online/offline events found recently.')
  } else {
    console.table(events)
  }

  console.log('\n✅ Diagnostics Complete.')
}

checkIngestion()
