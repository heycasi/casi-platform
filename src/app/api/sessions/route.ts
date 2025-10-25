// Session Management API
// POST /api/sessions - Create new session
// PUT /api/sessions - End session

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { streamerEmail, channelName } = await request.json()

    if (!streamerEmail || !channelName) {
      return NextResponse.json(
        { error: 'streamerEmail and channelName are required' },
        { status: 400 }
      )
    }

    // Create new session
    const { data, error } = await supabase
      .from('stream_report_sessions')
      .insert({
        streamer_email: streamerEmail,
        channel_name: channelName.toLowerCase(),
        session_start: new Date().toISOString()
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

    return NextResponse.json({ sessionId: data.id })

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
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Get session start time to calculate duration
    const { data: session } = await supabase
      .from('stream_report_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const sessionEnd = new Date()
    const sessionStart = new Date(session.session_start)
    const durationMinutes = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000)

    // Update session with end time and duration
    const { error } = await supabase
      .from('stream_report_sessions')
      .update({
        session_end: sessionEnd.toISOString(),
        duration_minutes: durationMinutes
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
