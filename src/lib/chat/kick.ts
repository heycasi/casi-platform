// Kick.com Chat WebSocket Client
// Uses Pusher protocol to connect to Kick chatrooms
// Implements IChatClient interface for multi-platform support

import type { IChatClient, UnifiedChatMessage, Platform } from '@/types/chat'
import { analyzeMessage } from '@/lib/multilingual'

export class KickChatClient implements IChatClient {
  private ws: WebSocket | null = null
  private chatroomId: number | null = null
  private channelName: string
  private connected: boolean = false
  private messageCallback: ((message: UnifiedChatMessage) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null
  private connectionChangeCallback: ((connected: boolean) => void) | null = null

  constructor(channelName: string) {
    this.channelName = channelName.toLowerCase()
  }

  // Get chatroom ID from Kick API
  async getChatroomId(): Promise<number> {
    try {
      console.log(`🟢 [Kick] Fetching chatroom ID for ${this.channelName}...`)

      const response = await fetch(`https://kick.com/api/v2/channels/${this.channelName}`)

      if (!response.ok) {
        throw new Error(`Channel ${this.channelName} not found on Kick`)
      }

      const data = await response.json()

      if (!data.chatroom?.id) {
        throw new Error(`No chatroom found for ${this.channelName}`)
      }

      console.log(`🟢 [Kick] Chatroom ID: ${data.chatroom.id}`)
      console.log(`🟢 [Kick] Channel is ${data.livestream?.is_live ? 'LIVE' : 'OFFLINE'}`)

      return data.chatroom.id
    } catch (error) {
      console.error('🟢 [Kick] Error fetching chatroom ID:', error)
      throw error
    }
  }

  /**
   * Connect to Kick WebSocket
   */
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get chatroom ID first
        this.chatroomId = await this.getChatroomId()

        console.log(`🟢 [Kick] Connecting to Pusher WebSocket...`)

        // Kick uses Pusher WebSocket - updated app key
        this.ws = new WebSocket(
          'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false'
        )

        this.ws.onopen = () => {
          console.log('🟢 [Kick] WebSocket connected')
          this.subscribe()
          this.connected = true
          this.connectionChangeCallback?.(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error('🔴 [Kick] WebSocket error:', error)
          const err = new Error('Kick WebSocket error')
          this.errorCallback?.(err)

          if (!this.connected) {
            reject(err)
          }
        }

        this.ws.onclose = () => {
          console.log('🟢 [Kick] WebSocket closed')
          this.connected = false
          this.connectionChangeCallback?.(false)
        }
      } catch (error) {
        console.error('🔴 [Kick] Connection failed:', error)
        const err = error instanceof Error ? error : new Error('Failed to connect to Kick')
        this.errorCallback?.(err)
        reject(err)
      }
    })
  }

  // Subscribe to chatroom channel
  private subscribe(): void {
    if (!this.ws || !this.chatroomId) return

    const subscribeMessage = {
      event: 'pusher:subscribe',
      data: {
        auth: '',
        channel: `chatrooms.${this.chatroomId}.v2`,
      },
    }

    console.log(`🟢 [Kick] Subscribing to channel: chatrooms.${this.chatroomId}.v2`)
    this.ws.send(JSON.stringify(subscribeMessage))
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)

      // Pusher sends connection established
      if (message.event === 'pusher:connection_established') {
        console.log('🟢 [Kick] Connection established')
        return
      }

      // Subscription succeeded
      if (message.event === 'pusher_internal:subscription_succeeded') {
        console.log('🟢 [Kick] Subscription succeeded - listening for messages')
        return
      }

      // Chat message event
      if (message.event === 'App\\Events\\ChatMessageEvent') {
        const chatData = JSON.parse(message.data)
        this.processChatMessage(chatData)
        return
      }

      // Log other events for debugging
      if (message.event === 'pusher:error') {
        console.error('🔴 [Kick] Pusher Error:', message)
        return
      }

      if (message.event) {
        console.log('🟢 [Kick] Event:', message.event, message)
      }
    } catch (error) {
      console.error('🟢 [Kick] Error parsing message:', error)
    }
  }

  // Process chat message from Kick
  private processChatMessage(data: any): void {
    try {
      const username = data.sender?.username || 'unknown'
      const messageText = data.content || ''

      console.log(`🟢 [Kick] @${username}: ${messageText}`)

      // Analyze message
      const analysis = analyzeMessage(messageText)

      // Transform to UnifiedChatMessage format
      const unifiedMessage: UnifiedChatMessage = {
        id: `kick-${data.id || Date.now()}-${Math.random()}`,
        username,
        message: messageText,
        timestamp: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
        platform: 'kick' as Platform,

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
        platform_message_id: data.id || `kick-${username}-${Date.now()}`,
        user_id: data.sender?.id?.toString() || username.toLowerCase(),
        display_name: data.sender?.username || username,
      }

      // Emit message to callback
      this.messageCallback?.(unifiedMessage)
    } catch (error) {
      console.error('🔴 [Kick] Error processing chat message:', error)
    }
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
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      console.log('🟢 [Kick] Disconnecting...')
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
}

// Test function for quick prototyping
export async function testKickConnection(channelName: string): Promise<void> {
  console.log('🟢 [Kick] Starting test connection...')

  const client = new KickChatClient(channelName)

  client.onMessage((message) => {
    console.log('📨 Received:', message)
  })

  await client.connect()

  console.log('🟢 [Kick] Test connection established. Listening for messages...')
}
