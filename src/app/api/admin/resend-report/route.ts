// Admin-only API endpoint for resending failed stream reports

import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../../lib/analytics'
import { EmailService } from '../../../../lib/email'
import { StreamReport } from '../../../../types/analytics'
import { createClient } from '@supabase/supabase-js'
import { validateUUID, ValidationError } from '@/lib/validation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin usernames (must match dashboard)
const ADMIN_USERNAMES = ['conzooo_']

export async function POST(request: NextRequest) {
  try {
    const { sessionId, adminUsername } = await request.json()

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate session ID
    const validatedSessionId = validateUUID(sessionId)

    // Get the original delivery record to find the email
    const { data: deliveryRecord, error: deliveryError } = await supabase
      .from('stream_report_deliveries')
      .select('*')
      .eq('session_id', validatedSessionId)
      .order('delivery_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (deliveryError || !deliveryRecord) {
      console.error('Failed to find delivery record:', deliveryError)
      return NextResponse.json(
        { error: 'No delivery record found for this session' },
        { status: 404 }
      )
    }

    const email = deliveryRecord.email

    // Get session data
    const session = await AnalyticsService.getSessionForReport(validatedSessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Generate analytics for the session
    console.log('[Admin Resend] Generating analytics for session:', validatedSessionId)
    const analytics = await AnalyticsService.generateSessionAnalytics(validatedSessionId)

    // Get top questions
    const topQuestions = await AnalyticsService.getTopQuestions(validatedSessionId, 5)

    // Generate comprehensive report (reuse from generate-report)
    const report = await generateComprehensiveReport(session, analytics, topQuestions)

    // Send report via email
    const emailSent = await EmailService.sendStreamReport(email, report)

    if (emailSent) {
      // Log successful resend
      await supabase
        .from('stream_report_deliveries')
        .insert({
          session_id: validatedSessionId,
          email: email,
          delivery_status: 'resent',
          delivery_timestamp: new Date().toISOString(),
          report_data: report,
          resent_by_admin: adminUsername
        })

      return NextResponse.json({
        success: true,
        message: `Report successfully resent to ${email}`,
        email: email
      })
    } else {
      // Log failed resend
      await supabase
        .from('stream_report_deliveries')
        .insert({
          session_id: validatedSessionId,
          email: email,
          delivery_status: 'failed',
          error_message: 'Admin resend failed',
          report_data: report,
          resent_by_admin: adminUsername
        })

      return NextResponse.json(
        { error: 'Failed to resend report email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Admin Resend] Error:', error)

    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all delivery records (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminUsername = searchParams.get('adminUsername')

    // Verify admin access
    if (!adminUsername || !ADMIN_USERNAMES.includes(adminUsername.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    // Get all delivery records with session info, ordered by most recent
    const { data: deliveries, error } = await supabase
      .from('stream_report_deliveries')
      .select(`
        *,
        session:stream_report_sessions (
          channel_name,
          session_start,
          session_end,
          duration_minutes
        )
      `)
      .order('delivery_timestamp', { ascending: false })
      .limit(100) // Last 100 deliveries

    if (error) {
      console.error('Failed to fetch deliveries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch delivery records' },
        { status: 500 }
      )
    }

    // Group by session to show only the latest attempt per session
    const latestDeliveries = new Map()
    deliveries?.forEach((delivery: any) => {
      if (!latestDeliveries.has(delivery.session_id)) {
        latestDeliveries.set(delivery.session_id, delivery)
      }
    })

    const uniqueDeliveries = Array.from(latestDeliveries.values())

    return NextResponse.json({
      success: true,
      deliveries: uniqueDeliveries,
      total: uniqueDeliveries.length
    })

  } catch (error) {
    console.error('[Admin Deliveries] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function copied from generate-report route
async function generateComprehensiveReport(session: any, analytics: any, topQuestions: any[]): Promise<StreamReport> {
  const startTime = performance.now()

  // Calculate highlights
  const highlights = {
    bestMoments: generateBestMoments(analytics),
    topQuestions: topQuestions.slice(0, 5),
    mostEngagedViewers: analytics.most_active_chatters.slice(0, 5),
    languageBreakdown: calculateLanguageBreakdown(analytics.languages_detected, analytics.total_messages),
    topicInsights: generateTopicInsights(analytics.topics_discussed, analytics.total_messages)
  }

  // Generate recommendations
  const recommendations = generateRecommendations(session, analytics)

  const processingTime = performance.now() - startTime

  return {
    session,
    analytics,
    highlights,
    recommendations,
    metadata: {
      generated_at: new Date().toISOString(),
      report_version: '1.0',
      processing_time_ms: Math.round(processingTime)
    }
  }
}

function generateBestMoments(analytics: any) {
  return analytics.engagement_peaks.slice(0, 3).map((peak: any, index: number) => ({
    timestamp: peak.timestamp,
    description: `High engagement period ${index + 1} - ${peak.message_count} messages with ${Math.round(peak.intensity * 100)}% excitement`,
    sentiment_score: peak.intensity
  }))
}

function calculateLanguageBreakdown(languages: Record<string, number>, totalMessages: number) {
  const breakdown: Record<string, { count: number, percentage: number }> = {}

  Object.entries(languages).forEach(([lang, count]) => {
    breakdown[lang] = {
      count,
      percentage: Math.round((count / totalMessages) * 100)
    }
  })

  return breakdown
}

function generateTopicInsights(topics: Record<string, number>, totalMessages: number) {
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({
      topic,
      count,
      sentiment: 0.5,
      example_messages: []
    }))
}

function generateRecommendations(session: any, analytics: any) {
  const recommendations = {
    streamOptimization: [] as string[],
    contentSuggestions: [] as string[],
    engagementTips: [] as string[]
  }

  // Duration-based recommendations
  if (session.duration_minutes && session.duration_minutes > 240) {
    recommendations.streamOptimization.push('Consider shorter streams (3-4 hours) for better audience retention')
  } else if (session.duration_minutes && session.duration_minutes < 60) {
    recommendations.streamOptimization.push('Longer streams (2+ hours) often see better engagement growth')
  }

  // Question engagement
  const questionRatio = analytics.questions_count / analytics.total_messages
  if (questionRatio > 0.2) {
    recommendations.engagementTips.push('High question rate! Consider dedicated Q&A segments to capitalize on curiosity')
  } else if (questionRatio < 0.05) {
    recommendations.engagementTips.push('Try asking viewers questions to encourage more interaction')
  }

  // Sentiment-based recommendations
  const positiveRatio = analytics.positive_messages / analytics.total_messages
  if (positiveRatio > 0.6) {
    recommendations.contentSuggestions.push('Your content is resonating well! Consider similar themes in future streams')
  } else if (positiveRatio < 0.3) {
    recommendations.contentSuggestions.push('Try more interactive content or check if technical issues affected viewer experience')
  }

  // Language diversity
  const languageCount = Object.keys(analytics.languages_detected).length
  if (languageCount > 3) {
    recommendations.engagementTips.push('Great international audience! Consider acknowledging different languages occasionally')
  }

  // Topic insights
  const topTopic = Object.keys(analytics.topics_discussed).reduce((a, b) =>
    analytics.topics_discussed[a] > analytics.topics_discussed[b] ? a : b, '')
  if (topTopic) {
    recommendations.contentSuggestions.push(`"${topTopic}" was popular - consider dedicating more time to this topic`)
  }

  return recommendations
}
