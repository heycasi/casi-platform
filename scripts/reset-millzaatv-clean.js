#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function resetMillzaatvClean() {
  console.log('🔧 Resetting millzaatv to clean state...\n')

  const ACCOUNT_1 = '698410a4-7e7c-4c01-9eb2-13206c011add' // gregmillan947@gmail.com
  const ACCOUNT_2 = '32a4a496-1479-402b-a950-ff33abdb0455' // 625401838@twitch.casi.app

  console.log('⚠️  WARNING: This will delete BOTH accounts')
  console.log('   Account 1: gregmillan947@gmail.com (expired tokens)')
  console.log('   Account 2: 625401838@twitch.casi.app (no tokens)')
  console.log('\n   After deletion, millzaatv will need to:')
  console.log('   1. Go to heycasi.com/dashboard')
  console.log('   2. Click "Connect with Twitch"')
  console.log('   3. This will create a fresh account with valid tokens')
  console.log('\n⏳ Deleting in 5 seconds... (Ctrl+C to cancel)\n')

  await new Promise((resolve) => setTimeout(resolve, 5000))

  // Delete Account 1
  console.log('Deleting Account 1...')
  const { error: error1 } = await supabase.auth.admin.deleteUser(ACCOUNT_1)
  if (error1) {
    console.error('❌ Error deleting Account 1:', error1.message)
  } else {
    console.log('✅ Account 1 deleted')
  }

  // Delete Account 2
  console.log('Deleting Account 2...')
  const { error: error2 } = await supabase.auth.admin.deleteUser(ACCOUNT_2)
  if (error2) {
    console.error('❌ Error deleting Account 2:', error2.message)
  } else {
    console.log('✅ Account 2 deleted')
  }

  // Verify deletion
  console.log('\nVerifying deletion...')
  const { data: users } = await supabase.auth.admin.listUsers()
  const remaining = users?.users.filter(
    (u) => u.user_metadata?.twitch_id === '625401838' || u.email === 'gregmillan947@gmail.com'
  )

  if (!remaining || remaining.length === 0) {
    console.log('✅ All millzaatv accounts deleted successfully!\n')
    console.log('='.repeat(60))
    console.log('NEXT STEPS FOR MILLZAATV:')
    console.log('='.repeat(60))
    console.log('1. Go to: https://www.heycasi.com/dashboard')
    console.log('2. Click the "Connect with Twitch" button')
    console.log('3. Log in with Twitch (millzaatv account)')
    console.log('4. This will create a fresh account with:')
    console.log('   ✅ Valid access tokens')
    console.log('   ✅ Automatic EventSub subscription')
    console.log('   ✅ Full Activity Feed access')
    console.log('\nThe new account will have email: 625401838@twitch.casi.app')
  } else {
    console.error(`⚠️  ${remaining.length} account(s) still exist!`)
    remaining.forEach((u) => {
      console.log(`   - ${u.email}`)
    })
  }
}

resetMillzaatvClean().catch(console.error)
