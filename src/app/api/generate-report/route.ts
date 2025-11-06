// API endpoint for generating and sending stream reports

import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics'
import { EmailService } from '../../../lib/email'
import { StreamReport } from '../../../types/analytics'
import { createClient } from '@supabase/supabase-js'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit'
import { validateEmail, validateUUID, ValidationError } from '@/lib/validation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 reports per hour to prevent abuse
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.report.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many report requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      )
    }

    const { sessionId, email } = await request.json()

    if (!sessionId || !email) {
      return NextResponse.json({ error: 'Session ID and email are required' }, { status: 400 })
    }

    // Validate inputs
    const validatedSessionId = validateUUID(sessionId)
    const validatedEmail = validateEmail(email)

    // Generate analytics for the session
    console.log('Generating analytics for session:', validatedSessionId)
    const analytics = await AnalyticsService.generateSessionAnalytics(validatedSessionId)

    // Get session data
    const session = await AnalyticsService.getSessionForReport(validatedSessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get top questions
    const topQuestions = await AnalyticsService.getTopQuestions(validatedSessionId, 5)

    // Fetch activity feed events for this session
    console.log('Fetching activity feed events for session...')
    const { data: events } = await supabase
      .from('stream_events')
      .select('*')
      .eq('channel_name', session.channel_name)
      .gte('created_at', session.session_start)
      .lte('created_at', session.session_end || new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    console.log(`Found ${events?.length || 0} events for session`)

    // Generate comprehensive report
    const report = await generateComprehensiveReport(session, analytics, topQuestions, events || [])

    // Send report via email
    const emailSent = await EmailService.sendStreamReport(validatedEmail, report)

    if (emailSent) {
      // Mark session as report generated and sent
      await supabase
        .from('stream_report_sessions')
        .update({
          report_generated: true,
          report_sent: true,
        })
        .eq('id', validatedSessionId)

      // Log successful delivery
      await supabase.from('stream_report_deliveries').insert({
        session_id: validatedSessionId,
        email: validatedEmail,
        delivery_status: 'sent',
        delivery_timestamp: new Date().toISOString(),
        report_data: report,
      })

      return NextResponse.json({
        success: true,
        message: 'Report generated and sent successfully',
      })
    } else {
      // Log failed delivery
      await supabase.from('stream_report_deliveries').insert({
        session_id: validatedSessionId,
        email: validatedEmail,
        delivery_status: 'failed',
        error_message: 'Email delivery failed',
        report_data: report,
      })

      return NextResponse.json({ error: 'Failed to send report email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Report generation error:', error)

    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateComprehensiveReport(
  session: any,
  analytics: any,
  topQuestions: any[],
  events: any[]
): Promise<StreamReport> {
  const startTime = performance.now()

  // Generate clip timestamps from events and sentiment spikes
  const clipTimestamps = generateClipTimestamps(session, analytics, events)

  // Calculate stream rating (A+ to C)
  const streamRating = calculateStreamRating(session, analytics, events)

  // Get comparison to previous stream
  const previousComparison = await getPreviousStreamComparison(session, analytics)

  // Calculate highlights
  const highlights = {
    bestMoments: generateBestMoments(analytics),
    topQuestions: topQuestions.slice(0, 5),
    mostEngagedViewers: analytics.most_active_chatters.slice(0, 5),
    languageBreakdown: calculateLanguageBreakdown(
      analytics.languages_detected,
      analytics.total_messages
    ),
    topicInsights: generateTopicInsights(analytics.topics_discussed, analytics.total_messages),
  }

  // Generate recommendations
  const recommendations = generateRecommendations(session, analytics)

  const processingTime = performance.now() - startTime

  return {
    session,
    analytics,
    highlights,
    recommendations,
    clipTimestamps, // NEW: Clip suggestions
    streamRating, // NEW: Overall performance grade
    previousComparison, // NEW: Growth metrics
    metadata: {
      generated_at: new Date().toISOString(),
      report_version: '1.1', // Bumped version
      processing_time_ms: Math.round(processingTime),
    },
    events,
  }
}

function generateBestMoments(analytics: any) {
  return analytics.engagement_peaks.slice(0, 3).map((peak: any, index: number) => ({
    timestamp: peak.timestamp,
    description: `High engagement period ${index + 1} - ${peak.message_count} messages with ${Math.round(peak.intensity * 100)}% excitement`,
    sentiment_score: peak.intensity,
  }))
}

function calculateLanguageBreakdown(languages: Record<string, number>, totalMessages: number) {
  const breakdown: Record<string, { count: number; percentage: number }> = {}

  Object.entries(languages).forEach(([lang, count]) => {
    breakdown[lang] = {
      count,
      percentage: Math.round((count / totalMessages) * 100),
    }
  })

  return breakdown
}

function generateTopicInsights(topics: Record<string, number>, totalMessages: number) {
  return Object.entries(topics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({
      topic,
      count,
      sentiment: 0.5, // Default neutral, could be enhanced
      example_messages: [], // Could be populated with actual examples
    }))
}

function generateClipTimestamps(session: any, analytics: any, events: any[]) {
  const clipMoments: any[] = []

  // Add engagement peaks as clip moments
  if (analytics.engagement_peaks) {
    analytics.engagement_peaks.slice(0, 3).forEach((peak: any) => {
      const timestamp = new Date(peak.timestamp)
      const sessionStart = new Date(session.session_start)
      const minutesIn = Math.floor((timestamp.getTime() - sessionStart.getTime()) / 60000)

      clipMoments.push({
        timestamp: peak.timestamp,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'engagement_peak',
        icon: '🔥',
        title: 'Chat Explosion',
        description: `${peak.message_count} messages with high excitement`,
        intensity: peak.intensity,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    })
  }

  // Add major events as clip moments
  events.forEach((event: any) => {
    const eventTime = new Date(event.created_at)
    const sessionStart = new Date(session.session_start)
    const minutesIn = Math.floor((eventTime.getTime() - sessionStart.getTime()) / 60000)

    if (event.event_type === 'raid' && event.event_data?.viewers >= 10) {
      clipMoments.push({
        timestamp: event.created_at,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'raid',
        icon: '⚔️',
        title: `Raid from ${event.user_display_name}`,
        description: `${event.event_data.viewers} viewers joined`,
        intensity: 0.9,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    }

    if (event.event_type === 'gift_sub' && event.event_data?.total >= 5) {
      clipMoments.push({
        timestamp: event.created_at,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'gift_sub',
        icon: '🎁',
        title: 'Sub Bomb!',
        description: `${event.user_display_name} gifted ${event.event_data.total} subs`,
        intensity: 0.85,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    }
  })

  // Sort by intensity and return top 5
  return clipMoments.sort((a, b) => b.intensity - a.intensity).slice(0, 5)
}

function calculateStreamRating(session: any, analytics: any, events: any[]) {
  let score = 0
  let maxScore = 0

  // Duration score (0-20 points)
  maxScore += 20
  const durationHours = (session.duration_minutes || 0) / 60
  if (durationHours >= 2 && durationHours <= 5) score += 20
  else if (durationHours >= 1) score += 15
  else if (durationHours >= 0.5) score += 10

  // Engagement score (0-30 points)
  maxScore += 30
  const messagesPerHour = analytics.total_messages / Math.max(durationHours, 0.5)
  if (messagesPerHour >= 100) score += 30
  else if (messagesPerHour >= 50) score += 25
  else if (messagesPerHour >= 25) score += 20
  else if (messagesPerHour >= 10) score += 15
  else score += 10

  // Positivity score (0-25 points)
  maxScore += 25
  const positiveRatio =
    analytics.total_messages > 0 ? analytics.positive_messages / analytics.total_messages : 0
  score += Math.round(positiveRatio * 25)

  // Event score (0-15 points)
  maxScore += 15
  const eventCount = events.length
  if (eventCount >= 10) score += 15
  else if (eventCount >= 5) score += 12
  else if (eventCount >= 3) score += 10
  else if (eventCount >= 1) score += 7

  // Viewer count score (0-10 points)
  maxScore += 10
  const peakViewers = session.peak_viewer_count || 0
  if (peakViewers >= 100) score += 10
  else if (peakViewers >= 50) score += 8
  else if (peakViewers >= 25) score += 6
  else if (peakViewers >= 10) score += 4
  else score += 2

  // Calculate percentage and grade
  const percentage = Math.round((score / maxScore) * 100)

  let grade = 'C'
  let color = '#9CA3AF'
  let emoji = '📊'

  if (percentage >= 95) {
    grade = 'S+'
    color = '#FFD700'
    emoji = '👑'
  } else if (percentage >= 90) {
    grade = 'A+'
    color = '#10B981'
    emoji = '⭐'
  } else if (percentage >= 85) {
    grade = 'A'
    color = '#10B981'
    emoji = '✨'
  } else if (percentage >= 80) {
    grade = 'A-'
    color = '#34D399'
    emoji = '💚'
  } else if (percentage >= 75) {
    grade = 'B+'
    color = '#60A5FA'
    emoji = '💙'
  } else if (percentage >= 70) {
    grade = 'B'
    color = '#60A5FA'
    emoji = '👍'
  } else if (percentage >= 65) {
    grade = 'B-'
    color = '#93C5FD'
    emoji = '🙂'
  } else if (percentage >= 60) {
    grade = 'C+'
    color = '#FCD34D'
    emoji = '📈'
  } else if (percentage >= 55) {
    grade = 'C'
    color = '#FCD34D'
    emoji = '📊'
  } else {
    grade = 'C-'
    color = '#F59E0B'
    emoji = '💪'
  }

  return {
    grade,
    percentage,
    score,
    maxScore,
    color,
    emoji,
    breakdown: {
      duration: `${Math.round(((durationHours >= 2 && durationHours <= 5 ? 20 : durationHours >= 1 ? 15 : 10) / 20) * 100)}%`,
      engagement: `${Math.round(((messagesPerHour >= 100 ? 30 : messagesPerHour >= 50 ? 25 : 20) / 30) * 100)}%`,
      positivity: `${Math.round(positiveRatio * 100)}%`,
      events: `${Math.round(((eventCount >= 10 ? 15 : eventCount >= 5 ? 12 : 10) / 15) * 100)}%`,
      viewers: `${Math.round(((peakViewers >= 100 ? 10 : peakViewers >= 50 ? 8 : 6) / 10) * 100)}%`,
    },
  }
}

async function getPreviousStreamComparison(session: any, analytics: any) {
  try {
    // Get previous session for this channel
    const { data: previousSession } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .eq('channel_name', session.channel_name)
      .lt('session_start', session.session_start)
      .order('session_start', { ascending: false })
      .limit(1)
      .single()

    if (!previousSession) {
      return null
    }

    // Generate analytics for previous session
    let previousAnalytics
    try {
      previousAnalytics = await AnalyticsService.generateSessionAnalytics(previousSession.id)
    } catch {
      return null
    }

    // Calculate differences
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      previousSession: {
        id: previousSession.id,
        date: previousSession.session_start,
        duration_minutes: previousSession.duration_minutes,
      },
      comparison: {
        messages: {
          current: analytics.total_messages,
          previous: previousAnalytics.total_messages,
          change: calculateChange(analytics.total_messages, previousAnalytics.total_messages),
        },
        viewers: {
          current: session.peak_viewer_count || 0,
          previous: previousSession.peak_viewer_count || 0,
          change: calculateChange(
            session.peak_viewer_count || 0,
            previousSession.peak_viewer_count || 0
          ),
        },
        positiveRate: {
          current: Math.round((analytics.positive_messages / analytics.total_messages) * 100),
          previous: Math.round(
            (previousAnalytics.positive_messages / previousAnalytics.total_messages) * 100
          ),
          change: calculateChange(
            (analytics.positive_messages / analytics.total_messages) * 100,
            (previousAnalytics.positive_messages / previousAnalytics.total_messages) * 100
          ),
        },
        questions: {
          current: analytics.questions_count,
          previous: previousAnalytics.questions_count,
          change: calculateChange(analytics.questions_count, previousAnalytics.questions_count),
        },
      },
    }
  } catch (error) {
    console.error('Error getting previous stream comparison:', error)
    return null
  }
}

function generateRecommendations(session: any, analytics: any) {
  const recommendations = {
    streamOptimization: [] as string[],
    contentSuggestions: [] as string[],
    engagementTips: [] as string[],
  }

  // Duration-based recommendations
  if (session.duration_minutes && session.duration_minutes > 240) {
    recommendations.streamOptimization.push(
      'Consider shorter streams (3-4 hours) for better audience retention'
    )
  } else if (session.duration_minutes && session.duration_minutes < 60) {
    recommendations.streamOptimization.push(
      'Longer streams (2+ hours) often see better engagement growth'
    )
  }

  // Question engagement
  const questionRatio = analytics.questions_count / analytics.total_messages
  if (questionRatio > 0.2) {
    recommendations.engagementTips.push(
      'High question rate! Consider dedicated Q&A segments to capitalize on curiosity'
    )
  } else if (questionRatio < 0.05) {
    recommendations.engagementTips.push(
      'Try asking viewers questions to encourage more interaction'
    )
  }

  // Sentiment-based recommendations
  const positiveRatio = analytics.positive_messages / analytics.total_messages
  if (positiveRatio > 0.6) {
    recommendations.contentSuggestions.push(
      'Your content is resonating well! Consider similar themes in future streams'
    )
  } else if (positiveRatio < 0.3) {
    recommendations.contentSuggestions.push(
      'Try more interactive content or check if technical issues affected viewer experience'
    )
  }

  // Language diversity
  const languageCount = Object.keys(analytics.languages_detected).length
  if (languageCount > 3) {
    recommendations.engagementTips.push(
      'Great international audience! Consider acknowledging different languages occasionally'
    )
  }

  // Topic insights
  const topTopic = Object.keys(analytics.topics_discussed).reduce(
    (a, b) => (analytics.topics_discussed[a] > analytics.topics_discussed[b] ? a : b),
    ''
  )
  if (topTopic) {
    recommendations.contentSuggestions.push(
      `"${topTopic}" was popular - consider dedicating more time to this topic`
    )
  }

  return recommendations
}
