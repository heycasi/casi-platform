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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        }
      )
    }

    const { sessionId, email } = await request.json()

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get top questions
    const topQuestions = await AnalyticsService.getTopQuestions(validatedSessionId, 5)

    // Generate comprehensive report
    const report = await generateComprehensiveReport(session, analytics, topQuestions)

    // Send report via email
    const emailSent = await EmailService.sendStreamReport(validatedEmail, report)

    if (emailSent) {
      // Mark session as report generated and sent
      await supabase
        .from('stream_report_sessions')
        .update({
          report_generated: true,
          report_sent: true
        })
        .eq('id', validatedSessionId)

      // Log successful delivery
      await supabase
        .from('stream_report_deliveries')
        .insert({
          session_id: validatedSessionId,
          email: validatedEmail,
          delivery_status: 'sent',
          delivery_timestamp: new Date().toISOString(),
          report_data: report
        })

      return NextResponse.json({
        success: true,
        message: 'Report generated and sent successfully'
      })
    } else {
      // Log failed delivery
      await supabase
        .from('stream_report_deliveries')
        .insert({
          session_id: validatedSessionId,
          email: validatedEmail,
          delivery_status: 'failed',
          error_message: 'Email delivery failed',
          report_data: report
        })

      return NextResponse.json(
        { error: 'Failed to send report email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Report generation error:', error)

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
      sentiment: 0.5, // Default neutral, could be enhanced
      example_messages: [] // Could be populated with actual examples
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

