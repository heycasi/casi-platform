#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findAllMillzaatvAccounts() {
  console.log('🔍 Searching for ALL millzaatv accounts...\n')

  const { data: users } = await supabase.auth.admin.listUsers()

  // Find all accounts that might be millzaatv
  const millzaatvAccounts = users?.users.filter(
    (u) =>
      u.email?.toLowerCase().includes('millzaa') ||
      u.user_metadata?.preferred_username?.toLowerCase() === 'millzaatv' ||
      u.user_metadata?.display_name?.toLowerCase() === 'millzaatv' ||
      u.user_metadata?.twitch_id === '625401838'
  )

  console.log(`Found ${millzaatvAccounts?.length || 0} potential accounts:\n`)

  millzaatvAccounts?.forEach((account, index) => {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`ACCOUNT #${index + 1}`)
    console.log('='.repeat(60))
    console.log('📧 Email:', account.email)
    console.log('🆔 User ID:', account.id)
    console.log('🎮 Provider:', account.app_metadata?.provider)
    console.log('📅 Created:', new Date(account.created_at).toLocaleString())
    console.log(
      '🔑 Has Access Token:',
      account.user_metadata?.twitch_access_token ? '✅ Yes' : '❌ No'
    )
    console.log('🔢 Twitch ID:', account.user_metadata?.twitch_id || 'N/A')
    console.log('👤 Username:', account.user_metadata?.preferred_username || 'N/A')
  })

  // Check subscriptions table
  console.log('\n\n' + '='.repeat(60))
  console.log('CHECKING SUBSCRIPTIONS TABLE')
  console.log('='.repeat(60))

  for (const account of millzaatvAccounts || []) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', account.email)

    if (subs && subs.length > 0) {
      console.log(`\n✅ Subscription found for ${account.email}:`)
      subs.forEach((sub) => {
        console.log(`   Plan: ${sub.plan_name}`)
        console.log(`   Status: ${sub.status}`)
        console.log(`   Beta Trial: ${sub.is_beta_trial ? 'Yes' : 'No'}`)
      })
    } else {
      console.log(`\n❌ No subscription for ${account.email}`)
    }
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('RECOMMENDATION')
  console.log('='.repeat(60))

  if (millzaatvAccounts && millzaatvAccounts.length > 1) {
    console.log('\n⚠️  DUPLICATE ACCOUNTS DETECTED')
    console.log('\nOptions:')
    console.log('1. Merge accounts (link real email to Twitch account)')
    console.log('2. Have millzaatv always use Twitch OAuth from now on')
    console.log('3. Manually subscribe EventSub for his Twitch account')
  }
}

findAllMillzaatvAccounts().catch(console.error)
