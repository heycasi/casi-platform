// Twitch IRC WebSocket client
// Implements IChatClient interface for multi-platform support

import type { IChatClient, UnifiedChatMessage, Platform } from '@/types/chat'
import { analyzeMessage } from '@/lib/multilingual'

/**
 * Twitch IRC WebSocket client
 * Connects to Twitch IRC and transforms messages to UnifiedChatMessage format
 */
export class TwitchChatClient implements IChatClient {
  private ws: WebSocket | null = null
  private channelName: string
  private connected: boolean = false
  private messageCallback: ((message: UnifiedChatMessage) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null
  private connectionChangeCallback: ((connected: boolean) => void) | null = null
  private reconnectTimeout: number | null = null
  private shouldReconnect: boolean = true
  private tier: 'Starter' | 'Pro' | 'Agency'

  // Bot usernames to filter out (same as dashboard)
  private readonly botUsernames = ['nightbot', 'streamelements', 'streamlabs', 'moobot', 'fossabot']

  constructor(channelName: string, tier?: 'Starter' | 'Pro' | 'Agency') {
    this.channelName = channelName.toLowerCase()
    this.tier = tier || 'Starter'
  }

  /**
   * Connect to Twitch IRC
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🟣 [Twitch] Connecting to channel: ${this.channelName}`)

        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')

        this.ws.onopen = () => {
          console.log('🟣 [Twitch] WebSocket connected')

          // Authenticate as anonymous user
          this.ws?.send('PASS SCHMOOPIIE')
          this.ws?.send('NICK justinfan12345')
          this.ws?.send(`JOIN #${this.channelName}`)

          this.connected = true
          this.connectionChangeCallback?.(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error('🔴 [Twitch] WebSocket error:', error)
          const err = new Error('Twitch WebSocket error')
          this.errorCallback?.(err)

          if (!this.connected) {
            reject(err)
          }
        }

        this.ws.onclose = () => {
          console.log('🟣 [Twitch] WebSocket closed')
          this.connected = false
          this.connectionChangeCallback?.(false)

          // Reconnect if we should
          if (this.shouldReconnect) {
            this.reconnectTimeout = window.setTimeout(() => {
              console.log('🟣 [Twitch] Attempting reconnect...')
              this.connect().catch((err) => {
                console.error('🔴 [Twitch] Reconnect failed:', err)
              })
            }, 3000)
          }
        }
      } catch (error) {
        console.error('🔴 [Twitch] Connection error:', error)
        const err = error instanceof Error ? error : new Error('Failed to connect to Twitch')
        this.errorCallback?.(err)
        reject(err)
      }
    })
  }

  /**
   * Disconnect from Twitch IRC
   */
  disconnect(): void {
    console.log('🟣 [Twitch] Disconnecting...')

    this.shouldReconnect = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.connected = false
    this.connectionChangeCallback?.(false)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Register message callback
   */
  onMessage(callback: (message: UnifiedChatMessage) => void): void {
    this.messageCallback = callback
  }

  /**
   * Register error callback
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback
  }

  /**
   * Register connection change callback
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionChangeCallback = callback
  }

  /**
   * Handle incoming IRC message
   */
  private handleMessage(data: string): void {
    const message = data.trim()

    // Handle PING/PONG to keep connection alive
    if (message.startsWith('PING')) {
      this.ws?.send('PONG :tmi.twitch.tv')
      return
    }

    // Parse chat messages
    // Format: :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
    const chatMatch = message.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/)

    if (chatMatch) {
      const [, username, messageText] = chatMatch

      // Filter out bot messages
      if (this.botUsernames.includes(username.toLowerCase())) {
        return
      }

      // Analyze message with user's tier for feature gating
      const analysis = analyzeMessage(messageText, this.tier)

      // Transform to UnifiedChatMessage format
      const unifiedMessage: UnifiedChatMessage = {
        id: `twitch-${Date.now()}-${Math.random()}`,
        username,
        message: messageText,
        timestamp: Date.now(),
        platform: 'twitch' as Platform,

        // Analysis results
        language: analysis.language,
        language_confidence: analysis.confidence,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentimentScore,
        sentiment_reason: analysis.sentimentReason,
        is_question: analysis.isQuestion,
        question_type: analysis.questionType,
        engagement_level: analysis.engagementLevel,
        topics: analysis.topics,

        // Platform-specific metadata
        platform_message_id: `twitch-${username}-${Date.now()}`,
        user_id: username.toLowerCase(),
        display_name: username,
      }

      // Emit message to callback
      this.messageCallback?.(unifiedMessage)
    }
  }
}
