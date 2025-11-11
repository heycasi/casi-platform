// API endpoint to cleanup stale sessions and generate reports
// This should be called by a cron job (e.g., Vercel Cron) every 15 minutes

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AnalyticsService } from '@/lib/analytics'
import { EmailService } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron or has the correct authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting stale session cleanup...')

    // Find sessions that are:
    // 1. Still active (no session_end)
    // 2. Started more than 12 hours ago
    // 3. Channel is no longer live on Twitch
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

    const { data: staleSessions, error: fetchError } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .is('session_end', null)
      .lt('session_start', twelveHoursAgo)
      .limit(50) // Process max 50 at a time

    if (fetchError) {
      console.error('❌ Failed to fetch stale sessions:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch stale sessions' }, { status: 500 })
    }

    if (!staleSessions || staleSessions.length === 0) {
      console.log('✅ No stale sessions found')
      return NextResponse.json({
        success: true,
        message: 'No stale sessions to cleanup',
        processed: 0,
      })
    }

    console.log(`📊 Found ${staleSessions.length} stale sessions to process`)

    const results = {
      ended: 0,
      reportsGenerated: 0,
      reportsSent: 0,
      errors: 0,
    }

    // Process each stale session
    for (const session of staleSessions) {
      try {
        // Check if channel is still live
        const isLive = await checkIfChannelIsLive(session.channel_name)

        // If channel is still live after 12 hours, skip it (might be a marathon stream)
        if (isLive) {
          console.log(`⏭️ Skipping ${session.channel_name} - still live after 12h`)
          continue
        }

        // Calculate duration
        const sessionEnd = new Date()
        const sessionStart = new Date(session.session_start)
        const durationMinutes = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000)

        // End the session
        const { error: updateError } = await supabase
          .from('stream_report_sessions')
          .update({
            session_end: sessionEnd.toISOString(),
            duration_minutes: durationMinutes,
          })
          .eq('id', session.id)

        if (updateError) {
          console.error(`❌ Failed to end session ${session.id}:`, updateError)
          results.errors++
          continue
        }

        results.ended++
        console.log(`✅ Ended stale session: ${session.channel_name} (${durationMinutes} mins)`)

        // Check if there are any messages for this session
        const { count: messageCount } = await supabase
          .from('stream_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)

        // Only generate report if there are messages and session was > 10 minutes
        if (messageCount && messageCount > 10 && durationMinutes > 10) {
          try {
            // Generate analytics
            const analytics = await AnalyticsService.generateSessionAnalytics(session.id)
            const sessionData = await AnalyticsService.getSessionForReport(session.id)
            const topQuestions = await AnalyticsService.getTopQuestions(session.id, 5)

            // NEW: Generate top chatters data
            if (sessionData) {
              try {
                await AnalyticsService.generateTopChattersData(session.id, session.channel_name)
              } catch (error) {
                console.error('Failed to generate top chatters for cron job:', error)
              }

              // NEW: Generate chat timeline
              try {
                await AnalyticsService.generateChatTimeline(session.id)
              } catch (error) {
                console.error('Failed to generate chat timeline for cron job:', error)
              }
            }

            if (sessionData) {
              // Generate report
              const report = await generateComprehensiveReport(sessionData, analytics, topQuestions)
              results.reportsGenerated++

              // Send email if we have an email
              if (session.streamer_email) {
                const emailSent = await EmailService.sendStreamReport(
                  session.streamer_email,
                  report
                )

                if (emailSent) {
                  results.reportsSent++
                  console.log(`📧 Sent report to ${session.streamer_email}`)

                  // Mark as sent
                  await supabase
                    .from('stream_report_sessions')
                    .update({
                      report_generated: true,
                      report_sent: true,
                    })
                    .eq('id', session.id)

                  // Log delivery
                  await supabase.from('stream_report_deliveries').insert({
                    session_id: session.id,
                    email: session.streamer_email,
                    delivery_status: 'sent',
                    delivery_timestamp: new Date().toISOString(),
                    report_data: report,
                  })
                } else {
                  console.error(`❌ Failed to send email to ${session.streamer_email}`)
                  results.errors++
                }
              }
            }
          } catch (reportError) {
            console.error(`❌ Failed to generate report for session ${session.id}:`, reportError)
            results.errors++
          }
        } else {
          console.log(
            `⏭️ Skipping report for ${session.channel_name} - insufficient data (${messageCount} messages, ${durationMinutes} mins)`
          )
        }
      } catch (error) {
        console.error(`❌ Error processing session ${session.id}:`, error)
        results.errors++
      }
    }

    console.log('✅ Stale session cleanup complete:', results)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('❌ Cleanup cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Check if a Twitch channel is currently live
async function checkIfChannelIsLive(channelName: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
      headers: {
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`,
      },
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.data && data.data.length > 0
  } catch {
    return false
  }
}

// Same function as in generate-report/route.ts
async function generateComprehensiveReport(session: any, analytics: any, topQuestions: any[]) {
  const startTime = performance.now()

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
      processing_time_ms: Math.round(processingTime),
      generated_by: 'stale_session_cleanup',
    },
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
      sentiment: 0.5,
      example_messages: [],
    }))
}

function generateRecommendations(session: any, analytics: any) {
  const recommendations = {
    streamOptimization: [] as string[],
    contentSuggestions: [] as string[],
    engagementTips: [] as string[],
  }

  if (session.duration_minutes && session.duration_minutes > 240) {
    recommendations.streamOptimization.push(
      'Consider shorter streams (3-4 hours) for better audience retention'
    )
  } else if (session.duration_minutes && session.duration_minutes < 60) {
    recommendations.streamOptimization.push(
      'Longer streams (2+ hours) often see better engagement growth'
    )
  }

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

  const languageCount = Object.keys(analytics.languages_detected).length
  if (languageCount > 3) {
    recommendations.engagementTips.push(
      'Great international audience! Consider acknowledging different languages occasionally'
    )
  }

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
