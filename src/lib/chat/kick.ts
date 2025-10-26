// Kick.com Chat WebSocket Client
// Uses Pusher protocol to connect to Kick chatrooms

export interface KickMessage {
  id: string
  username: string
  message: string
  timestamp: number
  platform: 'kick'
}

export class KickChatClient {
  private ws: WebSocket | null = null
  private chatroomId: number | null = null
  private channelName: string
  private onMessageCallback: ((message: KickMessage) => void) | null = null

  constructor(channelName: string) {
    this.channelName = channelName.toLowerCase()
  }

  // Get chatroom ID from Kick API
  async getChatroomId(): Promise<number> {
    try {
      console.log(`🟢 [Kick] Fetching chatroom ID for ${this.channelName}...`)

      const response = await fetch(
        `https://kick.com/api/v2/channels/${this.channelName}`
      )

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

  // Connect to Kick WebSocket
  async connect(): Promise<void> {
    try {
      // Get chatroom ID first
      this.chatroomId = await this.getChatroomId()

      console.log(`🟢 [Kick] Connecting to Pusher WebSocket...`)

      // Kick uses Pusher WebSocket
      this.ws = new WebSocket(
        'wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false'
      )

      this.ws.onopen = () => {
        console.log('🟢 [Kick] WebSocket connected')
        this.subscribe()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        console.error('🟢 [Kick] WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('🟢 [Kick] WebSocket closed')
      }

    } catch (error) {
      console.error('🟢 [Kick] Connection failed:', error)
      throw error
    }
  }

  // Subscribe to chatroom channel
  private subscribe(): void {
    if (!this.ws || !this.chatroomId) return

    const subscribeMessage = {
      event: 'pusher:subscribe',
      data: {
        auth: '',
        channel: `chatrooms.${this.chatroomId}.v2`
      }
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
      if (message.event) {
        console.log('🟢 [Kick] Event:', message.event)
      }

    } catch (error) {
      console.error('🟢 [Kick] Error parsing message:', error)
    }
  }

  // Process chat message from Kick
  private processChatMessage(data: any): void {
    try {
      const kickMessage: KickMessage = {
        id: data.id || `${Date.now()}-${Math.random()}`,
        username: data.sender?.username || 'unknown',
        message: data.content || '',
        timestamp: new Date(data.created_at).getTime(),
        platform: 'kick'
      }

      console.log(`🟢 [Kick] @${kickMessage.username}: ${kickMessage.message}`)

      // Call callback if registered
      if (this.onMessageCallback) {
        this.onMessageCallback(kickMessage)
      }

    } catch (error) {
      console.error('🟢 [Kick] Error processing chat message:', error)
    }
  }

  // Register message callback
  onMessage(callback: (message: KickMessage) => void): void {
    this.onMessageCallback = callback
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.ws) {
      console.log('🟢 [Kick] Disconnecting...')
      this.ws.close()
      this.ws = null
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
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
