// Analytics service for stream data persistence and processing

import { createClient } from '@supabase/supabase-js'
import { StreamSession, ChatMessage, SessionAnalytics, StreamReport } from '../types/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class AnalyticsService {
  // Create a new stream session
  static async createSession(streamerEmail: string, channelName: string): Promise<string> {
    const { data, error } = await supabase
      .from('stream_report_sessions')
      .insert({
        streamer_email: streamerEmail,
        channel_name: channelName.toLowerCase(),
        session_start: new Date().toISOString()
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
          duration_minutes: durationMinutes
        })
        .eq('id', sessionId)
    }
  }

  // Store a chat message with analysis
  static async storeChatMessage(sessionId: string, messageData: {
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
  }): Promise<void> {
    // Validate sessionId exists
    if (!sessionId) {
      console.error('❌ storeChatMessage: sessionId is null or undefined')
      throw new Error('sessionId is required')
    }

    const { error } = await supabase
      .from('stream_chat_messages')
      .insert({
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
        topics: messageData.topics
      })

    if (error) {
      console.error('❌ Failed to store chat message:', {
        error: error.message,
        code: error.code,
        details: error.details,
        sessionId: sessionId,
        username: messageData.username
      })
      throw error
    }
  }

  // Update session statistics in real-time
  static async updateSessionStats(sessionId: string, stats: {
    peak_viewer_count?: number
    total_messages?: number
    unique_chatters?: number
  }): Promise<void> {
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
  private static processMessages(messages: any[], sessionId: string): Omit<SessionAnalytics, 'id' | 'created_at'> {
    const totalMessages = messages.length
    const questionsCount = messages.filter(m => m.is_question).length
    const positiveMessages = messages.filter(m => m.sentiment === 'positive').length
    const negativeMessages = messages.filter(m => m.sentiment === 'negative').length
    const neutralMessages = messages.filter(m => m.sentiment === 'neutral').length
    const highEngagementMessages = messages.filter(m => m.engagement_level === 'high').length

    // Calculate average sentiment score
    const sentimentScores = messages.filter(m => m.sentiment_score !== null).map(m => m.sentiment_score)
    const avgSentimentScore = sentimentScores.length > 0 
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
      : 0

    // Language detection counts
    const languagesDetected: Record<string, number> = {}
    messages.forEach(m => {
      if (m.language) {
        languagesDetected[m.language] = (languagesDetected[m.language] || 0) + 1
      }
    })

    // Topic discussion counts
    const topicsDiscussed: Record<string, number> = {}
    messages.forEach(m => {
      if (m.topics && Array.isArray(m.topics)) {
        m.topics.forEach(topic => {
          topicsDiscussed[topic] = (topicsDiscussed[topic] || 0) + 1
        })
      }
    })

    // Find engagement peaks (windows of high activity)
    const engagementPeaks = this.findEngagementPeaks(messages)

    // Most active chatters
    const chatterCounts: Record<string, { count: number, sentimentSum: number, sentimentCount: number }> = {}
    messages.forEach(m => {
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
        sentiment_avg: data.sentimentCount > 0 ? data.sentimentSum / data.sentimentCount : 0
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
      avgSentimentScore
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
      motivational_insights: motivationalInsights
    }
  }

  // Find peaks of engagement in the chat
  private static findEngagementPeaks(messages: any[]): Array<{
    timestamp: string
    intensity: number
    message_count: number
  }> {
    const windowSize = 300000 // 5 minutes in milliseconds
    const peaks: Array<{ timestamp: string, intensity: number, message_count: number }> = []
    
    if (messages.length === 0) return peaks

    const startTime = new Date(messages[0].timestamp).getTime()
    const endTime = new Date(messages[messages.length - 1].timestamp).getTime()
    
    for (let windowStart = startTime; windowStart < endTime; windowStart += windowSize) {
      const windowEnd = windowStart + windowSize
      const windowMessages = messages.filter(m => {
        const msgTime = new Date(m.timestamp).getTime()
        return msgTime >= windowStart && msgTime < windowEnd
      })

      if (windowMessages.length > 0) {
        const highEngagement = windowMessages.filter(m => m.engagement_level === 'high').length
        const positiveMessages = windowMessages.filter(m => m.sentiment === 'positive').length
        const questions = windowMessages.filter(m => m.is_question).length
        
        // Calculate intensity based on message volume and engagement quality
        const intensity = (windowMessages.length * 0.4 + highEngagement * 0.4 + positiveMessages * 0.15 + questions * 0.05) / windowMessages.length
        
        if (intensity > 0.3) { // Only include meaningful peaks
          peaks.push({
            timestamp: new Date(windowStart).toISOString(),
            intensity: Math.round(intensity * 100) / 100,
            message_count: windowMessages.length
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
      insights.push("🔥 Exceptional positive engagement! Your audience was loving the content.")
    }

    // Question engagement insights
    if (stats.questionsCount / stats.totalMessages > 0.2) {
      insights.push("❓ High question rate indicates very engaged and curious viewers.")
    }

    // Topic insights
    const topTopic = Object.keys(stats.topicsDiscussed).reduce((a, b) => 
      stats.topicsDiscussed[a] > stats.topicsDiscussed[b] ? a : b, '')
    if (topTopic) {
      insights.push(`🎮 "${topTopic}" was the hot topic - consider more content around this theme.`)
    }

    // Sentiment insights
    if (stats.avgSentimentScore > 0.5) {
      insights.push("✨ Overall sentiment was very positive - you're creating great vibes!")
    } else if (stats.avgSentimentScore < -0.2) {
      insights.push("💡 Some negative sentiment detected - might be worth addressing viewer concerns.")
    }

    // Activity insights
    const uniqueChatters = new Set(messages.map(m => m.username)).size
    const chattersToMessages = uniqueChatters / stats.totalMessages
    if (chattersToMessages > 0.3) {
      insights.push("👥 Great chat participation - many viewers were actively engaging!")
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