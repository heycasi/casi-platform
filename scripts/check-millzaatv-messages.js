#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMillzaatvMessages() {
  console.log('🔍 Checking millzaatv messages and sessions...\n')

  // Check all sessions for millzaatv
  const { data: sessions, error: sessionsError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('channel_name', 'millzaatv')
    .order('session_start', { ascending: false })

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError)
    return
  }

  console.log(`Found ${sessions?.length || 0} sessions for millzaatv\n`)

  for (const session of sessions || []) {
    console.log('='.repeat(60))
    console.log(`📺 Session: ${session.id}`)
    console.log(`   Channel: ${session.channel_name}`)
    console.log(`   Email: ${session.streamer_email}`)
    console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
    console.log(
      `   End: ${session.session_end ? new Date(session.session_end).toLocaleString() : 'Ongoing'}`
    )
    console.log(`   Duration: ${session.duration_minutes || 0} minutes`)
    console.log(`   Report Sent: ${session.report_sent ? '✅' : '❌'}`)

    // Check messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('stream_chat_messages')
      .select('id, username, message, timestamp, platform')
      .eq('session_id', session.id)
      .order('timestamp', { ascending: false })
      .limit(10)

    if (messagesError) {
      console.error('   ❌ Error fetching messages:', messagesError)
    } else {
      console.log(`   Messages: ${messages?.length || 0}`)

      if (messages && messages.length > 0) {
        console.log('\n   Sample messages:')
        messages.slice(0, 3).forEach((msg) => {
          console.log(`   - [${msg.platform}] ${msg.username}: ${msg.message.substring(0, 50)}...`)
        })
      } else {
        console.log('   ⚠️  NO MESSAGES FOUND')
      }
    }
    console.log('')
  }

  // Check if there are messages for millzaatv in general (not session-linked)
  console.log('\n' + '='.repeat(60))
  console.log('Checking for any millzaatv messages (session-linked or not)...')

  const { data: allMessages, error: allMessagesError } = await supabase
    .from('stream_chat_messages')
    .select('session_id, count')
    .or(`session_id.in.(${sessions?.map((s) => s.id).join(',') || 'null'})`)
    .limit(1)

  console.log('All messages query result:', allMessages)

  // Check stream_report_sessions for email mismatch
  console.log('\n' + '='.repeat(60))
  console.log('EMAIL ANALYSIS:')
  console.log('='.repeat(60))

  const emailGroups = {}
  sessions?.forEach((session) => {
    if (!emailGroups[session.streamer_email]) {
      emailGroups[session.streamer_email] = []
    }
    emailGroups[session.streamer_email].push(session.id)
  })

  Object.entries(emailGroups).forEach(([email, sessionIds]) => {
    console.log(`\n📧 ${email}: ${sessionIds.length} sessions`)
    if (email.includes('@twitch.casi.app')) {
      console.log('   ⚠️  PSEUDO-EMAIL - Reports sent here will fail!')
      console.log('   Should be: gregmillan947@gmail.com')
    }
  })

  // Check user accounts
  console.log('\n' + '='.repeat(60))
  console.log('CHECKING USER ACCOUNTS:')
  console.log('='.repeat(60))

  const { data: users } = await supabase.auth.admin.listUsers()
  const millzaatvAccounts = users?.users.filter(
    (u) => u.user_metadata?.twitch_id === '625401838' || u.email?.includes('millzaa')
  )

  millzaatvAccounts?.forEach((account) => {
    console.log(`\n📧 ${account.email}`)
    console.log(`   User ID: ${account.id}`)
    console.log(`   Twitch ID: ${account.user_metadata?.twitch_id}`)
    console.log(`   Has Token: ${account.user_metadata?.twitch_access_token ? '✅' : '❌'}`)
  })
}

checkMillzaatvMessages().catch(console.error)
