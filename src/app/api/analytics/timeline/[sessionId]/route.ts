// API endpoint to fetch chat activity timeline for a session
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Fetch chat timeline data from database
    const { data: timeline, error } = await supabase
      .from('stream_chat_timeline')
      .select('*')
      .eq('session_id', sessionId)
      .order('minute_offset', { ascending: true })

    if (error) {
      console.error('Error fetching timeline:', error)
      return NextResponse.json({ timeline: [] })
    }

    return NextResponse.json({
      timeline: timeline || [],
      totalBuckets: timeline?.length || 0,
    })
  } catch (error: any) {
    console.error('Timeline API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
