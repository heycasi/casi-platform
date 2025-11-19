// API endpoint for updating session statistics
// PATCH /api/sessions/stats - Update session stats (viewer count, message count, etc.)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.general.check(clientId)

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

    const { sessionId, stats } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    if (!stats || typeof stats !== 'object') {
      return NextResponse.json({ error: 'stats object is required' }, { status: 400 })
    }

    // Validate session exists
    const { data: session, error: sessionError } = await supabase
      .from('stream_report_sessions')
      .select('id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 404 })
    }

    // Build update object with only allowed fields
    const updateData: Record<string, any> = {}

    if (typeof stats.peak_viewer_count === 'number') {
      updateData.peak_viewer_count = stats.peak_viewer_count
    }

    if (typeof stats.avg_viewer_count === 'number') {
      updateData.avg_viewer_count = stats.avg_viewer_count
    }

    if (typeof stats.total_messages === 'number') {
      updateData.total_messages = stats.total_messages
    }

    if (typeof stats.unique_chatters === 'number') {
      updateData.unique_chatters = stats.unique_chatters
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid stats provided' }, { status: 400 })
    }

    // Update session stats
    const { error } = await supabase
      .from('stream_report_sessions')
      .update(updateData)
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to update session stats:', error)
      return NextResponse.json(
        { error: 'Failed to update stats', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: Object.keys(updateData),
    })
  } catch (error: any) {
    console.error('Session stats update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
