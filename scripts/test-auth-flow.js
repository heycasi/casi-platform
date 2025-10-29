#!/usr/bin/env node

/**
 * Test the OAuth flow to ensure tokens are saved correctly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAuthFlow() {
  console.log('🧪 Testing OAuth Flow for New Users\n')
  console.log('─'.repeat(60))

  // List recent users to see if tokens are being saved
  const { data: users } = await supabase.auth.admin.listUsers()

  console.log(`\n📊 Total users: ${users?.users?.length}\n`)

  // Check each user's token status
  const userStatus = users?.users.map((u) => ({
    username: u.user_metadata?.preferred_username || 'unknown',
    email: u.email,
    created: new Date(u.created_at).toLocaleDateString(),
    hasAccessToken: !!u.user_metadata?.twitch_access_token,
    hasRefreshToken: !!u.user_metadata?.twitch_refresh_token,
    provider: u.user_metadata?.provider,
  }))

  console.log('User Token Status:')
  console.log('─'.repeat(60))
  userStatus?.forEach((u) => {
    const status = u.hasAccessToken ? '✅' : '❌'
    console.log(`${status} ${u.username} (${u.email})`)
    console.log(`   Created: ${u.created} | Provider: ${u.provider}`)
    console.log(`   Tokens: Access=${u.hasAccessToken}, Refresh=${u.hasRefreshToken}`)
    console.log('')
  })

  // Summary
  const withTokens = userStatus?.filter((u) => u.hasAccessToken).length || 0
  const withoutTokens = userStatus?.filter((u) => !u.hasAccessToken).length || 0

  console.log('📈 Summary:')
  console.log('─'.repeat(60))
  console.log(`✅ Users with tokens: ${withTokens}`)
  console.log(`❌ Users without tokens: ${withoutTokens}`)
  console.log(`📊 Success rate: ${Math.round((withTokens / (withTokens + withoutTokens)) * 100)}%`)

  console.log('\n💡 Expected Behavior:')
  console.log('─'.repeat(60))
  console.log('ALL users who signed in via Twitch OAuth should have tokens.')
  console.log('If any are missing, the OAuth callback has a bug.')
}

testAuthFlow().catch(console.error)
