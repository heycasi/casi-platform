// Kick.com stream info API endpoint
// GET /api/kick/stream-info?username={username}
// Returns live status and viewer count for a Kick channel

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 })
    }

    console.log(`[Kick API] Checking live status for: ${username}`)

    // Fetch channel data from Kick API
    const response = await fetch(`https://kick.com/api/v2/channels/${username.toLowerCase()}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Channel not found', isLive: false }, { status: 404 })
      }
      throw new Error(`Kick API returned ${response.status}`)
    }

    const data = await response.json()

    // Extract relevant information
    const isLive = data.livestream?.is_live || false
    const viewerCount = data.livestream?.viewer_count || 0
    const title = data.livestream?.session_title || ''
    const thumbnailUrl = data.livestream?.thumbnail?.url || null
    const category = data.livestream?.categories?.[0]?.name || null

    const streamInfo = {
      isLive,
      viewerCount,
      title,
      thumbnailUrl,
      category,
      channelId: data.id,
      chatroomId: data.chatroom?.id,
      username: data.user?.username || username,
      displayName: data.user?.username || username,
    }

    console.log(`[Kick API] ${username} - Live: ${isLive}, Viewers: ${viewerCount}`)

    return NextResponse.json(streamInfo)
  } catch (error: any) {
    console.error('[Kick API] Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Kick stream info',
        isLive: false,
      },
      { status: 500 }
    )
  }
}
