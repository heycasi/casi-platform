#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TWITCH_ID = process.argv[2] || '883991643'

async function checkAccount() {
  console.log(`🔍 Checking Supabase for Twitch ID: ${TWITCH_ID}...\n`)

  const { data: users } = await supabase.auth.admin.listUsers()
  const account = users?.users.find((u) => u.user_metadata?.twitch_id === TWITCH_ID)

  if (account) {
    console.log('✅ Found account:')
    console.log(`   Email: ${account.email}`)
    console.log(`   User ID: ${account.id}`)
    console.log(`   Twitch ID: ${account.user_metadata?.twitch_id}`)
    console.log(`   Display Name: ${account.user_metadata?.display_name}`)
    console.log(`   Username: ${account.user_metadata?.preferred_username}`)
    console.log(`   Created: ${new Date(account.created_at).toLocaleString()}`)
    console.log(`   Has Token: ${account.user_metadata?.twitch_access_token ? '✅' : '❌'}`)
  } else {
    console.log('❌ No Supabase account found with this Twitch ID')
  }

  // Check if there's a pseudo-email account
  const pseudoEmail = `${TWITCH_ID}@twitch.casi.app`
  const { data: pseudoAccount } = await supabase.auth.admin.listUsers()
  const pseudo = pseudoAccount?.users.find((u) => u.email === pseudoEmail)

  if (pseudo) {
    console.log('\n📧 Also found pseudo-email account:')
    console.log(`   Email: ${pseudo.email}`)
    console.log(`   User ID: ${pseudo.id}`)
    console.log(`   Created: ${new Date(pseudo.created_at).toLocaleString()}`)
  }
}

checkAccount().catch(console.error)
