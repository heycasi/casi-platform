#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanOldGiftSubs() {
  console.log('🧹 Cleaning old incorrect gift sub events...\n')

  // Find all gift_sub events (the old incorrect ones showing recipients)
  const { data: oldEvents, error: fetchError } = await supabase
    .from('stream_events')
    .select('*')
    .eq('event_type', 'gift_sub')
    .eq('channel_name', 'conzooo_')

  if (fetchError) {
    console.error('❌ Failed to fetch events:', fetchError)
    process.exit(1)
  }

  console.log(`Found ${oldEvents.length} old gift_sub events`)

  if (oldEvents.length === 0) {
    console.log('✅ No old events to clean!')
    return
  }

  // Show what we're deleting
  oldEvents.forEach((event) => {
    console.log(
      `  - ${event.user_display_name || event.user_name} at ${new Date(event.created_at).toLocaleString()}`
    )
  })

  console.log(
    '\n⚠️  These events will be deleted because they show the wrong person (recipient instead of gifter)'
  )
  console.log('The new channel.subscription.gift event will show the correct gifter.\n')

  // Delete them
  const { error: deleteError } = await supabase
    .from('stream_events')
    .delete()
    .eq('event_type', 'gift_sub')
    .eq('channel_name', 'conzooo_')

  if (deleteError) {
    console.error('❌ Failed to delete events:', deleteError)
    process.exit(1)
  }

  console.log('✅ Successfully cleaned old gift sub events!')
  console.log('New gift subs will now show the correct gifter name.')
}

cleanOldGiftSubs().catch(console.error)
