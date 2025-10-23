// Stream Events API
// GET /api/stream-events?channel=channelname&limit=50
// Fetches recent stream events for a channel

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel parameter is required' },
        { status: 400 }
      )
    }

    // Fetch events from database by channel name (case-insensitive)
    const { data: events, error } = await supabase
      .from('stream_events')
      .select('*')
      .ilike('channel_name', channel)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch stream events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events: events || [],
      count: events?.length || 0
    })

  } catch (error: any) {
    console.error('Stream events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
