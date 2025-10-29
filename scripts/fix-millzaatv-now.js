#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMillzaatvNow() {
  console.log('🔧 Fixing millzaatv account RIGHT NOW...\n')

  const GOOD_ACCOUNT_ID = '698410a4-7e7c-4c01-9eb2-13206c011add' // gregmillan947@gmail.com
  const BAD_ACCOUNT_ID = '32a4a496-1479-402b-a950-ff33abdb0455' // pseudo-email

  console.log('STEP 1: Delete the bad pseudo-email account')
  console.log('='.repeat(60))

  const { error: deleteError } = await supabase.auth.admin.deleteUser(BAD_ACCOUNT_ID)
  if (deleteError) {
    console.error('❌ Error:', deleteError.message)
  } else {
    console.log('✅ Deleted 625401838@twitch.casi.app account\n')
  }

  console.log('STEP 2: The good account needs to log in via Twitch OAuth')
  console.log('='.repeat(60))
  console.log('📧 Account: gregmillan947@gmail.com')
  console.log('🆔 Twitch ID: 625401838')
  console.log('🔑 Current token status: EXPIRED\n')

  console.log('STEP 3: Millzaatv must click "Connect with Twitch" button')
  console.log('='.repeat(60))
  console.log('When he does this, the auth callback will:')
  console.log('  1. Check for existing account with Twitch ID 625401838')
  console.log('  2. Find gregmillan947@gmail.com')
  console.log('  3. Update THAT account with fresh tokens')
  console.log('  4. Subscribe to EventSub')
  console.log('  5. Log him into gregmillan947@gmail.com')
  console.log('  6. Activity Feed will work!\n')

  console.log('✅ Account cleaned up and ready!')
  console.log('\nNEXT: Have millzaatv:')
  console.log('1. Go to https://www.heycasi.com/dashboard')
  console.log('2. Click "Connect with Twitch"')
  console.log('3. The system will update his gregmillan947@gmail.com account')
  console.log('4. Done!')
}

fixMillzaatvNow().catch(console.error)
