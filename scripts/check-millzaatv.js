#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMillzaatv() {
  console.log('🔍 Checking Millzaatv authentication status...\n')

  const { data: users } = await supabase.auth.admin.listUsers()
  const millz = users?.users.find(
    (u) => u.user_metadata?.preferred_username?.toLowerCase() === 'millzaatv'
  )

  if (!millz) {
    console.log('❌ Millzaatv user not found in database')
    return
  }

  console.log('✅ Found Millzaatv user:')
  console.log('─'.repeat(50))
  console.log('User ID:', millz.id)
  console.log('Email:', millz.email)
  console.log('Preferred Username:', millz.user_metadata?.preferred_username)
  console.log('Twitch ID:', millz.user_metadata?.twitch_id)
  console.log('\n🔑 Token Status:')
  console.log('─'.repeat(50))
  console.log('Has Access Token:', !!millz.user_metadata?.twitch_access_token)
  console.log('Has Refresh Token:', !!millz.user_metadata?.twitch_refresh_token)

  if (millz.user_metadata?.twitch_access_token) {
    const tokenPreview = millz.user_metadata.twitch_access_token.substring(0, 10) + '...'
    console.log('Access Token Preview:', tokenPreview)
  }

  console.log('\n📋 All user_metadata keys:')
  console.log('─'.repeat(50))
  console.log(Object.keys(millz.user_metadata || {}).join(', '))

  console.log('\n🎯 Authorization Status:')
  console.log('─'.repeat(50))
  if (millz.user_metadata?.twitch_access_token) {
    console.log('✅ AUTHORIZED - Full event access enabled')
  } else {
    console.log('⚠️  NOT AUTHORIZED - Limited event access')
    console.log('   User needs to log in via Twitch OAuth')
  }
}

checkMillzaatv().catch(console.error)
