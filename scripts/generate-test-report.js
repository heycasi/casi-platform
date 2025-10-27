#!/usr/bin/env node

// Generate a test report for the fifakillvizualz session with messages
// Usage: node scripts/generate-test-report.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  // Use the session with 1000 messages
  const sessionId = 'ebdac93a-c14f-4596-b25c-c2e176fc07b4'

  console.log('📊 Generating test report for fifakillvizualz session')
  console.log(`   Session ID: ${sessionId}\n`)

  // Get your email
  const { data: adminUser, error: adminError } = await supabase
    .from('subscriptions')
    .select('email')
    .eq('email', 'connordahl@hotmail.com')
    .single()

  if (adminError || !adminUser) {
    console.error('❌ Could not find admin email:', adminError)
    return
  }

  console.log(`📧 Sending report to: ${adminUser.email}`)

  // First, end the session if it's still active
  const { error: endError } = await supabase
    .from('stream_report_sessions')
    .update({
      session_end: new Date().toISOString(),
      duration_minutes: 60, // Set a reasonable duration
    })
    .eq('id', sessionId)

  if (endError) {
    console.error('❌ Error ending session:', endError)
    return
  }

  console.log('✅ Session ended\n')

  // Call the generate report API
  try {
    console.log('🔄 Calling report generation API...')

    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        email: adminUser.email,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Report generated and sent successfully!')
      console.log('📧 Check your email for the stream report PDF\n')
    } else {
      console.error('❌ Failed to generate report:', result.error)

      if (result.error.includes('rate limit')) {
        console.log('\n💡 Rate limit reached. Wait a bit and try again.')
      }
    }
  } catch (error) {
    console.error('❌ Error calling API:', error.message)
    console.log('\n💡 Make sure your dev server is running on localhost:3000')
  }
}

main().catch(console.error)
