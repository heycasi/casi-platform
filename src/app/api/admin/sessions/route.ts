// Admin API endpoint for stream session management

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AnalyticsService } from '../../../../lib/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin usernames
const ADMIN_USERNAMES = ['conzooo_']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminUsername = searchParams.get('adminUsername')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    // Get all stream sessions with analytics status
    const { data: sessions, error: sessionsError } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .order('session_start', { ascending: false })
      .limit(limit)

    if (sessionsError) {
      console.error('Failed to fetch sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    // Get delivery status for each session
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('stream_report_deliveries')
      .select('session_id, delivery_status, delivery_timestamp')
      .in('session_id', sessions.map(s => s.id))

    if (deliveriesError) {
      console.error('Failed to fetch deliveries:', deliveriesError)
    }

    // Create map of session_id -> delivery
    const deliveryMap = new Map()
    deliveries?.forEach(d => {
      if (!deliveryMap.has(d.session_id)) {
        deliveryMap.set(d.session_id, d)
      }
    })

    // Enrich sessions with delivery status
    const enrichedSessions = sessions.map(session => {
      const delivery = deliveryMap.get(session.id)

      return {
        ...session,
        report_sent: delivery?.delivery_status === 'sent' || delivery?.delivery_status === 'resent',
        delivery_status: delivery?.delivery_status || 'not_sent',
        delivery_timestamp: delivery?.delivery_timestamp || null
      }
    })

    // Calculate stats
    const stats = {
      total_sessions: sessions.length,
      with_reports: enrichedSessions.filter(s => s.report_generated).length,
      reports_sent: enrichedSessions.filter(s => s.report_sent).length,
      total_messages: sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0),
      avg_duration: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length
    }

    return NextResponse.json({
      success: true,
      sessions: enrichedSessions,
      stats
    })

  } catch (error) {
    console.error('[Admin Sessions] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminUsername, action, sessionId } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'delete': {
        // Delete session and all related data
        const { error: sessionError } = await supabase
          .from('stream_report_sessions')
          .delete()
          .eq('id', sessionId)

        if (sessionError) {
          console.error('Failed to delete session:', sessionError)
          return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
          )
        }

        // Delete related deliveries
        await supabase
          .from('stream_report_deliveries')
          .delete()
          .eq('session_id', sessionId)

        // Delete related messages
        await supabase
          .from('stream_messages')
          .delete()
          .eq('session_id', sessionId)

        return NextResponse.json({
          success: true,
          message: 'Session deleted successfully'
        })
      }

      case 'regenerate_analytics': {
        // Regenerate analytics for a session
        try {
          const analytics = await AnalyticsService.generateSessionAnalytics(sessionId)

          // Update session with new analytics
          const { error: updateError } = await supabase
            .from('stream_report_sessions')
            .update({
              report_generated: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)

          if (updateError) {
            console.error('Failed to update session:', updateError)
          }

          return NextResponse.json({
            success: true,
            message: 'Analytics regenerated successfully',
            analytics
          })
        } catch (error) {
          console.error('Failed to regenerate analytics:', error)
          return NextResponse.json(
            { error: 'Failed to regenerate analytics' },
            { status: 500 }
          )
        }
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('[Admin Sessions Action] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
