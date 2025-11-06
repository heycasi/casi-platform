// Types for stream analytics and reporting

export interface StreamSession {
  id: string
  streamer_email: string
  channel_name: string
  session_start: string
  session_end?: string
  duration_minutes?: number
  peak_viewer_count: number
  total_messages: number
  unique_chatters: number
  report_generated: boolean
  report_sent: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  username: string
  message: string
  timestamp: string
  language?: string
  language_confidence?: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  sentiment_score?: number
  sentiment_reason?: string
  is_question: boolean
  question_type?: string
  engagement_level?: 'high' | 'medium' | 'low'
  topics?: string[]
  created_at: string
}

export interface SessionAnalytics {
  id: string
  session_id: string
  total_messages: number
  questions_count: number
  positive_messages: number
  negative_messages: number
  neutral_messages: number
  avg_sentiment_score: number
  languages_detected: Record<string, number>
  topics_discussed: Record<string, number>
  engagement_peaks: Array<{
    timestamp: string
    intensity: number
    message_count: number
  }>
  high_engagement_messages: number
  most_active_chatters: Array<{
    username: string
    count: number
    sentiment_avg: number
  }>
  motivational_insights: string[]
  created_at: string
}

export interface ReportDelivery {
  id: string
  session_id: string
  email: string
  delivery_status: 'pending' | 'sent' | 'failed'
  delivery_timestamp?: string
  error_message?: string
  report_data: StreamReport
  created_at: string
}

export interface StreamReport {
  session: StreamSession
  analytics: SessionAnalytics
  highlights: {
    bestMoments: Array<{
      timestamp: string
      description: string
      sentiment_score: number
    }>
    topQuestions: ChatMessage[]
    mostEngagedViewers: Array<{
      username: string
      message_count: number
      avg_sentiment: number
    }>
    languageBreakdown: Record<
      string,
      {
        count: number
        percentage: number
      }
    >
    topicInsights: Array<{
      topic: string
      count: number
      sentiment: number
      example_messages: string[]
    }>
  }
  recommendations: {
    streamOptimization: string[]
    contentSuggestions: string[]
    engagementTips: string[]
  }
  metadata: {
    generated_at: string
    report_version: string
    processing_time_ms: number
  }
  events?: any[] // Optional array of stream events (subs, gifts, raids, follows, etc.)
  clipTimestamps?: Array<{
    timestamp: string
    relativeTime: string
    minutesIn: number
    type: string
    icon: string
    title: string
    description: string
    intensity: number
    clipUrl: string
  }>
  streamRating?: {
    grade: string
    percentage: number
    score: number
    maxScore: number
    color: string
    emoji: string
    breakdown: Record<string, string>
  }
  previousComparison?: {
    previousSession: {
      id: string
      date: string
      duration_minutes: number
    }
    comparison: {
      messages: { current: number; previous: number; change: number }
      viewers: { current: number; previous: number; change: number }
      positiveRate: { current: number; previous: number; change: number }
      questions: { current: number; previous: number; change: number }
    }
  } | null
}
