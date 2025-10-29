#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

async function generateAppToken() {
  console.log('🔑 Generating Twitch app access token...\n')

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Failed to generate token:', data)
    process.exit(1)
  }

  console.log('✅ App access token generated:')
  console.log('Token:', data.access_token)
  console.log('Expires in:', data.expires_in, 'seconds')
  console.log('\n📝 Add this to your .env.local:')
  console.log(`TWITCH_APP_ACCESS_TOKEN="${data.access_token}"`)

  // Validate the token
  console.log('\n🔍 Validating token...')
  const validateResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  })

  const validation = await validateResponse.json()

  if (validateResponse.ok) {
    console.log('✅ Token is valid')
    console.log('Client ID:', validation.client_id)
    console.log('Expires in:', validation.expires_in, 'seconds')
  } else {
    console.error('❌ Token validation failed:', validation)
  }
}

generateAppToken().catch(console.error)
