// Script to verify Supabase database setup
// Run with: node scripts/verify-supabase.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const REQUIRED_TABLES = [
  'waitlist',
  'stream_report_sessions',
  'stream_chat_messages',
  'stream_session_analytics',
  'stream_report_deliveries',
  'subscriptions',
  'subscription_events'
]

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' }
      }
      return { exists: true, error: error.message }
    }

    return { exists: true, error: null }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function checkRLS(tableName) {
  try {
    const { data, error } = await supabase
      .rpc('pg_tables')
      .select('*')
      .eq('tablename', tableName)

    // RLS check would require custom SQL query
    // For now, we'll just note that tables exist
    return { enabled: 'unknown' }
  } catch (err) {
    return { enabled: 'unknown' }
  }
}

async function verifySupabase() {
  console.log('🔍 Verifying Supabase Setup for Casi Platform\n')
  console.log('=' .repeat(60))

  console.log('\n📊 Checking Database Tables:\n')

  let allTablesExist = true
  const missingTables = []

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table)

    if (result.exists) {
      console.log(`✅ ${table.padEnd(30)} - EXISTS`)
    } else {
      console.log(`❌ ${table.padEnd(30)} - MISSING`)
      missingTables.push(table)
      allTablesExist = false
    }
  }

  console.log('\n' + '=' .repeat(60))

  if (allTablesExist) {
    console.log('\n✅ All required tables exist!\n')
  } else {
    console.log('\n⚠️  Missing Tables Detected!\n')
    console.log('Missing tables:', missingTables.join(', '))
    console.log('\n📝 To fix this, run the following SQL scripts in Supabase SQL Editor:')
    console.log('   1. database/schema.sql (for stream analytics tables)')
    console.log('   2. database/stripe-subscriptions-schema.sql (for payment tables)')
    console.log('\n   Or run: npm run migrate:db\n')
  }

  // Check authentication provider
  console.log('🔐 Authentication Configuration:\n')
  console.log('⚠️  Manual verification required:')
  console.log('   1. Go to Supabase Dashboard → Authentication → Providers')
  console.log('   2. Verify Twitch OAuth is enabled')
  console.log('   3. Verify redirect URL: https://heycasi.com/auth/callback')
  console.log('   4. Check email templates are configured\n')

  console.log('=' .repeat(60))
  console.log('\n🎯 Next Steps:')

  if (!allTablesExist) {
    console.log('   1. Run missing database migrations')
  }
  console.log('   2. Verify Twitch OAuth provider is configured')
  console.log('   3. Test authentication flow')
  console.log('   4. Test payment webhook integration\n')
}

verifySupabase().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
