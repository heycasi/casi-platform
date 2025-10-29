#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugGiftSubs() {
  console.log('🔍 Checking recent gift sub events...\n')

  // Get all recent events for conzooo_
  const { data: events, error } = await supabase
    .from('stream_events')
    .select('*')
    .eq('channel_name', 'conzooo_')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log('Recent events:')
  events.forEach((event) => {
    console.log(`\n📌 Event ID: ${event.id}`)
    console.log(`   Type: ${event.event_type}`)
    console.log(`   User: ${event.user_display_name || event.user_name} (${event.user_name})`)
    console.log(`   Time: ${new Date(event.created_at).toLocaleString()}`)
    console.log(`   Data:`, JSON.stringify(event.event_data, null, 2))
  })
}

debugGiftSubs().catch(console.error)
