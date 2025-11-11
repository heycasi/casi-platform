// Session Management API
// POST /api/sessions - Create new session
// PUT /api/sessions - End session

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to fetch stream info from Twitch
async function fetchTwitchStreamInfo(channelName: string) {
  try {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.warn('Twitch credentials not configured, skipping stream info fetch')
      return null
    }

    // Get OAuth token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get Twitch OAuth token')
      return null
    }

    const { access_token } = await tokenResponse.json()

    // Get user ID first
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to fetch Twitch user')
      return null
    }

    const userData = await userResponse.json()
    if (!userData.data || userData.data.length === 0) {
      console.warn(`Twitch user not found: ${channelName}`)
      return null
    }

    const userId = userData.data[0].id

    // Get current stream info
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!streamResponse.ok) {
      console.error('Failed to fetch Twitch stream info')
      return null
    }

    const streamData = await streamResponse.json()
    if (!streamData.data || streamData.data.length === 0) {
      console.warn(`Stream not live for: ${channelName}`)
      return null
    }

    const stream = streamData.data[0]
    return {
      title: stream.title || null,
      category: stream.game_name || null,
      tags: stream.tags || [],
      viewerCount: stream.viewer_count || 0,
    }
  } catch (error) {
    console.error('Error fetching Twitch stream info:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { streamerEmail, channelName } = await request.json()

    if (!streamerEmail || !channelName) {
      return NextResponse.json(
        { error: 'streamerEmail and channelName are required' },
        { status: 400 }
      )
    }

    const normalizedChannelName = channelName.toLowerCase()

    // Check for existing active session (no session_end)
    const { data: existingSession } = await supabase
      .from('stream_report_sessions')
      .select('id, session_start')
      .eq('channel_name', normalizedChannelName)
      .is('session_end', null)
      .order('session_start', { ascending: false })
      .limit(1)
      .single()

    // If active session exists and is less than 12 hours old, reuse it
    if (existingSession) {
      const sessionAge = Date.now() - new Date(existingSession.session_start).getTime()
      const twelveHoursMs = 12 * 60 * 60 * 1000

      if (sessionAge < twelveHoursMs) {
        console.log(`♻️ Reusing existing session: ${existingSession.id}`)
        return NextResponse.json({
          sessionId: existingSession.id,
          reused: true,
        })
      }
    }

    // Fetch stream info from Twitch (title, category, tags, viewer count)
    const streamInfo = await fetchTwitchStreamInfo(normalizedChannelName)

    // Create new session with stream metadata
    const { data, error } = await supabase
      .from('stream_report_sessions')
      .insert({
        streamer_email: streamerEmail,
        channel_name: normalizedChannelName,
        session_start: new Date().toISOString(),
        stream_title: streamInfo?.title || null,
        stream_category: streamInfo?.category || null,
        stream_tags: streamInfo?.tags || [],
        peak_viewer_count: streamInfo?.viewerCount || 0,
        avg_viewer_count: streamInfo?.viewerCount || 0, // Initialize with current count
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create session:', error)
      return NextResponse.json(
        { error: 'Failed to create session', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✨ Created new session: ${data.id}`)
    if (streamInfo) {
      console.log(
        `📊 Stream info: "${streamInfo.title}" | ${streamInfo.category} | ${streamInfo.viewerCount} viewers`
      )
    }

    return NextResponse.json({
      sessionId: data.id,
      reused: false,
      streamInfo,
    })
  } catch (error: any) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Handle both JSON and plain text (from sendBeacon)
    const contentType = request.headers.get('content-type')
    let sessionId: string

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      sessionId = body.sessionId
    } else {
      // Handle sendBeacon plain text
      const body = await request.text()
      try {
        const parsed = JSON.parse(body)
        sessionId = parsed.sessionId
      } catch {
        sessionId = body // In case it's just the ID
      }
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // Get session start time to calculate duration
    const { data: session } = await supabase
      .from('stream_report_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const sessionEnd = new Date()
    const sessionStart = new Date(session.session_start)
    const durationMinutes = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000)

    // Update session with end time and duration
    const { error } = await supabase
      .from('stream_report_sessions')
      .update({
        session_end: sessionEnd.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to end session:', error)
      return NextResponse.json(
        { error: 'Failed to end session', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, durationMinutes })
  } catch (error: any) {
    console.error('Session end error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
