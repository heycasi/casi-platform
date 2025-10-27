#!/usr/bin/env node

// Check if fifakillvizualz session data exists and optionally generate report
// Usage: node scripts/check-fifakillvizualz-session.js [--generate-report]

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const shouldGenerateReport = process.argv.includes('--generate-report')

  console.log('🔍 Checking for fifakillvizualz sessions...\n')

  // Find all sessions for fifakillvizualz
  const { data: sessions, error: sessionsError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('channel_name', 'fifakillvizualz')
    .order('session_start', { ascending: false })

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError)
    return
  }

  if (!sessions || sessions.length === 0) {
    console.log('❌ No sessions found for fifakillvizualz')
    return
  }

  console.log(`✅ Found ${sessions.length} session(s) for fifakillvizualz:\n`)

  for (const session of sessions) {
    console.log(`📊 Session ID: ${session.id}`)
    console.log(`   Channel: ${session.channel_name}`)
    console.log(`   Platform: ${session.platform || 'twitch (default)'}`)
    console.log(`   Started: ${new Date(session.session_start).toLocaleString()}`)
    console.log(
      `   Ended: ${session.session_end ? new Date(session.session_end).toLocaleString() : 'Still active'}`
    )
    console.log(`   Duration: ${session.duration_minutes || 0} minutes`)
    console.log(`   Report Generated: ${session.report_generated ? 'Yes' : 'No'}`)
    console.log(`   Report Sent: ${session.report_sent ? 'Yes' : 'No'}`)

    // Get message count for this session
    const { data: messages, error: messagesError } = await supabase
      .from('stream_chat_messages')
      .select('id, platform', { count: 'exact' })
      .eq('session_id', session.id)

    if (messagesError) {
      console.log(`   ❌ Error fetching messages: ${messagesError.message}`)
    } else {
      console.log(`   💬 Messages: ${messages?.length || 0}`)

      // Count by platform
      if (messages && messages.length > 0) {
        const platformCounts = messages.reduce((acc, msg) => {
          const platform = msg.platform || 'twitch'
          acc[platform] = (acc[platform] || 0) + 1
          return acc
        }, {})

        console.log(`   Platform breakdown:`)
        for (const [platform, count] of Object.entries(platformCounts)) {
          const icon = platform === 'kick' ? '🟢' : '🟣'
          console.log(`      ${icon} ${platform}: ${count} messages`)
        }
      }
    }

    console.log('')
  }

  // Find the most recent session
  const latestSession = sessions[0]

  if (shouldGenerateReport) {
    console.log(`\n📧 Generating report for most recent session: ${latestSession.id}`)

    // Get your email from subscriptions
    const { data: adminUser, error: adminError } = await supabase
      .from('subscriptions')
      .select('email')
      .ilike('email', '%conzo%')
      .single()

    if (adminError || !adminUser) {
      console.error('❌ Could not find admin email:', adminError)
      return
    }

    console.log(`   Sending to: ${adminUser.email}`)

    // Call the generate report API
    try {
      const response = await fetch('http://localhost:3000/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: latestSession.id,
          email: adminUser.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Report generated and sent successfully!')
      } else {
        console.error('❌ Failed to generate report:', result.error)
      }
    } catch (error) {
      console.error('❌ Error calling API:', error.message)
    }
  } else {
    console.log(`\n💡 To generate a report for the most recent session, run:`)
    console.log(`   node scripts/check-fifakillvizualz-session.js --generate-report`)
  }
}

main().catch(console.error)
