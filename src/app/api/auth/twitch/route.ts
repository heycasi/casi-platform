import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '8lmg8rwlkhlom3idj51xka2eipxd18'
    const clientSecret = process.env.TWITCH_CLIENT_SECRET || '3vvx7u5vuqdy7zbic8et8fvtmafrj'
    
    // Determine the correct redirect URI based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://heycasi.com' 
      : 'http://localhost:3000'
    
    const redirectUri = `${baseUrl}/auth/callback`

    console.log('Token exchange attempt:', { clientId, redirectUri, hasCode: !!code })

    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData)
      return NextResponse.json({ error: tokenData.error }, { status: 400 })
    }

    // Get user information
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id': clientId,
      },
    })

    const userData = await userResponse.json()

    console.log('User data received:', userData.data?.[0]?.login)

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: userData.data[0],
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 })
  }
}
