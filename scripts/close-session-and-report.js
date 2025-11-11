#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SESSION_ID = process.argv[2]

if (!SESSION_ID) {
  console.error('❌ Usage: node close-session-and-report.js <session_id>')
  process.exit(1)
}

async function closeSessionAndReport() {
  console.log(`🔍 Fetching session ${SESSION_ID}...`)

  // Get session details
  const { data: session, error: sessionError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('id', SESSION_ID)
    .single()

  if (sessionError || !session) {
    console.error('❌ Session not found:', sessionError)
    process.exit(1)
  }

  console.log(`\n📺 Session Details:`)
  console.log(`   Channel: ${session.channel_name}`)
  console.log(`   Email: ${session.streamer_email}`)
  console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
  console.log(`   End: ${session.session_end || 'Ongoing'}`)
  console.log(`   Duration: ${session.duration_minutes || 0} minutes`)

  if (session.session_end) {
    console.log('\n⚠️  Session already ended!')
    console.log('   Do you still want to generate a report? (yes/no)')
    // For now, continue anyway
  }

  // Calculate duration if not ended
  let sessionEnd = session.session_end ? new Date(session.session_end) : new Date()
  let sessionStart = new Date(session.session_start)
  let durationMinutes =
    session.duration_minutes || Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000)

  console.log(
    `\n📊 Calculated Duration: ${durationMinutes} minutes (${(durationMinutes / 60).toFixed(1)} hours)`
  )

  // Update session if not ended
  if (!session.session_end) {
    console.log('\n🔄 Ending session...')
    const { error: updateError } = await supabase
      .from('stream_report_sessions')
      .update({
        session_end: sessionEnd.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', SESSION_ID)

    if (updateError) {
      console.error('❌ Failed to update session:', updateError)
      process.exit(1)
    }
    console.log('✅ Session ended')
  }

  // Generate report
  console.log('\n📧 Generating and sending report...')
  console.log(`   Email: ${session.streamer_email}`)

  const response = await fetch('http://localhost:3000/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      email: session.streamer_email,
    }),
  })

  const result = await response.json()

  if (response.ok) {
    console.log('✅ Report generated and sent successfully!')
    console.log(`   Sent to: ${session.streamer_email}`)
  } else {
    console.error('❌ Failed to generate report:', result.error || result)
  }
}

closeSessionAndReport().catch(console.error)
