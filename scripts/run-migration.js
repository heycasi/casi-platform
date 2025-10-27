/**
 * Run multi-platform migration
 * This script provides instructions for running the migration in Supabase
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Multi-Platform Migration Runner')
console.log('==================================')
console.log('')

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'database', 'multi-platform-migration.sql')
const sql = fs.readFileSync(migrationPath, 'utf-8')

console.log('📄 Migration file loaded successfully')
console.log(`   Location: ${migrationPath}`)
console.log(`   Size: ${sql.length} characters`)
console.log('')

// Get Supabase URL from environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (supabaseUrl) {
  const projectRef = supabaseUrl.split('//')[1].split('.')[0]
  console.log('⚠️  MANUAL MIGRATION REQUIRED')
  console.log('')
  console.log('Please follow these steps to run the migration:')
  console.log('')
  console.log(`1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  console.log('2. Open a new SQL query')
  console.log('3. Copy the contents of: database/multi-platform-migration.sql')
  console.log('4. Paste into the SQL Editor')
  console.log('5. Click "Run" (or press Cmd+Enter)')
  console.log('')
} else {
  console.log('⚠️  Could not detect Supabase URL from environment')
  console.log('')
  console.log('Please manually:')
  console.log('1. Open your Supabase dashboard')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Run the migration from: database/multi-platform-migration.sql')
  console.log('')
}

console.log('📋 This migration will:')
console.log('   ✓ Add platform column to stream_chat_messages')
console.log('   ✓ Add platform_message_id column for deduplication')
console.log('   ✓ Add platform column to stream_report_sessions')
console.log('   ✓ Add kick_username to users table')
console.log('   ✓ Add platform column to stream_events')
console.log('   ✓ Create performance indexes')
console.log('   ✓ Create vw_messages_by_platform analytics view')
console.log('')

console.log('✅ The migration includes verification queries that will:')
console.log('   - Confirm all columns were added')
console.log('   - Display success messages')
console.log('   - Throw errors if anything failed')
console.log('')

console.log('💡 Once migration is complete, return here to continue development')
console.log('')
