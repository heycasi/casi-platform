// API endpoint to check current session status
// GET /api/sessions/current?email=user@example.com

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Get the most recent session for this user
    const { data: session, error } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .eq('streamer_email', email)
      .order('session_start', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch current session:', error)
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({
        status: 'no_session',
        session: null,
      })
    }

    // Determine session status
    const isActive = !session.session_end
    const isFinished = !!session.session_end

    // If session is finished, check if it ended less than 60 minutes ago
    if (isFinished) {
      const sessionEndTime = new Date(session.session_end).getTime()
      const currentTime = new Date().getTime()
      const timeSinceEnd = currentTime - sessionEndTime
      const sixtyMinutesInMs = 60 * 60 * 1000

      // If more than 60 minutes have passed, treat as no active session
      if (timeSinceEnd > sixtyMinutesInMs) {
        return NextResponse.json({
          status: 'no_session',
          session: null,
        })
      }
    }

    return NextResponse.json({
      status: isActive ? 'active' : 'finished',
      session: {
        id: session.id,
        channel_name: session.channel_name,
        session_start: session.session_start,
        session_end: session.session_end,
        duration_minutes: session.duration_minutes,
        total_messages: session.total_messages,
        peak_viewer_count: session.peak_viewer_count,
        avg_viewer_count: session.avg_viewer_count,
        stream_title: session.stream_title,
        stream_category: session.stream_category,
      },
    })
  } catch (error) {
    console.error('Session status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
