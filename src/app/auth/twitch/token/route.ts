import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET
    const redirectUri = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/auth/twitch/callback`

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()

    // Get user information
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id': clientId!,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }

    const userData = await userResponse.json()
    const user = userData.data[0]

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: {
        id: user.id,
        login: user.login,
        display_name: user.display_name,
        email: user.email,
        profile_image_url: user.profile_image_url,
      },
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to process authentication' },
      { status: 500 }
    )
  }
}
