#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendMillzaatvReport() {
  console.log("🔍 Finding millzaatv's most recent stream...\n")

  // Find millzaatv's session with messages (using specific session ID that has 530 messages)
  const { data: sessions, error: sessionError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('id', 'b5231257-5793-49b1-8579-3f54668a61b3') // Session from Oct 28 with 530 messages
    .limit(1)

  if (sessionError || !sessions || sessions.length === 0) {
    console.error('❌ Could not find any sessions for millzaatv')
    console.error('Error:', sessionError)
    process.exit(1)
  }

  const session = sessions[0]

  console.log('📺 Found Recent Stream:')
  console.log(`   Channel: ${session.channel_name}`)
  console.log(`   Session ID: ${session.id}`)
  console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
  console.log(
    `   End: ${session.session_end ? new Date(session.session_end).toLocaleString() : 'Ongoing'}`
  )
  console.log(`   Duration: ${session.duration_minutes || 0} minutes`)
  console.log()

  // Send email to connordahl@hotmail.com
  const recipientEmail = 'connordahl@hotmail.com'
  console.log(`📧 Sending report to ${recipientEmail}...`)

  try {
    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        email: recipientEmail,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Report generated and sent successfully!')
      console.log(`   Sent to: ${recipientEmail}`)
      console.log(
        `   Session: ${session.channel_name} - ${new Date(session.session_start).toLocaleDateString()}`
      )
    } else {
      console.error('❌ Failed to generate report:', result.error || result)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error sending report:', error.message)
    console.error('\n💡 Make sure the development server is running: npm run dev')
    process.exit(1)
  }
}

sendMillzaatvReport().catch(console.error)
