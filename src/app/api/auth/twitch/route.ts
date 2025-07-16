import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API route called')
    
    // Parse request body
    const body = await request.json()
    const { code } = body
    
    console.log('Request body:', { hasCode: !!code })
    
    if (!code) {
      console.log('No code provided')
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET
    
    console.log('Environment check:', { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      clientId: clientId?.substring(0, 8) + '...' // Log first 8 chars only
    })
    
    if (!clientId || !clientSecret) {
      console.log('Missing environment variables')
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
    }

    // Force production URL
    const redirectUri = 'https://heycasi.com/auth/callback'
    
    console.log('Token exchange params:', { clientId, redirectUri })

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
    
    console.log('Twitch token response:', { 
      ok: tokenResponse.ok, 
      status: tokenResponse.status,
      hasError: !!tokenData.error 
    })

    if (tokenData.error) {
      console.log('Twitch token error:', tokenData.error)
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
    
    console.log('User data response:', { 
      ok: userResponse.ok, 
      status: userResponse.status,
      hasData: !!userData.data?.[0] 
    })

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: userData.data?.[0] || null,
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
