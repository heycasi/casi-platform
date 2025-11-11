#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findSessionsWithMessages() {
  // Get recent sessions
  const { data: sessions, error } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .order('session_start', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!sessions || sessions.length === 0) {
    console.log('No sessions found')
    return
  }

  console.log('Recent sessions:\n')

  // For each session, count the messages
  for (const session of sessions) {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    console.log(`  - ${session.channel_name}: ${count || 0} messages`)
    console.log(`    Session ID: ${session.id}`)
    console.log(`    Date: ${new Date(session.session_start).toLocaleString()}`)
    console.log(`    Duration: ${session.duration_minutes || 0} minutes`)
    if (count && count > 0) {
      console.log(`    ✓ Has messages!`)
    }
    console.log()
  }
}

findSessionsWithMessages().catch(console.error)
