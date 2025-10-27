// Unified chat types for multi-platform support
// Supports Twitch, Kick, and future platforms

export type Platform = 'twitch' | 'kick'

export type Sentiment = 'positive' | 'negative' | 'neutral'

export type EngagementLevel = 'high' | 'medium' | 'low'

/**
 * Unified chat message format that works across all platforms
 * This is the standardized format after platform-specific parsing
 */
export interface UnifiedChatMessage {
  // Core message data
  id: string
  username: string
  message: string
  timestamp: number
  platform: Platform

  // Analysis results (from multilingual.ts)
  language: string
  language_confidence: number
  sentiment: Sentiment
  sentiment_score: number
  sentiment_reason: string
  is_question: boolean
  question_type: string
  engagement_level: EngagementLevel
  topics: string[]

  // Optional platform-specific metadata
  platform_message_id?: string // For deduplication
  user_id?: string // Platform-specific user ID
  display_name?: string // If different from username
  badges?: string[] // Subscriber, moderator, etc.
  emotes?: any[] // Platform-specific emote data
}

/**
 * Chat client interface that all platform clients must implement
 * Provides a consistent API for connecting to different chat platforms
 */
export interface IChatClient {
  /**
   * Connect to the chat platform
   * @throws Error if connection fails
   */
  connect(): Promise<void>

  /**
   * Disconnect from the chat platform
   */
  disconnect(): void

  /**
   * Check if currently connected
   */
  isConnected(): boolean

  /**
   * Register callback for new messages
   * @param callback Function to call when a message is received
   */
  onMessage(callback: (message: UnifiedChatMessage) => void): void

  /**
   * Register callback for errors
   * @param callback Function to call when an error occurs
   */
  onError(callback: (error: Error) => void): void

  /**
   * Register callback for connection state changes
   * @param callback Function to call when connection state changes
   */
  onConnectionChange?(callback: (connected: boolean) => void): void
}

/**
 * Stream session data for tracking active streams
 */
export interface StreamSession {
  sessionId: string
  platform: Platform
  channelName: string
  startTime: number
  isActive: boolean
}

/**
 * Multi-platform session tracking
 * Allows tracking simultaneous streams on multiple platforms
 */
export interface MultiPlatformSession {
  twitch: StreamSession | null
  kick: StreamSession | null
}

/**
 * Platform-specific connection status
 */
export interface PlatformConnectionStatus {
  twitch: boolean
  kick: boolean
}

/**
 * Platform-specific error states
 */
export interface PlatformErrors {
  twitch: string | null
  kick: string | null
}

/**
 * Stream info returned from platform APIs
 */
export interface StreamInfo {
  isLive: boolean
  viewerCount: number
  title: string
  thumbnailUrl: string | null
  category: string | null
  username: string
  displayName: string
}
