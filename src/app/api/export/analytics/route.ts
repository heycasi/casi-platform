import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Export analytics data for a user
 * Supports CSV and JSON formats
 * Pro tier feature
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const format = searchParams.get('format') || 'csv' // csv or json
    const sessionId = searchParams.get('sessionId') // optional: export specific session

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify user has active Pro or Streamer+ subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name, status')
      .eq('email', email)
      .eq('status', 'active')
      .single()

    if (!subscription || subscription.plan_name === 'Creator') {
      return NextResponse.json(
        { error: 'Analytics export requires Pro or Streamer+ subscription' },
        { status: 403 }
      )
    }

    // Fetch analytics data
    let query = supabase
      .from('stream_report_sessions')
      .select(`
        *,
        stream_chat_messages(*),
        stream_session_analytics(*)
      `)
      .eq('streamer_email', email)
      .order('session_start', { ascending: false })

    if (sessionId) {
      query = query.eq('id', sessionId)
    } else {
      // Default: last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('session_start', thirtyDaysAgo.toISOString())
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No analytics data found' }, { status: 404 })
    }

    if (format === 'json') {
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        email,
        totalSessions: sessions.length,
        sessions
      })
    } else {
      // Generate CSV
      const csv = generateCSV(sessions)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="casi-analytics-${email}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}

function generateCSV(sessions: any[]): string {
  const headers = [
    'Session ID',
    'Channel Name',
    'Start Time',
    'End Time',
    'Duration (minutes)',
    'Peak Viewers',
    'Total Messages',
    'Unique Chatters',
    'Questions Count',
    'Positive Messages',
    'Negative Messages',
    'Neutral Messages',
    'Avg Sentiment Score'
  ]

  const rows = sessions.map(session => {
    const analytics = session.stream_session_analytics?.[0] || {}

    return [
      session.id,
      session.channel_name,
      session.session_start,
      session.session_end || 'In Progress',
      session.duration_minutes || 0,
      session.peak_viewer_count || 0,
      session.total_messages || 0,
      session.unique_chatters || 0,
      analytics.questions_count || 0,
      analytics.positive_messages || 0,
      analytics.negative_messages || 0,
      analytics.neutral_messages || 0,
      analytics.avg_sentiment_score || 0
    ].map(val => {
      // Escape quotes and wrap in quotes if contains comma
      const str = String(val || '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  })

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}
