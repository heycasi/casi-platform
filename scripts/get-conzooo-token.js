#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getToken() {
  const { data: users } = await supabase.auth.admin.listUsers()
  const conzooo = users?.users.find((u) => u.user_metadata?.twitch_id === '883991643')

  if (!conzooo) {
    console.error('❌ conzooo_ not found')
    process.exit(1)
  }

  const token = conzooo.user_metadata?.twitch_access_token

  if (!token) {
    console.error('❌ No access token found for conzooo_')
    process.exit(1)
  }

  console.log('Access Token:', token)

  // Validate the token
  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const validation = await response.json()

  if (response.ok) {
    console.log('\n✅ Token is valid:')
    console.log('  User:', validation.login)
    console.log('  Scopes:', validation.scopes)
    console.log('  Expires in:', validation.expires_in, 'seconds')
  } else {
    console.error('\n❌ Token is invalid:', validation)
  }
}

getToken().catch(console.error)
