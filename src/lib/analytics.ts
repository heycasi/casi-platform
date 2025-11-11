// Analytics service for stream data persistence and processing

import { createClient } from '@supabase/supabase-js'
import { StreamSession, ChatMessage, SessionAnalytics } from '../types/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // FIXED: Use service role to bypass RLS
)

export class AnalyticsService {
  // Create a new stream session
  static async createSession(
    streamerEmail: string,
    channelName: string,
    platform: 'twitch' | 'kick' = 'twitch' // NEW: Platform parameter with default
  ): Promise<string> {
    const { data, error } = await supabase
      .from('stream_report_sessions')
      .insert({
        streamer_email: streamerEmail,
        channel_name: channelName.toLowerCase(),
        session_start: new Date().toISOString(),
        platform, // NEW: Store platform
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create session:', error)
      throw error
    }

    return data.id
  }

  // End a stream session
  static async endSession(sessionId: string): Promise<void> {
    const sessionEnd = new Date()

    // Get session start time to calculate duration
    const { data: session } = await supabase
      .from('stream_report_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single()

    if (session) {
      const startTime = new Date(session.session_start)
      const durationMinutes = Math.round((sessionEnd.getTime() - startTime.getTime()) / (1000 * 60))

      await supabase
        .from('stream_report_sessions')
        .update({
          session_end: sessionEnd.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', sessionId)
    }
  }

  // Store a chat message with analysis
  static async storeChatMessage(
    sessionId: string,
    messageData: {
      username: string
      message: string
      timestamp: Date
      language?: string
      language_confidence?: number
      sentiment?: 'positive' | 'negative' | 'neutral'
      sentiment_score?: number
      sentiment_reason?: string
      is_question: boolean
      question_type?: string
      engagement_level?: 'high' | 'medium' | 'low'
      topics?: string[]
      platform?: 'twitch' | 'kick' // NEW: Platform parameter
      platform_message_id?: string // NEW: Platform-specific message ID
    }
  ): Promise<void> {
    // Validate sessionId exists
    if (!sessionId) {
      console.error('❌ storeChatMessage: sessionId is null or undefined')
      throw new Error('sessionId is required')
    }

    const { error } = await supabase.from('stream_chat_messages').insert({
      session_id: sessionId,
      username: messageData.username,
      message: messageData.message,
      timestamp: messageData.timestamp.toISOString(),
      language: messageData.language,
      language_confidence: messageData.language_confidence,
      sentiment: messageData.sentiment,
      sentiment_score: messageData.sentiment_score,
      sentiment_reason: messageData.sentiment_reason,
      is_question: messageData.is_question,
      question_type: messageData.question_type,
      engagement_level: messageData.engagement_level,
      topics: messageData.topics,
      platform: messageData.platform || 'twitch', // Default to 'twitch' for backward compatibility
      platform_message_id: messageData.platform_message_id,
    })

    if (error) {
      console.error('❌ Failed to store chat message:', {
        error: error.message,
        code: error.code,
        details: error.details,
        sessionId: sessionId,
        username: messageData.username,
      })
      throw error
    }
  }

  // Update session statistics in real-time
  static async updateSessionStats(
    sessionId: string,
    stats: {
      peak_viewer_count?: number
      total_messages?: number
      unique_chatters?: number
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('stream_report_sessions')
      .update(stats)
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to update session stats:', error)
    }
  }

  // Generate comprehensive analytics for a session
  static async generateSessionAnalytics(sessionId: string): Promise<SessionAnalytics> {
    // Get all messages for the session
    const { data: messages } = await supabase
      .from('stream_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (!messages || messages.length === 0) {
      throw new Error('No messages found for session')
    }

    // Calculate analytics
    const analytics = this.processMessages(messages, sessionId)

    // Store analytics in database
    const { data, error } = await supabase
      .from('stream_session_analytics')
      .insert(analytics)
      .select()
      .single()

    if (error) {
      console.error('Failed to store analytics:', error)
      throw error
    }

    return data
  }

  // Process messages to generate analytics
  private static processMessages(
    messages: any[],
    sessionId: string
  ): Omit<SessionAnalytics, 'id' | 'created_at'> {
    const totalMessages = messages.length
    const questionsCount = messages.filter((m) => m.is_question).length
    const positiveMessages = messages.filter((m) => m.sentiment === 'positive').length
    const negativeMessages = messages.filter((m) => m.sentiment === 'negative').length
    const neutralMessages = messages.filter((m) => m.sentiment === 'neutral').length
    const highEngagementMessages = messages.filter((m) => m.engagement_level === 'high').length

    // Calculate average sentiment score
    const sentimentScores = messages
      .filter((m) => m.sentiment_score !== null)
      .map((m) => m.sentiment_score)
    const avgSentimentScore =
      sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : 0

    // Language detection counts
    const languagesDetected: Record<string, number> = {}
    messages.forEach((m) => {
      if (m.language) {
        languagesDetected[m.language] = (languagesDetected[m.language] || 0) + 1
      }
    })

    // Topic discussion counts
    const topicsDiscussed: Record<string, number> = {}
    messages.forEach((m) => {
      if (m.topics && Array.isArray(m.topics)) {
        m.topics.forEach((topic) => {
          topicsDiscussed[topic] = (topicsDiscussed[topic] || 0) + 1
        })
      }
    })

    // Find engagement peaks (windows of high activity)
    const engagementPeaks = this.findEngagementPeaks(messages)

    // Most active chatters
    const chatterCounts: Record<
      string,
      { count: number; sentimentSum: number; sentimentCount: number }
    > = {}
    messages.forEach((m) => {
      if (!chatterCounts[m.username]) {
        chatterCounts[m.username] = { count: 0, sentimentSum: 0, sentimentCount: 0 }
      }
      chatterCounts[m.username].count++
      if (m.sentiment_score !== null) {
        chatterCounts[m.username].sentimentSum += m.sentiment_score
        chatterCounts[m.username].sentimentCount++
      }
    })

    const mostActiveChatters = Object.entries(chatterCounts)
      .map(([username, data]) => ({
        username,
        count: data.count,
        sentiment_avg: data.sentimentCount > 0 ? data.sentimentSum / data.sentimentCount : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Generate motivational insights based on data
    const motivationalInsights = this.generateInsights(messages, {
      totalMessages,
      questionsCount,
      positiveMessages,
      negativeMessages,
      topicsDiscussed,
      avgSentimentScore,
    })

    return {
      session_id: sessionId,
      total_messages: totalMessages,
      questions_count: questionsCount,
      positive_messages: positiveMessages,
      negative_messages: negativeMessages,
      neutral_messages: neutralMessages,
      avg_sentiment_score: Math.round(avgSentimentScore * 100) / 100,
      languages_detected: languagesDetected,
      topics_discussed: topicsDiscussed,
      engagement_peaks: engagementPeaks,
      high_engagement_messages: highEngagementMessages,
      most_active_chatters: mostActiveChatters,
      motivational_insights: motivationalInsights,
    }
  }

  // NEW: Populate the stream_top_chatters table with detailed stats
  static async generateTopChattersData(sessionId: string, channelName: string): Promise<void> {
    try {
      // Get all messages for the session
      const { data: messages } = await supabase
        .from('stream_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (!messages || messages.length === 0) {
        console.log('No messages found for top chatters analysis')
        return
      }

      // Calculate detailed stats per chatter
      const chatterStats: Record<
        string,
        {
          messageCount: number
          questionCount: number
          sentimentSum: number
          sentimentCount: number
          highEngagementCount: number
          firstMessageAt: string
          lastMessageAt: string
          platform: string
        }
      > = {}

      messages.forEach((msg) => {
        if (!chatterStats[msg.username]) {
          chatterStats[msg.username] = {
            messageCount: 0,
            questionCount: 0,
            sentimentSum: 0,
            sentimentCount: 0,
            highEngagementCount: 0,
            firstMessageAt: msg.timestamp,
            lastMessageAt: msg.timestamp,
            platform: msg.platform || 'twitch',
          }
        }

        const stats = chatterStats[msg.username]
        stats.messageCount++
        stats.lastMessageAt = msg.timestamp

        if (msg.is_question) {
          stats.questionCount++
        }

        if (msg.sentiment_score !== null && msg.sentiment_score !== undefined) {
          stats.sentimentSum += msg.sentiment_score
          stats.sentimentCount++
        }

        if (msg.engagement_level === 'high') {
          stats.highEngagementCount++
        }
      })

      // Check which users are recurring (have chatted in previous streams)
      const usernames = Object.keys(chatterStats)
      const { data: previousSessions } = await supabase
        .from('stream_report_sessions')
        .select('id')
        .eq('channel_name', channelName.toLowerCase())
        .neq('id', sessionId)
        .order('session_start', { ascending: false })
        .limit(10) // Check last 10 streams

      const previousSessionIds = previousSessions?.map((s) => s.id) || []

      let recurringUsers: Set<string> = new Set()
      if (previousSessionIds.length > 0) {
        const { data: previousMessages } = await supabase
          .from('stream_chat_messages')
          .select('username')
          .in('session_id', previousSessionIds)

        if (previousMessages) {
          previousMessages.forEach((msg) => recurringUsers.add(msg.username))
        }
      }

      // Prepare data for insertion
      const topChattersData = Object.entries(chatterStats).map(([username, stats]) => ({
        session_id: sessionId,
        username,
        message_count: stats.messageCount,
        question_count: stats.questionCount,
        avg_sentiment_score:
          stats.sentimentCount > 0 ? stats.sentimentSum / stats.sentimentCount : 0,
        high_engagement_count: stats.highEngagementCount,
        first_message_at: stats.firstMessageAt,
        last_message_at: stats.lastMessageAt,
        is_recurring: recurringUsers.has(username),
        platform: stats.platform,
      }))

      // Insert into database (upsert to handle duplicates)
      const { error } = await supabase.from('stream_top_chatters').upsert(topChattersData, {
        onConflict: 'session_id,username',
        ignoreDuplicates: false,
      })

      if (error) {
        console.error('Failed to insert top chatters:', error)
        throw error
      }

      console.log(`✅ Inserted ${topChattersData.length} top chatters for session ${sessionId}`)
    } catch (error) {
      console.error('Error generating top chatters data:', error)
      throw error
    }
  }

  // NEW: Generate chat activity timeline (2-minute buckets)
  static async generateChatTimeline(sessionId: string): Promise<void> {
    try {
      // Get all messages for the session
      const { data: messages } = await supabase
        .from('stream_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (!messages || messages.length === 0) {
        console.log('No messages found for chat timeline')
        return
      }

      // Get session start time
      const { data: session } = await supabase
        .from('stream_report_sessions')
        .select('session_start')
        .eq('id', sessionId)
        .single()

      if (!session) {
        throw new Error('Session not found')
      }

      const sessionStart = new Date(session.session_start).getTime()
      const firstMessageTime = new Date(messages[0].timestamp).getTime()
      const lastMessageTime = new Date(messages[messages.length - 1].timestamp).getTime()

      // Use session start as the baseline
      const startTime = sessionStart
      const endTime = lastMessageTime

      const bucketSize = 2 * 60 * 1000 // 2 minutes in milliseconds
      const timelineBuckets: any[] = []

      // Create buckets for the entire session duration
      for (let bucketStart = startTime; bucketStart <= endTime; bucketStart += bucketSize) {
        const bucketEnd = bucketStart + bucketSize
        const minuteOffset = Math.floor((bucketStart - sessionStart) / 60000)

        // Filter messages in this time bucket
        const bucketMessages = messages.filter((msg) => {
          const msgTime = new Date(msg.timestamp).getTime()
          return msgTime >= bucketStart && msgTime < bucketEnd
        })

        // Calculate stats for this bucket
        const uniqueChatters = new Set(bucketMessages.map((m) => m.username)).size
        const questionCount = bucketMessages.filter((m) => m.is_question).length
        const highEngagementCount = bucketMessages.filter(
          (m) => m.engagement_level === 'high'
        ).length

        const sentimentScores = bucketMessages
          .filter((m) => m.sentiment_score !== null && m.sentiment_score !== undefined)
          .map((m) => m.sentiment_score)

        const avgSentimentScore =
          sentimentScores.length > 0
            ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
            : null

        const positiveCount = bucketMessages.filter((m) => m.sentiment === 'positive').length
        const negativeCount = bucketMessages.filter((m) => m.sentiment === 'negative').length
        const neutralCount = bucketMessages.filter((m) => m.sentiment === 'neutral').length

        // Calculate activity intensity
        const messageCount = bucketMessages.length
        let activityIntensity: 'low' | 'medium' | 'high' | 'peak'
        if (messageCount < 10) activityIntensity = 'low'
        else if (messageCount < 30) activityIntensity = 'medium'
        else if (messageCount < 60) activityIntensity = 'high'
        else activityIntensity = 'peak'

        timelineBuckets.push({
          session_id: sessionId,
          time_bucket: new Date(bucketStart).toISOString(),
          minute_offset: minuteOffset,
          message_count: messageCount,
          unique_chatters: uniqueChatters,
          question_count: questionCount,
          avg_sentiment_score: avgSentimentScore,
          positive_count: positiveCount,
          negative_count: negativeCount,
          neutral_count: neutralCount,
          high_engagement_count: highEngagementCount,
          activity_intensity: activityIntensity,
        })
      }

      // Insert timeline data (upsert to handle duplicates)
      const { error } = await supabase.from('stream_chat_timeline').upsert(timelineBuckets, {
        onConflict: 'session_id,time_bucket',
        ignoreDuplicates: false,
      })

      if (error) {
        console.error('Failed to insert chat timeline:', error)
        throw error
      }

      console.log(`✅ Inserted ${timelineBuckets.length} timeline buckets for session ${sessionId}`)
    } catch (error) {
      console.error('Error generating chat timeline:', error)
      throw error
    }
  }

  // Find peaks of engagement in the chat
  private static findEngagementPeaks(messages: any[]): Array<{
    timestamp: string
    intensity: number
    message_count: number
  }> {
    const windowSize = 300000 // 5 minutes in milliseconds
    const peaks: Array<{ timestamp: string; intensity: number; message_count: number }> = []

    if (messages.length === 0) return peaks

    const startTime = new Date(messages[0].timestamp).getTime()
    const endTime = new Date(messages[messages.length - 1].timestamp).getTime()

    for (let windowStart = startTime; windowStart < endTime; windowStart += windowSize) {
      const windowEnd = windowStart + windowSize
      const windowMessages = messages.filter((m) => {
        const msgTime = new Date(m.timestamp).getTime()
        return msgTime >= windowStart && msgTime < windowEnd
      })

      if (windowMessages.length > 0) {
        const highEngagement = windowMessages.filter((m) => m.engagement_level === 'high').length
        const positiveMessages = windowMessages.filter((m) => m.sentiment === 'positive').length
        const questions = windowMessages.filter((m) => m.is_question).length

        // Calculate intensity based on message volume and engagement quality
        const intensity =
          (windowMessages.length * 0.4 +
            highEngagement * 0.4 +
            positiveMessages * 0.15 +
            questions * 0.05) /
          windowMessages.length

        if (intensity > 0.3) {
          // Only include meaningful peaks
          peaks.push({
            timestamp: new Date(windowStart).toISOString(),
            intensity: Math.round(intensity * 100) / 100,
            message_count: windowMessages.length,
          })
        }
      }
    }

    return peaks.sort((a, b) => b.intensity - a.intensity).slice(0, 5)
  }

  // Generate insights based on analytics
  private static generateInsights(messages: any[], stats: any): string[] {
    const insights: string[] = []

    // Positive engagement insights
    if (stats.positiveMessages / stats.totalMessages > 0.6) {
      insights.push('🔥 Exceptional positive engagement! Your audience was loving the content.')
    }

    // Question engagement insights
    if (stats.questionsCount / stats.totalMessages > 0.2) {
      insights.push('❓ High question rate indicates very engaged and curious viewers.')
    }

    // Topic insights
    const topTopic = Object.keys(stats.topicsDiscussed).reduce(
      (a, b) => (stats.topicsDiscussed[a] > stats.topicsDiscussed[b] ? a : b),
      ''
    )
    if (topTopic) {
      insights.push(`🎮 "${topTopic}" was the hot topic - consider more content around this theme.`)
    }

    // Sentiment insights
    if (stats.avgSentimentScore > 0.5) {
      insights.push("✨ Overall sentiment was very positive - you're creating great vibes!")
    } else if (stats.avgSentimentScore < -0.2) {
      insights.push(
        '💡 Some negative sentiment detected - might be worth addressing viewer concerns.'
      )
    }

    // Activity insights
    const uniqueChatters = new Set(messages.map((m) => m.username)).size
    const chattersToMessages = uniqueChatters / stats.totalMessages
    if (chattersToMessages > 0.3) {
      insights.push('👥 Great chat participation - many viewers were actively engaging!')
    }

    return insights
  }

  // Get session data for report generation
  static async getSessionForReport(sessionId: string): Promise<StreamSession | null> {
    const { data, error } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Failed to get session:', error)
      return null
    }

    return data
  }

  // Get analytics data for report
  static async getAnalyticsForReport(sessionId: string): Promise<SessionAnalytics | null> {
    const { data, error } = await supabase
      .from('stream_session_analytics')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      console.error('Failed to get analytics:', error)
      return null
    }

    return data
  }

  // Get top questions for report
  static async getTopQuestions(sessionId: string, limit: number = 5): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('stream_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_question', true)
      .order('engagement_level', { ascending: false })
      .order('sentiment_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to get top questions:', error)
      return []
    }

    return data || []
  }
}
