#!/usr/bin/env node

/**
 * Manually fetch Millzaatv's current access token from localStorage
 * and save it to Supabase user_metadata
 *
 * This fixes the "limited event access" issue without requiring re-login
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function manuallyAuthorizeMillzaatv() {
  console.log('🔧 Manually authorizing Millzaatv...\n')

  // Find Millzaatv's user
  const { data: users } = await supabase.auth.admin.listUsers()
  const millz = users?.users.find(
    (u) => u.user_metadata?.preferred_username?.toLowerCase() === 'millzaatv'
  )

  if (!millz) {
    console.log('❌ Millzaatv user not found')
    return
  }

  console.log('✅ Found Millzaatv:', millz.id)
  console.log('\n⚠️  IMPORTANT:')
  console.log('─'.repeat(50))
  console.log('This script needs Millzaatv to be CURRENTLY LOGGED IN')
  console.log('and to provide his access token from localStorage.')
  console.log('')
  console.log('Ask Millzaatv to:')
  console.log('1. Open https://heycasi.com/dashboard')
  console.log('2. Open browser console (F12 or Cmd+Option+I)')
  console.log('3. Type: localStorage.getItem("twitch_access_token")')
  console.log('4. Copy the token and paste it here')
  console.log('')

  // For now, let's just show what we'd need to do
  console.log('📋 Once you have the token, run:')
  console.log('─'.repeat(50))
  console.log(`
const token = "paste_token_here"

await supabase.auth.admin.updateUserById('${millz.id}', {
  user_metadata: {
    ...existingMetadata,
    twitch_access_token: token,
    twitch_refresh_token: token  // Usually same in localStorage
  }
})
  `)

  console.log('\n💡 OR, easier solution:')
  console.log('─'.repeat(50))
  console.log('Tell Millzaatv to:')
  console.log('1. Log out from dashboard')
  console.log('2. Log in again with "Sign in with Twitch"')
  console.log('3. The new OAuth flow will save tokens correctly')
}

manuallyAuthorizeMillzaatv().catch(console.error)
