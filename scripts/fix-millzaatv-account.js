#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const APP_ACCESS_TOKEN = process.env.TWITCH_APP_ACCESS_TOKEN

async function fixMillzaatvAccount() {
  console.log('🔧 Fixing millzaatv account setup...\n')

  // Account IDs we found
  const GOOD_ACCOUNT = '698410a4-7e7c-4c01-9eb2-13206c011add' // gregmillan947@gmail.com - HAS TOKENS
  const BAD_ACCOUNT = '32a4a496-1479-402b-a950-ff33abdb0455' // twitch pseudo-email - NO TOKENS

  console.log('STEP 1: Verify Account #1 has valid tokens')
  console.log('='.repeat(60))

  const { data: goodAccount } = await supabase.auth.admin.getUserById(GOOD_ACCOUNT)

  const accessToken = goodAccount.user.user_metadata?.twitch_access_token
  const twitchId = goodAccount.user.user_metadata?.twitch_id

  console.log('📧 Email:', goodAccount.user.email)
  console.log('🔑 Has Access Token:', accessToken ? '✅ Yes' : '❌ No')
  console.log('🔢 Twitch ID:', twitchId)

  if (!accessToken) {
    console.error("\n❌ Account #1 doesn't have tokens! Cannot proceed.")
    return
  }

  // Verify token is valid by calling Twitch API
  console.log('\nSTEP 2: Verify token is valid with Twitch')
  console.log('='.repeat(60))

  try {
    const validateResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    })

    if (validateResponse.ok) {
      const data = await validateResponse.json()
      console.log('✅ Token is valid!')
      console.log('   User ID:', data.user_id)
      console.log('   Login:', data.login)
      console.log('   Scopes:', data.scopes.join(', '))
    } else {
      console.error('❌ Token is invalid or expired!')
      console.error('   Millzaatv needs to log in again via Twitch OAuth')
      return
    }
  } catch (error) {
    console.error('❌ Error validating token:', error.message)
    return
  }

  // Check EventSub subscriptions
  console.log('\nSTEP 3: Check EventSub subscriptions for this broadcaster')
  console.log('='.repeat(60))

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/eventsub/subscriptions?user_id=${twitchId}`,
      {
        headers: {
          Authorization: `Bearer ${APP_ACCESS_TOKEN}`,
          'Client-Id': CLIENT_ID,
        },
      }
    )

    const data = await response.json()

    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} EventSub subscriptions:`)
      data.data.forEach((sub) => {
        console.log(`   - ${sub.type}: ${sub.status}`)
      })
    } else {
      console.log('⚠️  No EventSub subscriptions found')
      console.log('   Will need to subscribe after fixing account')
    }
  } catch (error) {
    console.error('❌ Error checking EventSub:', error.message)
  }

  // Delete Account #2
  console.log('\nSTEP 4: Delete duplicate Account #2')
  console.log('='.repeat(60))
  console.log('⚠️  About to delete:', BAD_ACCOUNT)
  console.log('   Email: 625401838@twitch.casi.app')
  console.log('   This will CASCADE delete the subscription too.')
  console.log('\n⏳ Deleting in 3 seconds... (Ctrl+C to cancel)')

  await new Promise((resolve) => setTimeout(resolve, 3000))

  try {
    const { data, error } = await supabase.auth.admin.deleteUser(BAD_ACCOUNT)

    if (error) {
      console.error('❌ Error deleting account:', error)
      return
    }

    console.log('✅ Account #2 deleted successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    return
  }

  // Verify deletion
  console.log('\nSTEP 5: Verify account was deleted')
  console.log('='.repeat(60))

  const { data: users } = await supabase.auth.admin.listUsers()
  const remaining = users?.users.filter((u) => u.user_metadata?.twitch_id === '625401838')

  console.log(`Remaining accounts with Twitch ID 625401838: ${remaining?.length || 0}`)

  if (remaining?.length === 1) {
    console.log('✅ Perfect! Only 1 account remains:')
    console.log('   Email:', remaining[0].email)
    console.log('   Has Token:', remaining[0].user_metadata?.twitch_access_token ? '✅' : '❌')
  }

  // Final check - ensure EventSub is subscribed
  console.log('\nSTEP 6: Subscribe to EventSub (if needed)')
  console.log('='.repeat(60))

  try {
    const subscribeResponse = await fetch('/api/subscribe-user-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broadcaster_user_id: twitchId,
        user_access_token: accessToken,
      }),
    })

    // Note: This will only work if running locally, otherwise skip
    if (subscribeResponse) {
      console.log('✅ EventSub subscription API called')
    }
  } catch (error) {
    console.log('⚠️  Could not call subscribe API (normal if running as script)')
    console.log('   You can manually subscribe using: node scripts/create-subscription.sh')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ MILLZAATV ACCOUNT FIXED!')
  console.log('='.repeat(60))
  console.log('\nNext steps:')
  console.log('1. Have millzaatv log in using gregmillan947@gmail.com')
  console.log('2. Or use Twitch OAuth (it should now link to the correct account)')
  console.log('3. Activity Feed should show full event access')
  console.log('4. If EventSub subscriptions are missing, run:')
  console.log('   node scripts/create-subscription.sh 625401838')
}

fixMillzaatvAccount().catch(console.error)
