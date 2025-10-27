/**
 * Run multi-platform migration
 * Executes the SQL migration file against Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('   SUPABASE_URL:', SUPABASE_URL)
  console.error(
    '   SERVICE_ROLE_KEY:',
    SERVICE_ROLE_KEY ? `${SERVICE_ROLE_KEY.substring(0, 20)}...` : 'undefined'
  )
  process.exit(1)
}

console.log('🚀 Running multi-platform migration...')
console.log('   Supabase URL:', SUPABASE_URL)

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'database', 'multi-platform-migration.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded successfully')
    console.log(`   Size: ${sql.length} characters`)

    // Execute the migration
    // Note: Supabase client doesn't have direct SQL execution for security
    // We need to use the REST API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ query: sql }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Migration failed: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log('✅ Migration executed successfully!')
    console.log('   Result:', result)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
    }
    process.exit(1)
  }
}

// Alternative: Run migrations one statement at a time
async function runMigrationAlternative() {
  try {
    console.log('📄 Running migration using Supabase SQL Editor approach...')
    console.log('')
    console.log('⚠️  MANUAL MIGRATION REQUIRED')
    console.log('')
    console.log('Please follow these steps:')
    console.log('1. Go to: https://supabase.com/dashboard/project/lbosugliylbusksphdov/sql')
    console.log('2. Open the SQL Editor')
    console.log('3. Copy the contents of: database/multi-platform-migration.sql')
    console.log('4. Paste into the SQL Editor')
    console.log('5. Click "Run" to execute the migration')
    console.log('')
    console.log('The migration file will:')
    console.log('  - Add platform column to stream_chat_messages')
    console.log('  - Add platform column to stream_report_sessions')
    console.log('  - Add kick_username to users table')
    console.log('  - Add platform column to stream_events')
    console.log('  - Create indexes for performance')
    console.log('  - Create analytics view vw_messages_by_platform')
    console.log('')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Try direct execution first, fall back to manual instructions
runMigration().catch(() => {
  console.log('')
  console.log('Direct execution not available. Using alternative approach...')
  console.log('')
  runMigrationAlternative()
})
