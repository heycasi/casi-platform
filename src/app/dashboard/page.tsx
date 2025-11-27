// src/app/dashboard/page.tsx - Secure Dashboard with OAuth (Multi-Platform Support)
'use client'
import { useState, useEffect, useRef } from 'react'
import { generateMotivationalSuggestion } from '../../lib/multilingual'
import TierUpgradeNudge from '@/components/TierUpgradeNudge'
import FeatureGate from '@/components/FeatureGate'
import HistoryLimitBanner from '@/components/HistoryLimitBanner'
import MultiPlatformActivityFeed from '@/components/MultiPlatformActivityFeed'
import { createChatClient } from '@/lib/chat/factory'
import type { IChatClient, UnifiedChatMessage, Platform } from '@/types/chat'

interface TierStatus {
  avgViewers: number
  limit: number
  isOverLimit: boolean
  daysOverLimit: number
  shouldNudge: boolean
  suggestedTier?: string
  percentOver: number
}

function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  sentimentReason?: string
  sentimentScore?: number
  isQuestion?: boolean
  priority?: 'high' | 'medium' | 'low'
  language?: string
  confidence?: number
  topics?: string[]
  engagementLevel?: 'high' | 'medium' | 'low'
  platform?: Platform // NEW: Platform support
}

interface DashboardStats {
  totalMessages: number
  questions: number
  avgSentiment: number
  positiveMessages: number
  negativeMessages: number
  viewerCount: number
  activeUsers: number
  currentMood: string
}

// Admin user IDs (Twitch user IDs)
const ADMIN_USER_IDS = [
  // Will be auto-populated when you log in via /admin-setup
]

// Admin usernames (Twitch login names)
const ADMIN_USERNAMES = [
  'conzooo_', // Your Twitch username (case-insensitive)
]

// Admin email addresses as fallback
const ADMIN_EMAILS = [
  // Add your email if needed
]

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessDetails, setAccessDetails] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [adminChannelInput, setAdminChannelInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [questions, setQuestions] = useState<ChatMessage[]>([])
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null)
  const [elapsedDuration, setElapsedDuration] = useState<string>('00:00:00')
  const [topChatters, setTopChatters] = useState<
    Array<{ username: string; count: number; topics: string[] }>
  >([])
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null)
  const [userTier, setUserTier] = useState<'Starter' | 'Pro' | 'Agency'>('Starter')
  const [previousMood, setPreviousMood] = useState<string>('Neutral')
  const [moodChanged, setMoodChanged] = useState(false)
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null)
  const [engagementLevel, setEngagementLevel] = useState<'Low' | 'Moderate' | 'High'>('Low')
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    questions: 0,
    avgSentiment: 0,
    positiveMessages: 0,
    negativeMessages: 0,
    viewerCount: 0,
    activeUsers: 0,
    currentMood: 'Neutral',
  })

  // Ref for auto-scrolling chat feed
  const chatFeedRef = useRef<HTMLDivElement>(null)

  // NEW: Multi-platform state
  const [kickUsername, setKickUsername] = useState<string | null>(null)
  const [kickConnected, setKickConnected] = useState(false)
  const twitchClientRef = useRef<IChatClient | null>(null)
  const kickClientRef = useRef<IChatClient | null>(null)

  // Platform filter for chat feed
  const [platformFilter, setPlatformFilter] = useState<'all' | 'twitch' | 'kick'>('all')

  // Message batching for efficient API calls
  const messageBatchRef = useRef<any[]>([])
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const botUsernames = [
    'nightbot',
    'streamelements',
    'moobot',
    'fossabot',
    'wizebot',
    'streamlabs',
    'botisimo',
    'deepbot',
    'ankhbot',
    'revlobot',
    'phantombot',
    'coebot',
    'ohbot',
    'tipeeebot',
    'chatty',
    'streamdeckerbot',
    'vivbot',
    'soundalerts',
    'own3dbot',
    'pretzelrocks',
    'songrequestbot',
    'musicbot',
  ]

  // Batch message storage to database
  const flushMessageBatch = async () => {
    if (!currentSessionId || messageBatchRef.current.length === 0) return

    const batch = [...messageBatchRef.current]
    messageBatchRef.current = []

    try {
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: batch,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to save message batch:', error)
      }
    } catch (error) {
      console.error('Error saving message batch:', error)
    }
  }

  // Add message to batch and schedule flush
  const batchStoreMessage = (message: any) => {
    messageBatchRef.current.push(message)

    // Flush every 10 messages or every 5 seconds
    if (messageBatchRef.current.length >= 10) {
      flushMessageBatch()
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current)
        batchTimerRef.current = null
      }
    } else if (!batchTimerRef.current) {
      batchTimerRef.current = setTimeout(() => {
        flushMessageBatch()
        batchTimerRef.current = null
      }, 5000)
    }
  }

  // Update session stats via API
  const updateSessionStats = async (sessionId: string, stats: any) => {
    try {
      await fetch('/api/sessions/stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stats,
        }),
      })
    } catch (error) {
      console.error('Failed to update session stats:', error)
    }
  }

  // NEW: Unified message handler for both platforms
  const handleUnifiedMessage = (unifiedMessage: UnifiedChatMessage) => {
    const chatMessage: ChatMessage = {
      id: unifiedMessage.id,
      username: unifiedMessage.username,
      message: unifiedMessage.message,
      timestamp: unifiedMessage.timestamp,
      sentiment: unifiedMessage.sentiment,
      sentimentReason: unifiedMessage.sentiment_reason,
      sentimentScore: unifiedMessage.sentiment_score,
      isQuestion: unifiedMessage.is_question,
      language: unifiedMessage.language,
      confidence: unifiedMessage.language_confidence,
      topics: unifiedMessage.topics,
      engagementLevel: unifiedMessage.engagement_level,
      priority: unifiedMessage.is_question
        ? 'high'
        : unifiedMessage.engagement_level === 'high'
          ? 'medium'
          : 'low',
      platform: unifiedMessage.platform, // NEW: Include platform
    }

    setMessages((prev) => [...prev.slice(-49), chatMessage])

    if (unifiedMessage.is_question) {
      setHighlightedQuestionId(chatMessage.id)
      setTimeout(() => {
        setQuestions((prev) => [...prev.slice(-9), chatMessage])
        setHighlightedQuestionId(null)
      }, 1500)
    }

    if (currentSessionId) {
      batchStoreMessage({
        username: unifiedMessage.username,
        message: unifiedMessage.message,
        timestamp: unifiedMessage.timestamp,
        language: unifiedMessage.language,
        sentiment: unifiedMessage.sentiment_score,
        isQuestion: unifiedMessage.is_question,
        engagementLevel: unifiedMessage.engagement_level,
      })
    }
  }

  // Check if user is admin
  const checkAdminStatus = (user: any) => {
    if (!user) return false

    // Check by Twitch user ID
    if (user.id && ADMIN_USER_IDS.includes(user.id)) {
      return true
    }

    // Check by Twitch username (case-insensitive)
    if (
      user.login &&
      ADMIN_USERNAMES.map((u) => u.toLowerCase()).includes(user.login.toLowerCase())
    ) {
      return true
    }

    // Check by display_name as fallback
    if (
      user.display_name &&
      ADMIN_USERNAMES.map((u) => u.toLowerCase()).includes(user.display_name.toLowerCase())
    ) {
      return true
    }

    // Check by email
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true
    }

    return false
  }

  useEffect(() => {
    const twitchUserRaw = localStorage.getItem('twitch_user')
    const savedEmail = localStorage.getItem('casi_user_email')

    if (twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        setTwitchUser(tu)

        // Check admin status
        const adminStatus = checkAdminStatus(tu)
        setIsAdmin(adminStatus)

        if (tu?.login) {
          setIsAuthenticated(true)
          setChannelName(tu.login)
          setEmail(tu.email || savedEmail || '')
        }
      } catch {}
    }

    if (savedEmail) {
      setEmail(savedEmail)
    }

    // Restore session state from localStorage
    try {
      const savedSession = localStorage.getItem('casi_active_session')
      if (savedSession) {
        const session = JSON.parse(savedSession)

        // Only restore if session is less than 12 hours old
        const sessionAge = Date.now() - session.timestamp
        if (sessionAge < 12 * 60 * 60 * 1000) {
          setCurrentSessionId(session.sessionId)
          setIsConnected(session.isConnected)
          setStreamStartTime(session.streamStartTime)
          setMessages(session.messages || [])
          setQuestions(session.questions || [])
          setStats(
            session.stats || {
              totalMessages: 0,
              questions: 0,
              avgSentiment: 0,
              positiveMessages: 0,
              negativeMessages: 0,
              viewerCount: 0,
              activeUsers: 0,
              currentMood: 'Neutral',
            }
          )
          setTopChatters(session.topChatters || [])

          // Restore admin channel if present
          if (session.adminChannel) {
            setChannelName(session.adminChannel)
            setAdminChannelInput(session.adminChannel)
          }

          console.log('Restored session:', session.sessionId)
        } else {
          // Clear old session
          localStorage.removeItem('casi_active_session')
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
      localStorage.removeItem('casi_active_session')
    }
  }, [])

  // Check user access (subscription or trial)
  useEffect(() => {
    if (!email) {
      setAccessLoading(false)
      return
    }

    const checkAccess = async () => {
      setAccessLoading(true)
      try {
        const response = await fetch(`/api/user-access?email=${encodeURIComponent(email)}`)
        const data = await response.json()

        setAccessDetails(data)
        setHasAccess(data.has_access || false)

        // Extract and set user tier (default to 'Starter' if not present)
        const tier = (data.tier_name || 'Starter') as 'Starter' | 'Pro' | 'Agency'
        setUserTier(tier)

        // If admin, always grant access
        if (isAdmin) {
          setHasAccess(true)
        }
      } catch (error) {
        console.error('Failed to check user access:', error)
        setHasAccess(false)
      } finally {
        setAccessLoading(false)
      }
    }

    checkAccess()
  }, [email, isAdmin])

  // NEW: Fetch Kick username from database
  useEffect(() => {
    if (!email) return

    const fetchKickUsername = async () => {
      try {
        const response = await fetch(`/api/user/kick-username?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.kick_username) {
            setKickUsername(data.kick_username)
            console.log(`🟢 Kick username loaded: ${data.kick_username}`)
          }
        }
      } catch (error) {
        console.error('Failed to fetch Kick username:', error)
      }
    }

    fetchKickUsername()
  }, [email])

  // Fetch tier status for the user
  useEffect(() => {
    if (!email) return

    const fetchTierStatus = async () => {
      try {
        const response = await fetch(`/api/tier-status?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const status = await response.json()
          setTierStatus(status)
        }
      } catch (error) {
        console.error('Failed to fetch tier status:', error)
      }
    }

    fetchTierStatus()
    // Refresh tier status every 5 minutes
    const interval = setInterval(fetchTierStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [email])

  // Removed auto-scroll - newest messages now appear at top

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    // For admins, save even without a sessionId (they might be monitoring without a session)
    // For regular users, require both sessionId and connection
    if (!isConnected) return
    if (!isAdmin && !currentSessionId) return

    const sessionState = {
      sessionId: currentSessionId || null,
      isConnected,
      streamStartTime,
      messages: messages.slice(-100), // Keep last 100 messages to avoid localStorage limits
      questions: questions.slice(-50), // Keep last 50 questions
      stats,
      topChatters: topChatters.slice(0, 10), // Keep top 10 chatters
      adminChannel: isAdmin && channelName !== twitchUser?.login ? channelName : null, // Save admin channel if monitoring another channel
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem('casi_active_session', JSON.stringify(sessionState))
      console.log('Session saved:', {
        channel: channelName,
        adminChannel: sessionState.adminChannel,
      })
    } catch (error) {
      console.error('Failed to save session state:', error)
    }
  }, [
    currentSessionId,
    isConnected,
    streamStartTime,
    messages,
    questions,
    stats,
    topChatters,
    channelName,
    isAdmin,
    twitchUser,
  ])

  // Clear session state when disconnecting
  useEffect(() => {
    if (!isConnected && currentSessionId === null) {
      localStorage.removeItem('casi_active_session')
    }
  }, [isConnected, currentSessionId])

  // Auto-connect when Twitch user is present and live
  useEffect(() => {
    if (!twitchUser || isConnected || isAdmin) return // Don't auto-connect for admins

    const checkLiveAndConnect = async () => {
      try {
        const res = await fetch(
          `/api/twitch/stream-info?user_id=${encodeURIComponent(twitchUser.id)}`
        )
        const info = await res.json()
        if (info?.live) {
          // Set initial viewer count when auto-connecting
          if (info?.viewer_count != null) {
            setStats((prev) => ({ ...prev, viewerCount: info.viewer_count }))
          }
          setIsConnected(true)
        }
      } catch {}
    }

    checkLiveAndConnect()
    const id = window.setInterval(checkLiveAndConnect, 30000)
    return () => clearInterval(id)
  }, [twitchUser, isConnected, isAdmin])

  // Create session when connecting
  const startSession = async () => {
    if (email && channelName) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamerEmail: email, channelName }),
        })

        if (!response.ok) {
          throw new Error('Failed to create session')
        }

        const { sessionId } = await response.json()
        setCurrentSessionId(sessionId)
        console.log('Started session:', sessionId)
      } catch (error) {
        console.error('Failed to start session:', error)
      }
    }
  }

  // End session and optionally generate report
  const endSession = async (skipReport = false) => {
    if (currentSessionId) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId }),
        })

        if (response.ok) {
          console.log('✅ Ended session:', currentSessionId)
        }

        // Only generate reports for regular users, not admins monitoring other channels
        if (!isAdmin && !skipReport) {
          console.log('📊 Scheduling report generation in 2 seconds...')
          setTimeout(() => {
            generateReport(currentSessionId)
          }, 2000)
        } else if (isAdmin) {
          console.log('👤 Admin user - skipping automatic report generation')
        } else if (skipReport) {
          console.log('⏭️ Report generation skipped (manual disconnect)')
        }
      } catch (error) {
        console.error('❌ Failed to end session:', error)
      }
    }
    setStreamStartTime(null)

    // Clear session state from localStorage
    localStorage.removeItem('casi_active_session')
  }

  // Manual disconnect with report generation
  const handleManualDisconnect = async () => {
    if (currentSessionId && !isAdmin) {
      setIsGeneratingReport(true)
      try {
        // End the session first
        const response = await fetch('/api/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId }),
        })

        if (response.ok) {
          console.log('✅ Session ended via manual disconnect')
        }

        // Generate report immediately
        console.log('📊 Generating post-stream report...')
        await generateReport(currentSessionId)
      } catch (error) {
        console.error('❌ Failed during manual disconnect:', error)
      } finally {
        setIsGeneratingReport(false)
      }
    }

    // Disconnect UI
    setIsConnected(false)
    setMessages([])
    setQuestions([])
    setMotivationalMessage(null)
    setCurrentSessionId(null)
    setAdminChannelInput('')
    setStreamStartTime(null)
    localStorage.removeItem('casi_active_session')
  }

  // Duration ticker lifecycle
  useEffect(() => {
    if (!isConnected) return
    const start = streamStartTime ?? Date.now()
    if (!streamStartTime) setStreamStartTime(start)
    setElapsedDuration('00:00:00')
    const intervalId = window.setInterval(() => {
      setElapsedDuration(formatDurationMs(Date.now() - start))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [isConnected, streamStartTime])

  // Handle page close/refresh - auto-end session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentSessionId && isConnected) {
        // End session synchronously before page closes
        navigator.sendBeacon(
          '/api/sessions',
          JSON.stringify({
            sessionId: currentSessionId,
          })
        )

        // Show confirmation dialog if user is connected to a stream
        e.preventDefault()
        e.returnValue = 'You have an active stream session. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentSessionId, isConnected])

  // Generate and send report
  const generateReport = async (sessionId: string) => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email }),
      })

      if (response.ok) {
        console.log('Report generated and sent successfully')
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // NEW: Multi-platform connection useEffect
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    // Only create a new session if one doesn't exist
    if (!currentSessionId) {
      startSession()
    }

    let viewerInterval: number | null = null

    // Connect to Twitch
    const connectToTwitch = async () => {
      try {
        console.log(`🟣 Connecting to Twitch: ${channelName}`)

        const client = createChatClient('twitch', channelName, userTier)
        twitchClientRef.current = client

        client.onMessage(handleUnifiedMessage)
        client.onError((error) => {
          console.error('🔴 [Twitch Error]:', error)
        })

        await client.connect()
        console.log('🟣 Twitch connected successfully')
      } catch (error) {
        console.error('🔴 Failed to connect to Twitch:', error)
      }
    }

    // Connect to Kick (Pro/Agency only)
    const connectToKick = async () => {
      // Tier-gating: Kick is only available for Pro and Agency users
      if (userTier === 'Starter') {
        console.log('🟢 [Kick] Skipping - Kick is a Pro feature (Starter tier)')
        return
      }

      // Determine which Kick channel to connect to
      // If admin is monitoring a different channel, use that channel name
      // Otherwise use the user's configured Kick username
      const kickChannelToMonitor =
        isAdmin && adminChannelInput
          ? channelName // Use the same channel name as Twitch
          : kickUsername // Use user's configured Kick username

      if (!kickChannelToMonitor) {
        console.log('🟢 No Kick channel to monitor, skipping Kick connection')
        return
      }

      try {
        console.log(`🟢 Connecting to Kick: ${kickChannelToMonitor} (${userTier} tier)`)

        const client = createChatClient('kick', kickChannelToMonitor, userTier)
        kickClientRef.current = client

        client.onMessage(handleUnifiedMessage)
        client.onError((error) => {
          console.error('🔴 [Kick Error]:', error)
        })
        client.onConnectionChange?.((connected) => {
          setKickConnected(connected)
        })

        await client.connect()
        console.log('🟢 Kick connected successfully')
        setKickConnected(true)
      } catch (error) {
        console.error('🔴 Failed to connect to Kick:', error)
        setKickConnected(false)
      }
    }

    // Connect to both platforms
    connectToTwitch()
    connectToKick() // Will be skipped if Starter tier

    // Real viewer count from Twitch API
    // Always use the channelName (the channel we're monitoring) for viewer count
    const fetchViewers = async () => {
      try {
        // Use channelName for viewer count - this is the channel being monitored
        const queryParam = `user_login=${encodeURIComponent(channelName)}`

        console.log(`[Viewer Count] Fetching viewer count for channel: ${channelName}`)
        console.log(`[Viewer Count] API URL: /api/twitch/stream-info?${queryParam}`)

        const res = await fetch(`/api/twitch/stream-info?${queryParam}`)
        const info = await res.json()

        console.log('[Viewer Count] API Response:', info)

        if (info?.live && info?.viewer_count != null) {
          console.log(`[Viewer Count] ✅ Setting viewer count to: ${info.viewer_count}`)
          setStats((prev) => ({ ...prev, viewerCount: info.viewer_count }))
        } else if (!info?.live) {
          console.warn('[Viewer Count] ⚠️ Stream reported as not live by Twitch API')
        } else {
          console.warn('[Viewer Count] ⚠️ No viewer_count in API response')
        }

        if (info?.started_at) {
          const start = new Date(info.started_at).getTime()
          setStreamStartTime(start)
          setElapsedDuration(formatDurationMs(Date.now() - start))
        }
      } catch (error) {
        console.error('[Viewer Count] ❌ Failed to fetch:', error)
      }
    }

    console.log('[Viewer Count] Setting up viewer count fetch interval')
    console.log('[Viewer Count] twitchUser:', twitchUser)
    console.log('[Viewer Count] channelName:', channelName)

    fetchViewers() // Fetch immediately on connect
    viewerInterval = window.setInterval(() => {
      console.log('[Viewer Count] Interval tick - fetching viewers')
      fetchViewers()
    }, 5000) // Update every 5 seconds to stay in sync with Twitch

    console.log('[Viewer Count] Interval ID:', viewerInterval)

    return () => {
      console.log('[Multi-Platform] Cleaning up - disconnecting clients and clearing interval')

      // Disconnect Twitch client
      if (twitchClientRef.current) {
        twitchClientRef.current.disconnect()
        twitchClientRef.current = null
      }

      // Disconnect Kick client
      if (kickClientRef.current) {
        kickClientRef.current.disconnect()
        kickClientRef.current = null
        setKickConnected(false)
      }

      // Clear viewer count interval
      if (viewerInterval) {
        clearInterval(viewerInterval)
      }
    }
  }, [isConnected, channelName, kickUsername])

  useEffect(() => {
    if (!isConnected || messages.length < 10) return

    const interval = setInterval(() => {
      const recentMessages = messages.slice(-20)
      const suggestion = generateMotivationalSuggestion(recentMessages)
      if (suggestion) {
        setMotivationalMessage(suggestion)
        setTimeout(() => setMotivationalMessage(null), 15000)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [messages, isConnected])

  useEffect(() => {
    const uniqueUsers = new Set(messages.map((m) => m.username)).size
    const positiveMessages = messages.filter((m) => m.sentiment === 'positive').length
    const negativeMessages = messages.filter((m) => m.sentiment === 'negative').length

    const sentimentValues = messages.map((m) => m.sentimentScore || 0)
    const avgSentiment =
      sentimentValues.length > 0
        ? Math.round((sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length) * 100) /
          100
        : 0

    const recentMessages = messages.slice(-10)
    const recentPositive = recentMessages.filter((m) => m.sentiment === 'positive').length
    const recentNegative = recentMessages.filter((m) => m.sentiment === 'negative').length

    let currentMood = 'Neutral'
    if (recentPositive > recentNegative * 2) currentMood = 'Very Positive'
    else if (recentPositive > recentNegative) currentMood = 'Positive'
    else if (recentNegative > recentPositive * 2) currentMood = 'Negative'
    else if (recentNegative > recentPositive) currentMood = 'Slightly Negative'

    // Calculate engagement level based on message/viewer ratio
    // Only calculate if we have a valid viewer count (not 0)
    if (stats.viewerCount > 0) {
      const messageRatio = messages.length / stats.viewerCount
      let newEngagementLevel: 'Low' | 'Moderate' | 'High' = 'Low'
      if (messageRatio > 0.5) newEngagementLevel = 'High'
      else if (messageRatio > 0.2) newEngagementLevel = 'Moderate'
      setEngagementLevel(newEngagementLevel)
    }

    // Detect mood change for animation
    if (currentMood !== previousMood && messages.length > 5) {
      setPreviousMood(currentMood)
      setMoodChanged(true)
      setTimeout(() => setMoodChanged(false), 2000)
    }

    setStats((prev) => ({
      ...prev, // Preserve viewerCount from Twitch API fetches
      totalMessages: messages.length,
      questions: questions.length,
      avgSentiment,
      positiveMessages,
      negativeMessages,
      activeUsers: uniqueUsers,
      currentMood,
    }))

    const counts: Record<string, number> = {}
    const userTopics: Record<string, Set<string>> = {}
    messages.forEach((m) => {
      counts[m.username] = (counts[m.username] || 0) + 1
      if (!userTopics[m.username]) userTopics[m.username] = new Set()
      if (m.topics && m.topics.length > 0) {
        m.topics.forEach((topic) => userTopics[m.username].add(topic))
      }
    })
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, count]) => ({
        username,
        count,
        topics: Array.from(userTopics[username] || []).slice(0, 2), // Top 2 topics per chatter
      }))
    setTopChatters(top)

    if (currentSessionId && messages.length > 0) {
      updateSessionStats(currentSessionId, {
        peak_viewer_count: stats.viewerCount || 0,
        total_messages: messages.length,
        unique_chatters: uniqueUsers,
      })
    }
  }, [messages, questions])

  // Not authenticated - require Twitch login
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, Arial, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <img
              src="/landing-logo.png"
              alt="Casi"
              style={{
                width: '200px',
                height: 'auto',
              }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
          </div>

          <h1
            style={{
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0 0 1rem 0',
              background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Connect your Twitch
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
            }}
          >
            Sign in with Twitch to auto-connect to your channel and sync viewers.
          </p>

          <button
            onClick={() => {
              const clientId =
                process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '8lmg8rwlkhlom3idj51xka2eipxd18'
              const baseUrl =
                typeof window !== 'undefined' ? window.location.origin : 'https://heycasi.com'
              const redirectUri = `${baseUrl}/auth/callback`
              const scopes =
                'user:read:email chat:read channel:read:subscriptions moderator:read:followers bits:read'
              const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`

              // Debug logging
              console.log('🔍 Twitch OAuth Debug:')
              console.log('  window.location.origin:', window.location.origin)
              console.log('  baseUrl:', baseUrl)
              console.log('  redirectUri:', redirectUri)
              console.log('  Full auth URL:', authUrl)

              window.location.href = authUrl
            }}
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: 'Poppins, Arial, sans-serif',
              boxSizing: 'border-box',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Connect with Twitch
          </button>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              margin: '1.5rem 0 0 0',
            }}
          >
            Secure OAuth • Read-only access • Privacy protected
          </p>
        </div>
      </div>
    )
  }

  // Checking access...
  if (accessLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, Arial, sans-serif',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Checking your access...</p>
        </div>
      </div>
    )
  }

  // No access - require subscription or beta code
  if (!hasAccess && !isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, Arial, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}
          >
            🔒
          </div>

          <h1
            style={{
              color: 'white',
              fontSize: '1.875rem',
              fontWeight: 'bold',
              margin: '0 0 1rem 0',
            }}
          >
            {accessDetails?.status === 'trial_expired' ? 'Trial Expired' : 'Subscription Required'}
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              lineHeight: '1.6',
            }}
          >
            {accessDetails?.message ||
              'You need an active subscription or beta code to access the dashboard.'}
          </p>

          {accessDetails?.status === 'trial_expired' && accessDetails?.trial_ends_at && (
            <div
              style={{
                background: 'rgba(255, 159, 159, 0.1)',
                border: '1px solid rgba(255, 159, 159, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#FF9F9F' }}>
                Your trial ended on {new Date(accessDetails.trial_ends_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a
              href="/pricing"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                borderRadius: '12px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              View Plans & Subscribe
            </a>

            <a
              href="/"
              style={{
                display: 'inline-block',
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white',
      }}
    >
      {/* Header with Navigation */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/landing-logo.png"
            alt="Casi"
            style={{ height: '32px', width: 'auto' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('h1')
              fallback.style.cssText =
                'margin: 0; font-size: 1.3rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
              fallback.textContent = 'Casi'
              target.parentNode?.appendChild(fallback)
            }}
          />

          <img
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{ width: '32px', height: '32px' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.style.cssText =
                'width: 32px; height: 32px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
            }}
          />

          {isAdmin && (
            <span
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '700',
                marginLeft: '0.5rem',
              }}
            >
              👑 ADMIN
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="/"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
            }}
          >
            Home
          </a>
          <a
            href="/beta-signup"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
            }}
          >
            Beta Program
          </a>

          {/* Account Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: twitchUser?.profile_image_url
                  ? `url(${twitchUser.profile_image_url}) center/cover`
                  : 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem',
              }}
            >
              {!twitchUser?.profile_image_url && '👤'}
            </button>

            {showAccountDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  background: '#1a1d2e',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  minWidth: '200px',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
                onMouseLeave={() => setShowAccountDropdown(false)}
              >
                {/* User Info */}
                <div
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(105, 50, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {twitchUser?.display_name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {email}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '0.5rem' }}>
                  {isAdmin && (
                    <a
                      href="/admin/reports"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        marginBottom: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'
                      }}
                    >
                      <span>🛠️</span>
                      <span style={{ fontWeight: '600' }}>Admin Tools</span>
                    </a>
                  )}

                  <a
                    href="/account"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span>⚙️</span>
                    <span>My Account</span>
                  </a>

                  <button
                    onClick={() => {
                      localStorage.removeItem('twitch_access_token')
                      localStorage.removeItem('twitch_user')
                      localStorage.removeItem('casi_user_email')
                      window.location.href = '/login'
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                      fontFamily: 'Poppins, Arial, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* Connection Panel - Admin can view any channel */}
        {!isConnected && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '500px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {isAdmin ? (
              <>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F7F7F7' }}>
                  👑 Admin Panel
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 1rem 0' }}>
                  Enter any Twitch channel to monitor
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <input
                    type="text"
                    placeholder="channel name"
                    value={adminChannelInput}
                    onChange={(e) => setAdminChannelInput(e.target.value)}
                    style={{
                      padding: '0.6rem 0.9rem',
                      borderRadius: '20px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      flex: 1,
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (adminChannelInput.trim()) {
                        const channel = adminChannelInput.trim()
                        setChannelName(channel)
                        setIsConnected(true)
                        setMessages([])
                        setQuestions([])
                        setMotivationalMessage(null)

                        // Automatically set up raid subscription for this channel
                        try {
                          const {
                            data: { session },
                          } = await supabase.auth.getSession()
                          if (session?.access_token) {
                            await fetch('/api/admin/setup-raid-subscription', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${session.access_token}`,
                              },
                              body: JSON.stringify({ channelName: channel }),
                            })
                            console.log(`✅ Raid subscription set up for ${channel}`)
                          }
                        } catch (error) {
                          console.error('Failed to set up raid subscription:', error)
                        }
                      }
                    }}
                    disabled={!adminChannelInput.trim()}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '20px',
                      border: 'none',
                      background: adminChannelInput.trim()
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                        : 'rgba(255,255,255,0.1)',
                      color: adminChannelInput.trim() ? '#000' : 'white',
                      fontWeight: '600',
                      cursor: adminChannelInput.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Connect
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F7F7F7' }}>
                  🎮 Waiting for your stream...
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 1rem 0' }}>
                  Go live on Twitch and your dashboard will auto-connect!
                </p>
                <div
                  style={{
                    background: 'rgba(184, 238, 138, 0.1)',
                    border: '1px solid rgba(184, 238, 138, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#B8EE8A' }}>
                    ✨ Connected as <strong>@{twitchUser?.login || 'Unknown'}</strong>
                  </p>
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    Your dashboard will automatically activate when you start streaming
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Connected State */}
        {isConnected && (
          <>
            {/* Combined Status & Welcome Banner - Left Aligned */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(94, 234, 212, 0.15))',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                border: '1px solid rgba(184, 238, 138, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: 'fit-content',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    background: '#B8EE8A',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span style={{ color: '#F7F7F7', fontSize: '0.8rem', fontWeight: '500' }}>
                  Connected to @{channelName}
                </span>
              </div>

              <div
                style={{
                  height: '12px',
                  width: '1px',
                  background: 'rgba(255, 255, 255, 0.2)',
                }}
              />

              <span style={{ color: '#F7F7F7', fontSize: '0.8rem' }}>
                Hey! Your friendly stream sidekick is analyzing chat 🎮✨
              </span>

              {streamStartTime && (
                <>
                  <div
                    style={{
                      height: '12px',
                      width: '1px',
                      background: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <span style={{ color: '#B8EE8A', fontSize: '0.8rem', fontWeight: '600' }}>
                    ⏱️ {elapsedDuration}
                  </span>
                </>
              )}

              <button
                onClick={handleManualDisconnect}
                disabled={isGeneratingReport}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: isGeneratingReport
                    ? 'linear-gradient(135deg, rgba(147, 47, 254, 0.3), rgba(105, 50, 255, 0.3))'
                    : isAdmin
                      ? 'rgba(255, 159, 159, 0.2)'
                      : 'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(94, 234, 212, 0.2))',
                  border: isGeneratingReport
                    ? '1px solid rgba(147, 47, 254, 0.5)'
                    : isAdmin
                      ? '1px solid rgba(255, 159, 159, 0.4)'
                      : '1px solid rgba(184, 238, 138, 0.4)',
                  borderRadius: '12px',
                  color: isGeneratingReport ? '#B8A4FF' : isAdmin ? '#FF9F9F' : '#B8EE8A',
                  cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  opacity: isGeneratingReport ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {isGeneratingReport
                  ? '📧 Generating Report...'
                  : isAdmin
                    ? 'Disconnect'
                    : '🎬 End Stream & Get Report'}
              </button>
            </div>

            {/* Trial Status Banner */}
            {accessDetails?.is_trial && accessDetails?.trial_days_remaining && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(184, 238, 138, 0.1))',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(184, 238, 138, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div
                    style={{
                      background: '#B8EE8A',
                      color: '#151E3C',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    BETA TRIAL
                  </div>
                  <div>
                    <p
                      style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#F7F7F7' }}
                    >
                      {accessDetails.trial_days_remaining} days remaining
                    </p>
                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      Trial ends {new Date(accessDetails.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href="/pricing"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                    borderRadius: '8px',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Upgrade Now
                </a>
              </div>
            )}

            {/* Tier Upgrade Nudge */}
            {tierStatus && tierStatus.isOverLimit && (
              <TierUpgradeNudge
                currentTier={tierStatus.suggestedTier === 'Pro' ? 'Starter' : 'Pro'}
                avgViewers={tierStatus.avgViewers}
                viewerLimit={tierStatus.limit}
                daysOverLimit={tierStatus.daysOverLimit}
                percentOver={tierStatus.percentOver}
              />
            )}

            {/* AI Motivational Message */}
            {motivationalMessage && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.1))',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    background: '#5EEAD4',
                    color: '#151E3C',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🤖 AI INSIGHT
                </div>

                <p style={{ margin: 0, color: '#F7F7F7', fontSize: '0.9rem', flex: 1 }}>
                  {motivationalMessage}
                </p>

                <button
                  onClick={() => setMotivationalMessage(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Report Generation Status */}
            {isGeneratingReport && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(147, 47, 254, 0.2), rgba(147, 47, 254, 0.1))',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(147, 47, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    background: '#932FFE',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                  }}
                >
                  📊 GENERATING REPORT
                </div>
                <p style={{ margin: 0, color: '#F7F7F7', fontSize: '0.9rem' }}>
                  Processing your stream analytics and preparing your summary report...
                </p>
              </div>
            )}

            {/* Analytics - v2.0 Compact Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {[
                { icon: '👥', value: stats.viewerCount || 0, label: 'Viewers', color: '#5EEAD4' },
                { icon: '💬', value: stats.totalMessages, label: 'Messages', color: '#5EEAD4' },
                {
                  icon:
                    engagementLevel === 'High'
                      ? '🔥'
                      : engagementLevel === 'Moderate'
                        ? '📊'
                        : '📉',
                  value: `${engagementLevel}`,
                  label: 'Engagement',
                  color:
                    engagementLevel === 'High'
                      ? '#B8EE8A'
                      : engagementLevel === 'Moderate'
                        ? '#5EEAD4'
                        : '#FF9F9F',
                },
                { icon: '❓', value: stats.questions, label: 'Questions', color: '#FF9F9F' },
                {
                  icon:
                    stats.currentMood === 'Very Positive'
                      ? '😊'
                      : stats.currentMood === 'Positive'
                        ? '🙂'
                        : stats.currentMood === 'Negative'
                          ? '😢'
                          : stats.currentMood === 'Slightly Negative'
                            ? '😕'
                            : '😐',
                  value: stats.currentMood,
                  label: 'Sentiment',
                  color: stats.currentMood.includes('Positive')
                    ? '#B8EE8A'
                    : stats.currentMood.includes('Negative')
                      ? '#FF9F9F'
                      : '#F7F7F7',
                },
                { icon: '✨', value: stats.positiveMessages, label: 'Positive', color: '#B8EE8A' },
                { icon: '💔', value: stats.negativeMessages, label: 'Negative', color: '#FF9F9F' },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.4rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    animation:
                      stat.label === 'Sentiment' && moodChanged ? 'sentimentGlow 2s ease' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: '0.9rem', margin: '0 0 0.15rem 0' }}>{stat.icon}</div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: stat.color,
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.7, marginTop: '0.1rem' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Contextual Insight Tip */}
            {messages.length > 5 && (
              <div
                style={{
                  background: 'rgba(94, 234, 212, 0.05)',
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.4',
                  }}
                >
                  {stats.currentMood.includes('Positive') ? (
                    <>
                      <strong style={{ color: '#B8EE8A' }}>Tip:</strong> Positive spikes often mean
                      highlight-worthy moments — great for clips!
                    </>
                  ) : stats.totalMessages < 10 ? (
                    <>
                      <strong style={{ color: '#5EEAD4' }}>Tip:</strong> Chat's quiet — try engaging
                      with a question to spark conversation
                    </>
                  ) : stats.questions > 3 ? (
                    <>
                      <strong style={{ color: '#FF9F9F' }}>Tip:</strong> {stats.questions} questions
                      waiting — addressing them boosts engagement!
                    </>
                  ) : (
                    <>
                      <strong style={{ color: '#5EEAD4' }}>Tip:</strong> Keep an eye on sentiment
                      shifts to catch the room's vibe changes
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Main Content Area - 3 Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-[600px] w-full">
              {/* LEFT COL (span-3): LIVE CHAT FEED */}
              <div className="col-span-1 md:col-span-3 h-[calc(100vh-140px)] flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {/* Chat Header */}
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]/40 backdrop-blur-sm">
                  <h3 className="m-0 text-base font-semibold">💬 Live Chat</h3>

                  {/* Platform Filter Toggle */}
                  <div className="flex gap-1 bg-black/30 p-1 rounded-lg">
                    <button
                      onClick={() => setPlatformFilter('all')}
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        platformFilter === 'all'
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:text-white'
                      } transition-all`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPlatformFilter('twitch')}
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        platformFilter === 'twitch'
                          ? 'bg-[#6441A5]/30 text-[#9147FF]'
                          : 'text-white/60 hover:text-white'
                      } transition-all`}
                    >
                      Twitch
                    </button>
                    {(userTier === 'Pro' || userTier === 'Agency') && kickConnected && (
                      <button
                        onClick={() => setPlatformFilter('kick')}
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          platformFilter === 'kick'
                            ? 'bg-[#53FC18]/20 text-[#53FC18]'
                            : 'text-white/60 hover:text-white'
                        } transition-all`}
                      >
                        Kick
                      </button>
                    )}
                  </div>
                </div>

                {/* Sticky Upgrade Banner for Starter Users */}
                {userTier === 'Starter' && (
                  <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/10">
                    <HistoryLimitBanner />
                  </div>
                )}

                {/* Chat Messages Area */}
                <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-2 bg-black/20">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 text-center p-4">
                      <div className="text-3xl mb-2">💭</div>
                      <p className="text-sm font-medium m-0">Chat's quiet for now...</p>
                      <p className="text-xs mt-1 opacity-70">Casi's listening!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {(() => {
                        // Filter messages by time (Starter users: only last 24 hours)
                        let filteredMessages =
                          userTier === 'Starter'
                            ? messages.filter((msg) => {
                                const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
                                return msg.timestamp > cutoffTime
                              })
                            : messages

                        // Filter messages by platform
                        if (platformFilter !== 'all') {
                          filteredMessages = filteredMessages.filter(
                            (msg) => msg.platform === platformFilter
                          )
                        }

                        return filteredMessages
                          .slice(-50)
                          .reverse()
                          .map((msg) => (
                            <div
                              key={msg.id}
                              className="py-1 px-2 rounded-md transition-all duration-300"
                              style={{
                                background: msg.isQuestion
                                  ? 'rgba(255, 159, 159, 0.15)'
                                  : msg.sentiment === 'positive'
                                    ? 'rgba(184, 238, 138, 0.08)'
                                    : msg.sentiment === 'negative'
                                      ? 'rgba(255, 159, 159, 0.08)'
                                      : 'rgba(255, 255, 255, 0.03)',
                                borderLeft: `3px solid ${msg.platform === 'kick' ? '#53FC18' : '#6441A5'}`,
                                animation:
                                  msg.id === highlightedQuestionId
                                    ? 'questionPulse 1.5s ease'
                                    : 'none',
                                transform:
                                  msg.id === highlightedQuestionId ? 'scale(1.02)' : 'scale(1)',
                              }}
                            >
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                {/* Platform Icon */}
                                <span className="text-xs opacity-80">
                                  {msg.platform === 'kick' ? '🟢' : '🟣'}
                                </span>

                                <span
                                  className={`text-xs font-bold ${msg.isQuestion ? 'text-[#F7F7F7]' : 'text-gray-300'}`}
                                >
                                  {msg.username}
                                </span>

                                {msg.isQuestion && (
                                  <span className="text-[10px] bg-[#FF9F9F] text-[#151E3C] px-1 rounded font-bold">
                                    Q
                                  </span>
                                )}

                                {msg.sentiment !== 'neutral' && (
                                  <span className="text-[10px] opacity-80">
                                    {msg.sentiment === 'positive' ? '😊' : '😢'}
                                  </span>
                                )}

                                {msg.engagementLevel === 'high' && (
                                  <span className="text-[10px] bg-[#FFD700] text-black px-1 rounded font-bold">
                                    🔥
                                  </span>
                                )}
                              </div>
                              <p
                                className={`m-0 text-sm leading-snug break-words ${msg.isQuestion ? 'text-white' : 'text-gray-200'}`}
                              >
                                {msg.message}
                              </p>
                            </div>
                          ))
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COL (span-5): VISUALS */}
              <div className="col-span-1 md:col-span-5 h-[calc(100vh-140px)] flex flex-col gap-4">
                {/* 1. Stream Preview (Natural Height) */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="m-0 text-base font-semibold">📺 Preview</h3>
                    <span className="text-xs text-white/40">{channelName}</span>
                  </div>
                  <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src={`https://player.twitch.tv/?channel=${channelName}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'heycasi.com'}&parent=localhost&muted=true`}
                      className="absolute top-0 left-0 w-full h-full border-none"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* 2. Questions Queue (Fills remaining space) */}
                <div className="flex-1 bg-gradient-to-br from-[rgba(255,159,159,0.15)] to-[rgba(255,159,159,0.05)] rounded-2xl p-4 border border-[rgba(255,159,159,0.2)] flex flex-col min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="m-0 text-base font-semibold text-[#F7F7F7]">
                      🚨 Priority Queue ({questions.length})
                    </h3>
                    <div className="bg-[#FF9F9F] text-[#151E3C] px-2 py-0.5 rounded text-xs font-bold">
                      HIGH PRIORITY
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 pr-1">
                    {questions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                        <div className="text-2xl mb-2">👀</div>
                        <p className="text-sm font-medium m-0">No questions pending</p>
                        <p className="text-xs mt-1">Chat is chilling...</p>
                      </div>
                    ) : (
                      questions
                        .slice(-20) // Show more questions since we have space
                        .reverse()
                        .map((q) => (
                          <div
                            key={q.id}
                            className="bg-white/10 rounded-lg p-3 border border-[rgba(255,159,159,0.2)] hover:bg-white/15 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[#F7F7F7] text-xs">
                                @{q.username}
                              </span>
                              <span className="text-[10px] text-white/50">
                                {new Date(q.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="m-0 text-white text-sm leading-snug">{q.message}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COL (span-4): ENGAGEMENT */}
              <div className="col-span-1 md:col-span-4 h-[calc(100vh-140px)] flex flex-col gap-4">
                {/* 1. Activity Feed (50% Height) */}
                <div className="h-1/2 min-h-0">
                  <MultiPlatformActivityFeed
                    twitchChannelName={channelName}
                    kickChannelName={kickUsername}
                    userTier={userTier}
                    kickConnected={kickConnected}
                    maxHeight="100%"
                  />
                </div>

                {/* 2. VIP Tracking (50% Height) - Moved from Center */}
                <div className="h-1/2 min-h-0 flex flex-col">
                  <FeatureGate
                    requiredTier="Pro"
                    currentTier={userTier}
                    featureName="VIP Tracking"
                    featureDescription="Track your top chatters and identify your most engaged viewers."
                  >
                    <div className="h-full bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col overflow-hidden">
                      <h3 className="m-0 mb-3 text-base font-semibold shrink-0">
                        🏆 Top Chatters & Topics
                      </h3>
                      <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                        {topChatters.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                            <div className="text-2xl mb-2">🦗</div>
                            <p className="text-sm m-0">Waiting for data...</p>
                          </div>
                        ) : (
                          <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            {topChatters.map((c) => (
                              <li
                                key={c.username}
                                className="bg-white/5 p-2 rounded-lg border border-white/5"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[#F7F7F7] text-sm font-semibold truncate max-w-[70%]">
                                    @{c.username}
                                  </span>
                                  <span className="text-[#5EEAD4] font-bold text-xs bg-[#5EEAD4]/10 px-1.5 py-0.5 rounded">
                                    {c.count} msgs
                                  </span>
                                </div>
                                {c.topics && c.topics.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {c.topics.map((topic, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[10px] bg-[#5EEAD4]/10 text-[#5EEAD4] px-1.5 py-0.5 rounded"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </FeatureGate>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer - Always visible */}
        <div
          style={{
            textAlign: 'center',
            padding: '1rem 0',
            color: 'rgba(255, 255, 255, 0.6)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: 'auto',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8rem' }}>
            <strong style={{ color: '#5EEAD4' }}>Casi</strong> • Your stream's brainy co-pilot.
            Reads the room so you don't have to.
          </p>
          {!isConnected && (
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                color: '#5EEAD4',
                textDecoration: 'none',
                fontSize: '0.8rem',
              }}
            >
              ← Back to Landing Page
            </a>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes sentimentGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(184, 238, 138, 0);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(184, 238, 138, 0.6);
            transform: scale(1.05);
          }
        }
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes questionPulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(255, 159, 159, 0);
            transform: scale(1);
          }
          25%, 75% {
            box-shadow: 0 0 25px rgba(255, 159, 159, 0.8);
            transform: scale(1.03);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 159, 159, 1);
            transform: scale(1.05);
          }
        }
        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(94, 234, 212, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(94, 234, 212, 0.5);
        }
        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(94, 234, 212, 0.3) rgba(0, 0, 0, 0.3);
        }
      `,
        }}
      />
    </div>
  )
}
