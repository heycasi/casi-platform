import { NextRequest, NextResponse } from 'next/server'

async function getAppAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Missing Twitch client credentials')
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error('Failed to get app token')
  return data.access_token as string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userLogin = searchParams.get('user_login')
    if (!userId && !userLogin) {
      return NextResponse.json({ error: 'user_id or user_login required' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    if (!clientId) return NextResponse.json({ error: 'Missing client id' }, { status: 500 })

    const token = await getAppAccessToken()
    const qs = userId ? `user_id=${encodeURIComponent(userId)}` : `user_login=${encodeURIComponent(userLogin!)}`
    const res = await fetch(`https://api.twitch.tv/helix/streams?${qs}`, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    const stream = Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null
    if (!stream) return NextResponse.json({ live: false })

    return NextResponse.json({
      live: true,
      viewer_count: stream.viewer_count ?? null,
      started_at: stream.started_at ?? null,
      title: stream.title ?? null,
      game_id: stream.game_id ?? null
    })
  } catch (error) {
    console.error('twitch stream-info error', error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}


