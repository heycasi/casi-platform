#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLoginHistory() {
  console.log('🔍 Checking millzaatv login and session history...\n')

  // Get millzaatv's account
  const { data: users } = await supabase.auth.admin.listUsers()
  const millzaatv = users?.users.find((u) => u.user_metadata?.twitch_id === '625401838')

  if (!millzaatv) {
    console.log('❌ Millzaatv account not found')
    return
  }

  console.log('👤 Millzaatv Account:')
  console.log(`   Email: ${millzaatv.email}`)
  console.log(`   User ID: ${millzaatv.id}`)
  console.log(
    `   Last Sign In: ${millzaatv.last_sign_in_at ? new Date(millzaatv.last_sign_in_at).toLocaleString() : 'Never'}`
  )
  console.log(`   Created At: ${new Date(millzaatv.created_at).toLocaleString()}`)
  console.log(`   Updated At: ${new Date(millzaatv.updated_at).toLocaleString()}`)
  console.log(`   Has Access Token: ${millzaatv.user_metadata?.twitch_access_token ? '✅' : '❌'}`)
  console.log(
    `   Has Refresh Token: ${millzaatv.user_metadata?.twitch_refresh_token ? '✅' : '❌'}`
  )

  // Get all sessions for millzaatv (both emails)
  console.log('\n' + '='.repeat(60))
  console.log('📊 Recent Sessions (Last 5):')
  console.log('='.repeat(60))

  const { data: sessions } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('channel_name', 'millzaatv')
    .order('session_start', { ascending: false })
    .limit(5)

  sessions?.forEach((session, i) => {
    console.log(`\n${i + 1}. Session: ${session.id.substring(0, 8)}...`)
    console.log(`   Email: ${session.streamer_email}`)
    console.log(`   Start: ${new Date(session.session_start).toLocaleString()}`)
    console.log(
      `   End: ${session.session_end ? new Date(session.session_end).toLocaleString() : 'Ongoing'}`
    )
    console.log(`   Duration: ${session.duration_minutes || 0} min`)
    console.log(`   Messages: ${session.total_messages || 0}`)
  })

  // Check when the fix was deployed
  console.log('\n' + '='.repeat(60))
  console.log('📅 Timeline Analysis:')
  console.log('='.repeat(60))

  const fixDeployedTime = new Date('2025-10-30T18:00:00Z') // Approximate deployment time
  const lastLoginTime = millzaatv.last_sign_in_at ? new Date(millzaatv.last_sign_in_at) : null
  const mostRecentSession = sessions?.[0]
  const mostRecentSessionTime = mostRecentSession ? new Date(mostRecentSession.session_start) : null

  console.log(`\n🚀 Fix deployed: ~${fixDeployedTime.toLocaleString()}`)
  console.log(`🔐 Last login: ${lastLoginTime ? lastLoginTime.toLocaleString() : 'Never'}`)
  console.log(
    `📺 Most recent session: ${mostRecentSessionTime ? mostRecentSessionTime.toLocaleString() : 'None'}`
  )

  if (lastLoginTime && mostRecentSessionTime) {
    const loginBeforeSession = lastLoginTime < mostRecentSessionTime
    console.log(
      `\n${loginBeforeSession ? '❌' : '✅'} Login was ${loginBeforeSession ? 'BEFORE' : 'AFTER'} most recent session`
    )
  }

  if (lastLoginTime && fixDeployedTime) {
    const loginAfterFix = lastLoginTime > fixDeployedTime
    console.log(
      `${loginAfterFix ? '✅' : '❌'} Login was ${loginAfterFix ? 'AFTER' : 'BEFORE'} fix deployment`
    )
  }

  if (mostRecentSession) {
    console.log(`\n📧 Most recent session email: ${mostRecentSession.streamer_email}`)
    if (mostRecentSession.streamer_email === '625401838@twitch.casi.app') {
      console.log('   ❌ Still using PSEUDO-EMAIL')
      console.log('   ⚠️  Millzaatv needs to log out and back in again!')
    } else if (mostRecentSession.streamer_email === 'gregmillan947@gmail.com') {
      console.log('   ✅ Using REAL EMAIL - Fix is working!')
    }
  }
}

checkLoginHistory().catch(console.error)
