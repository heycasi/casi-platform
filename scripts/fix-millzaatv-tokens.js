#!/usr/bin/env node

// This script will manually trigger a token refresh for Millzaatv
// by having him log in again through the OAuth flow

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixMillzaatvTokens() {
  console.log('🔧 Checking if Millzaatv needs to re-authenticate...\n')

  const { data: users } = await supabase.auth.admin.listUsers()
  const millz = users?.users.find(
    (u) => u.user_metadata?.preferred_username?.toLowerCase() === 'millzaatv'
  )

  if (!millz) {
    console.log('❌ Millzaatv user not found')
    return
  }

  console.log('📋 Current Status:')
  console.log('─'.repeat(50))
  console.log('User ID:', millz.id)
  console.log('Username:', millz.user_metadata?.preferred_username)
  console.log('Has Access Token:', !!millz.user_metadata?.twitch_access_token)
  console.log('Has Refresh Token:', !!millz.user_metadata?.twitch_refresh_token)

  if (!millz.user_metadata?.twitch_access_token) {
    console.log('\n⚠️  ISSUE IDENTIFIED:')
    console.log('─'.repeat(50))
    console.log('Millzaatv signed in but the access token was not saved to user_metadata.')
    console.log('\n💡 SOLUTION:')
    console.log('Millzaatv needs to LOG OUT and LOG IN AGAIN via Twitch.')
    console.log('\nSteps:')
    console.log('1. Go to https://heycasi.com/dashboard')
    console.log('2. Click "Log Out" (if logged in)')
    console.log('3. Click "Sign in with Twitch"')
    console.log('4. Authorize the app again')
    console.log('\nThe OAuth callback will save the tokens to user_metadata.')
    console.log('\n🔍 Root Cause:')
    console.log('When Millzaatv first signed in, he may have used email/password')
    console.log('instead of Twitch OAuth, so no tokens were stored.')
  } else {
    console.log('\n✅ Tokens are present - authorization should work!')
  }
}

fixMillzaatvTokens().catch(console.error)
