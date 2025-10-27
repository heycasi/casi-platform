import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit'
import { validateAuthCode, ValidationError } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.auth.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      )
    }

    console.log('API route called')

    // Parse request body
    const body = await request.json()
    const { code } = body

    console.log('Request body:', { hasCode: !!code })

    if (!code) {
      console.log('No code provided')
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    // Validate authorization code
    const validatedCode = validateAuthCode(code)

    // Get environment variables
    const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET

    console.log('Environment check:', {
      hasClientId: !!twitchClientId,
      hasClientSecret: !!twitchClientSecret,
      clientId: twitchClientId?.substring(0, 8) + '...', // Log first 8 chars only
    })

    if (!twitchClientId || !twitchClientSecret) {
      console.log('Missing environment variables')
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
    }

    // Use localhost for development, production URL otherwise
    const redirectUri =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/auth/callback'
        : 'https://heycasi.com/auth/callback'

    console.log('Token exchange params:', { clientId: twitchClientId, redirectUri })

    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
        code: validatedCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    console.log('Twitch token response:', {
      ok: tokenResponse.ok,
      status: tokenResponse.status,
      hasError: !!tokenData.error,
    })

    if (tokenData.error) {
      console.log('Twitch token error:', tokenData.error)
      return NextResponse.json({ error: tokenData.error }, { status: 400 })
    }

    // Get user information
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Client-Id': twitchClientId,
      },
    })

    const userData = await userResponse.json()

    console.log('User data response:', {
      ok: userResponse.ok,
      status: userResponse.status,
      hasData: !!userData.data?.[0],
    })

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: userData.data?.[0] || null,
    })
  } catch (error) {
    console.error('API route error:', error)

    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
