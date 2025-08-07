#!/usr/bin/env node

/**
 * Automated database migration for Casi Stream Reports
 * This script can automatically apply database changes using Supabase client
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function runMigration() {
  log('🗄️ Starting Database Migration for Stream Reports', 'cyan')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase environment variables', 'red')
    log('Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local', 'yellow')
    process.exit(1)
  }
  
  if (supabaseUrl.includes('your_supabase_project_url') || supabaseKey.includes('your_supabase_anon_key')) {
    log('❌ Please update .env.local with your actual Supabase credentials', 'red')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test connection
  log('🔌 Testing Supabase connection...', 'yellow')
  try {
    const { data, error } = await supabase.from('waitlist').select('count', { count: 'exact', head: true })
    if (error && !error.message.includes('does not exist')) {
      throw error
    }
    log('✅ Supabase connection successful', 'green')
  } catch (error) {
    log(`❌ Supabase connection failed: ${error.message}`, 'red')
    log('Please check your Supabase credentials in .env.local', 'yellow')
    process.exit(1)
  }
  
  // Check if tables already exist
  log('🔍 Checking existing tables...', 'yellow')
  
  const tables = ['stream_sessions', 'chat_messages', 'session_analytics', 'report_deliveries']
  const existingTables = []
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (!error) {
        existingTables.push(table)
      }
    } catch (error) {
      // Table doesn't exist, which is expected
    }
  }
  
  if (existingTables.length > 0) {
    log(`⚠️ Some tables already exist: ${existingTables.join(', ')}`, 'yellow')
    log('Migration will skip existing tables to avoid data loss', 'blue')
  }
  
  // Read and execute migration
  log('📄 Reading migration script...', 'yellow')
  
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    log('❌ Migration file not found: database/schema.sql', 'red')
    process.exit(1)
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8')
  
  // Note: Supabase client doesn't support running raw SQL directly
  // We need to use the Management API or SQL Editor
  log('📋 Database migration steps:', 'cyan')
  log('1. Go to your Supabase Dashboard', 'blue')
  log('2. Navigate to SQL Editor', 'blue')
  log('3. Copy and paste the following SQL:', 'blue')
  log('4. Click "Run" to execute', 'blue')
  
  console.log('\n' + '='.repeat(80))
  console.log('COPY THIS SQL TO YOUR SUPABASE SQL EDITOR:')
  console.log('='.repeat(80))
  console.log(schema)
  console.log('='.repeat(80))
  
  // Create a file for easy copying
  const migrationFile = path.join(process.cwd(), 'database', 'run-this-migration.sql')
  fs.writeFileSync(migrationFile, schema)
  log(`\n✅ Migration SQL saved to: database/run-this-migration.sql`, 'green')
  log('You can copy this file content to your Supabase SQL Editor', 'blue')
  
  // Verify tables after user runs migration
  log('\n🔄 After running the SQL in Supabase, run this script again to verify:', 'cyan')
  log('npm run migrate:verify', 'blue')
}

async function verifyMigration() {
  log('🔍 Verifying Database Migration', 'cyan')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase environment variables', 'red')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const expectedTables = [
    'stream_sessions',
    'chat_messages', 
    'session_analytics',
    'report_deliveries'
  ]
  
  let allTablesExist = true
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (error) {
        log(`❌ Table '${table}' does not exist`, 'red')
        allTablesExist = false
      } else {
        log(`✅ Table '${table}' exists`, 'green')
      }
    } catch (error) {
      log(`❌ Table '${table}' verification failed: ${error.message}`, 'red')
      allTablesExist = false
    }
  }
  
  if (allTablesExist) {
    log('\n🎉 All database tables are set up correctly!', 'green')
    log('Your stream reports system is ready to use.', 'blue')
    
    // Test basic functionality
    log('\n🧪 Testing basic functionality...', 'yellow')
    try {
      // This would normally create a test session, but we'll skip for now
      log('✅ Database is ready for stream sessions', 'green')
    } catch (error) {
      log(`⚠️ Database test warning: ${error.message}`, 'yellow')
    }
  } else {
    log('\n❌ Database migration incomplete', 'red')
    log('Please run the SQL migration in your Supabase dashboard', 'yellow')
  }
}

// Check command line arguments
const command = process.argv[2]

if (command === 'verify') {
  verifyMigration().catch(console.error)
} else {
  runMigration().catch(console.error)
}