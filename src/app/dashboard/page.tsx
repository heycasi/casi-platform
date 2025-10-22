// src/app/dashboard/page.tsx - Secure Dashboard with OAuth
'use client'
import { useState, useEffect } from 'react'
import { analyzeMessage, generateMotivationalSuggestion } from '../../lib/multilingual'
import { AnalyticsService } from '../../lib/analytics'
import TierUpgradeNudge from '@/components/TierUpgradeNudge'

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
  'conzooo_' // Your Twitch username (case-insensitive)
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
  const [topChatters, setTopChatters] = useState<Array<{ username: string; count: number; topics: string[] }>>([])
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null)
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
    currentMood: 'Neutral'
  })

  const botUsernames = [
    'nightbot', 'streamelements', 'moobot', 'fossabot', 'wizebot',
    'streamlabs', 'botisimo', 'deepbot', 'ankhbot', 'revlobot',
    'phantombot', 'coebot', 'ohbot', 'tipeeebot', 'chatty',
    'streamdeckerbot', 'vivbot', 'soundalerts', 'own3dbot',
    'pretzelrocks', 'songrequestbot', 'musicbot'
  ]

  // Check if user is admin
  const checkAdminStatus = (user: any) => {
    if (!user) return false

    // Check by Twitch user ID
    if (user.id && ADMIN_USER_IDS.includes(user.id)) {
      return true
    }

    // Check by Twitch username (case-insensitive)
    if (user.login && ADMIN_USERNAMES.map(u => u.toLowerCase()).includes(user.login.toLowerCase())) {
      return true
    }

    // Check by display_name as fallback
    if (user.display_name && ADMIN_USERNAMES.map(u => u.toLowerCase()).includes(user.display_name.toLowerCase())) {
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

  // Auto-connect when Twitch user is present and live
  useEffect(() => {
    if (!twitchUser || isConnected || isAdmin) return // Don't auto-connect for admins

    const checkLiveAndConnect = async () => {
      try {
        const res = await fetch(`/api/twitch/stream-info?user_id=${encodeURIComponent(twitchUser.id)}`)
        const info = await res.json()
        if (info?.live) {
          // Set initial viewer count when auto-connecting
          if (info?.viewer_count != null) {
            setStats(prev => ({ ...prev, viewerCount: info.viewer_count }))
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
        const sessionId = await AnalyticsService.createSession(email, channelName)
        setCurrentSessionId(sessionId)
        console.log('Started session:', sessionId)
      } catch (error) {
        console.error('Failed to start session:', error)
      }
    }
  }

  // End session and generate report
  const endSession = async () => {
    if (currentSessionId) {
      try {
        await AnalyticsService.endSession(currentSessionId)
        console.log('Ended session:', currentSessionId)

        setTimeout(() => {
          generateReport(currentSessionId)
        }, 2000)
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }
    setStreamStartTime(null)
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

  // Generate and send report
  const generateReport = async (sessionId: string) => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email })
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

  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    startSession()

    let ws: WebSocket | null = null
    let viewerInterval: number | null = null

    const connectToTwitch = () => {
      try {
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')

        ws.onopen = () => {
          ws?.send('PASS SCHMOOPIIE')
          ws?.send('NICK justinfan12345')
          ws?.send(`JOIN #${channelName.toLowerCase()}`)
        }

        ws.onmessage = (event) => {
          const message = event.data.trim()

          if (message.startsWith('PING')) {
            ws?.send('PONG :tmi.twitch.tv')
            return
          }

          const chatMatch = message.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/)
          if (chatMatch) {
            const [, username, messageText] = chatMatch

            if (botUsernames.includes(username.toLowerCase())) {
              return
            }

            const analysis = analyzeMessage(messageText)

            const timestamp = new Date()
            const chatMessage: ChatMessage = {
              id: Date.now().toString() + Math.random(),
              username,
              message: messageText,
              timestamp: timestamp.getTime(),
              sentiment: analysis.sentiment,
              sentimentReason: analysis.sentimentReason,
              sentimentScore: analysis.sentimentScore,
              isQuestion: analysis.isQuestion,
              language: analysis.language,
              confidence: analysis.confidence,
              topics: analysis.topics,
              engagementLevel: analysis.engagementLevel,
              priority: analysis.isQuestion ? 'high' : analysis.engagementLevel === 'high' ? 'medium' : 'low'
            }

            setMessages(prev => [...prev.slice(-49), chatMessage])

            if (analysis.isQuestion) {
              // Highlight the question in the live feed first
              setHighlightedQuestionId(chatMessage.id)
              setTimeout(() => {
                setQuestions(prev => [...prev.slice(-9), chatMessage])
                setHighlightedQuestionId(null)
              }, 1500) // Show highlight for 1.5 seconds before moving to Questions panel
            }

            if (currentSessionId) {
              AnalyticsService.storeChatMessage(currentSessionId, {
                username,
                message: messageText,
                timestamp,
                language: analysis.language,
                language_confidence: analysis.confidence,
                sentiment: analysis.sentiment,
                sentiment_score: analysis.sentimentScore,
                sentiment_reason: analysis.sentimentReason,
                is_question: analysis.isQuestion,
                question_type: analysis.questionType,
                engagement_level: analysis.engagementLevel,
                topics: analysis.topics
              }).catch(error => {
                console.error('Failed to store message:', error)
              })
            }
          }
        }

        ws.onerror = () => {
          // Handle error silently
        }

        ws.onclose = () => {
          if (isConnected) {
            setTimeout(connectToTwitch, 3000)
          } else {
            endSession()
          }
        }

      } catch {
        setTimeout(connectToTwitch, 3000)
      }
    }

    connectToTwitch()

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
          setStats(prev => ({ ...prev, viewerCount: info.viewer_count }))
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
      console.log('[Viewer Count] Cleaning up - clearing interval')
      if (ws) {
        ws.close()
      }
      if (viewerInterval) {
        clearInterval(viewerInterval)
      }
    }
  }, [isConnected, channelName])

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
    const uniqueUsers = new Set(messages.map(m => m.username)).size
    const positiveMessages = messages.filter(m => m.sentiment === 'positive').length
    const negativeMessages = messages.filter(m => m.sentiment === 'negative').length

    const sentimentValues = messages.map(m => m.sentimentScore || 0)
    const avgSentiment = sentimentValues.length > 0
      ? Math.round((sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length) * 100) / 100
      : 0

    const recentMessages = messages.slice(-10)
    const recentPositive = recentMessages.filter(m => m.sentiment === 'positive').length
    const recentNegative = recentMessages.filter(m => m.sentiment === 'negative').length

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

    setStats(prev => ({
      ...prev, // Preserve viewerCount from Twitch API fetches
      totalMessages: messages.length,
      questions: questions.length,
      avgSentiment,
      positiveMessages,
      negativeMessages,
      activeUsers: uniqueUsers,
      currentMood
    }))

    const counts: Record<string, number> = {}
    const userTopics: Record<string, Set<string>> = {}
    messages.forEach(m => {
      counts[m.username] = (counts[m.username] || 0) + 1
      if (!userTopics[m.username]) userTopics[m.username] = new Set()
      if (m.topics && m.topics.length > 0) {
        m.topics.forEach(topic => userTopics[m.username].add(topic))
      }
    })
    const top = Object.entries(counts)
      .sort((a,b) => b[1]-a[1])
      .slice(0,5)
      .map(([username,count]) => ({
        username,
        count,
        topics: Array.from(userTopics[username] || []).slice(0, 2) // Top 2 topics per chatter
      }))
    setTopChatters(top)

    if (currentSessionId && messages.length > 0) {
      AnalyticsService.updateSessionStats(currentSessionId, {
        peak_viewer_count: stats.viewerCount || 0,
        total_messages: messages.length,
        unique_chatters: uniqueUsers
      }).catch(error => {
        console.error('Failed to update session stats:', error)
      })
    }
  }, [messages, questions])

  // Not authenticated - require Twitch login
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, Arial, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <img
              src="/landing-logo.png"
              alt="Casi"
              style={{
                width: '200px',
                height: 'auto'
              }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
          </div>

          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Connect your Twitch
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 1.5rem 0',
            fontSize: '1rem'
          }}>
            Sign in with Twitch to auto-connect to your channel and sync viewers.
          </p>

          <a
            href={`https://id.twitch.tv/oauth2/authorize?client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '8lmg8rwlkhlom3idj51xka2eipxd18')}&redirect_uri=${encodeURIComponent('https://heycasi.com/auth/callback')}&response_type=code&scope=user%3Aread%3Aemail`}
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
              boxSizing: 'border-box'
            }}
          >
            Connect with Twitch
          </a>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
            margin: '1.5rem 0 0 0'
          }}>
            Secure OAuth • Read-only access • Privacy protected
          </p>
        </div>
      </div>
    )
  }

  // Checking access...
  if (accessLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white'
      }}>
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, Arial, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🔒
          </div>

          <h1 style={{
            color: 'white',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0'
          }}>
            {accessDetails?.status === 'trial_expired' ? 'Trial Expired' : 'Subscription Required'}
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 1.5rem 0',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            {accessDetails?.message || 'You need an active subscription or beta code to access the dashboard.'}
          </p>

          {accessDetails?.status === 'trial_expired' && accessDetails?.trial_ends_at && (
            <div style={{
              background: 'rgba(255, 159, 159, 0.1)',
              border: '1px solid rgba(255, 159, 159, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
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
                fontSize: '1rem'
              }}
            >
              View Plans & Subscribe
            </a>

            {!accessDetails?.beta_code && (
              <a
                href="/signup"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'rgba(184, 238, 138, 0.1)',
                  border: '1px solid rgba(184, 238, 138, 0.3)',
                  borderRadius: '12px',
                  color: '#B8EE8A',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Have a Beta Code? Sign Up
              </a>
            )}

            <a
              href="/"
              style={{
                display: 'inline-block',
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header with Navigation */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/landing-logo.png"
            alt="Casi"
            style={{ height: '32px', width: 'auto' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('h1')
              fallback.style.cssText = 'margin: 0; font-size: 1.3rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
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
              fallback.style.cssText = 'width: 32px; height: 32px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
            }}
          />

          {isAdmin && (
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: '700',
              marginLeft: '0.5rem'
            }}>
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
              fontWeight: '500'
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
              fontWeight: '500'
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
                fontSize: '1rem'
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
                  overflow: 'hidden'
                }}
                onMouseLeave={() => setShowAccountDropdown(false)}
              >
                {/* User Info */}
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(105, 50, 255, 0.1)'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    {twitchUser?.display_name || 'User'}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {email}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '0.5rem' }}>
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
                      cursor: 'pointer'
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
                      fontFamily: 'Poppins, Arial, sans-serif'
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

      <div style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: 'calc(100vh - 80px)'
      }}>

        {/* Connection Panel - Admin can view any channel */}
        {!isConnected && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
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
                      flex: 1
                    }}
                  />
                  <button
                    onClick={() => {
                      if (adminChannelInput.trim()) {
                        setChannelName(adminChannelInput.trim())
                        setIsConnected(true)
                        setMessages([])
                        setQuestions([])
                        setMotivationalMessage(null)
                      }
                    }}
                    disabled={!adminChannelInput.trim()}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '20px',
                      border: 'none',
                      background: adminChannelInput.trim() ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.1)',
                      color: adminChannelInput.trim() ? '#000' : 'white',
                      fontWeight: '600',
                      cursor: adminChannelInput.trim() ? 'pointer' : 'not-allowed'
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
                <div style={{
                  background: 'rgba(184, 238, 138, 0.1)',
                  border: '1px solid rgba(184, 238, 138, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#B8EE8A' }}>
                    ✨ Connected as <strong>@{twitchUser?.login || 'Unknown'}</strong>
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
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
            <div style={{
              background: 'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(94, 234, 212, 0.15))',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              border: '1px solid rgba(184, 238, 138, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: 'fit-content',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#B8EE8A',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ color: '#F7F7F7', fontSize: '0.8rem', fontWeight: '500' }}>
                  Connected to @{channelName}
                </span>
              </div>

              <div style={{
                height: '12px',
                width: '1px',
                background: 'rgba(255, 255, 255, 0.2)'
              }} />

              <span style={{ color: '#F7F7F7', fontSize: '0.8rem' }}>
                Hey! Your friendly stream sidekick is analyzing chat 🎮✨
              </span>

              {streamStartTime && (
                <>
                  <div style={{
                    height: '12px',
                    width: '1px',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }} />
                  <span style={{ color: '#B8EE8A', fontSize: '0.8rem', fontWeight: '600' }}>
                    ⏱️ {elapsedDuration}
                  </span>
                </>
              )}

              <button
                onClick={() => {
                  setIsConnected(false)
                  setMessages([])
                  setQuestions([])
                  setMotivationalMessage(null)
                  setCurrentSessionId(null)
                  setAdminChannelInput('')
                }}
                style={{
                  padding: '0.3rem 0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                Disconnect
              </button>
            </div>

            {/* Trial Status Banner */}
            {accessDetails?.is_trial && accessDetails?.trial_days_remaining && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(184, 238, 138, 0.1))',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(184, 238, 138, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{
                    background: '#B8EE8A',
                    color: '#151E3C',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>
                    BETA TRIAL
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#F7F7F7' }}>
                      {accessDetails.trial_days_remaining} days remaining
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
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
                    whiteSpace: 'nowrap'
                  }}
                >
                  Upgrade Now
                </a>
              </div>
            )}

            {/* Tier Upgrade Nudge */}
            {tierStatus && tierStatus.isOverLimit && (
              <TierUpgradeNudge
                currentTier={tierStatus.suggestedTier === 'Pro' ? 'Creator' : 'Pro'}
                avgViewers={tierStatus.avgViewers}
                viewerLimit={tierStatus.limit}
                daysOverLimit={tierStatus.daysOverLimit}
                percentOver={tierStatus.percentOver}
              />
            )}

            {/* AI Motivational Message */}
            {motivationalMessage && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.1))',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(94, 234, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: '#5EEAD4',
                  color: '#151E3C',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
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
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Report Generation Status */}
            {isGeneratingReport && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(147, 47, 254, 0.2), rgba(147, 47, 254, 0.1))',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(147, 47, 254, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  background: '#932FFE',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  📊 GENERATING REPORT
                </div>
                <p style={{ margin: 0, color: '#F7F7F7', fontSize: '0.9rem' }}>
                  Processing your stream analytics and preparing your summary report...
                </p>
              </div>
            )}

            {/* Analytics - Mobile Friendly */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'space-between'
            }}>
              {[
                { icon: '👥', value: stats.viewerCount || 0, label: 'Viewers', color: '#5EEAD4' },
                { icon: '💬', value: stats.totalMessages, label: 'Messages', color: '#5EEAD4' },
                {
                  icon: engagementLevel === 'High' ? '🔥' : engagementLevel === 'Moderate' ? '📊' : '📉',
                  value: `${engagementLevel}`,
                  label: 'Engagement',
                  color: engagementLevel === 'High' ? '#B8EE8A' : engagementLevel === 'Moderate' ? '#5EEAD4' : '#FF9F9F'
                },
                { icon: '❓', value: stats.questions, label: 'Questions', color: '#FF9F9F' },
                {
                  icon: stats.currentMood === 'Very Positive' ? '😊' :
                        stats.currentMood === 'Positive' ? '🙂' :
                        stats.currentMood === 'Negative' ? '😢' :
                        stats.currentMood === 'Slightly Negative' ? '😕' : '😐',
                  value: stats.currentMood,
                  label: 'Sentiment',
                  color: stats.currentMood.includes('Positive') ? '#B8EE8A' :
                         stats.currentMood.includes('Negative') ? '#FF9F9F' : '#F7F7F7'
                },
                { icon: '✨', value: stats.positiveMessages, label: 'Positive', color: '#B8EE8A' },
                { icon: '💔', value: stats.negativeMessages, label: 'Negative', color: '#FF9F9F' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '80px',
                  flex: '1 1 auto',
                  animation: stat.label === 'Sentiment' && moodChanged ? 'sentimentGlow 2s ease' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>{stat.icon}</div>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: stat.color,
                    wordBreak: 'break-word'
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7 }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Contextual Insight Tip */}
            {messages.length > 5 && (
              <div style={{
                background: 'rgba(94, 234, 212, 0.05)',
                border: '1px solid rgba(94, 234, 212, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: '1.4'
                }}>
                  {stats.currentMood.includes('Positive')
                    ? <><strong style={{ color: '#B8EE8A' }}>Tip:</strong> Positive spikes often mean highlight-worthy moments — great for clips!</>
                    : stats.totalMessages < 10
                    ? <><strong style={{ color: '#5EEAD4' }}>Tip:</strong> Chat's quiet — try engaging with a question to spark conversation</>
                    : stats.questions > 3
                    ? <><strong style={{ color: '#FF9F9F' }}>Tip:</strong> {stats.questions} questions waiting — addressing them boosts engagement!</>
                    : <><strong style={{ color: '#5EEAD4' }}>Tip:</strong> Keep an eye on sentiment shifts to catch the room's vibe changes</>
                  }
                </p>
              </div>
            )}

            {/* Main Content Area */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 900 ? 'column' : 'row',
              gap: '1rem',
              flex: 1,
              minHeight: '400px',
              minWidth: 0
            }}>
              {/* Chat Feed (60%) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                flex: window.innerWidth < 900 ? '1 1 auto' : '0 0 60%',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                  💬 Live Chat Feed
                </h3>

                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  minHeight: 0
                }}>
                  {messages.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💭</div>
                        <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>Chat's quiet for now... 🤔</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>Casi's ready to analyze as soon as someone says hi!</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {messages.slice(-50).reverse().map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            padding: '0.5rem',
                            background: msg.isQuestion
                              ? 'rgba(255, 159, 159, 0.2)'
                              : msg.sentiment === 'positive'
                              ? 'rgba(184, 238, 138, 0.1)'
                              : msg.sentiment === 'negative'
                              ? 'rgba(255, 159, 159, 0.1)'
                              : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            border: msg.isQuestion
                              ? '1px solid rgba(255, 159, 159, 0.3)'
                              : msg.sentiment === 'positive'
                              ? '1px solid rgba(184, 238, 138, 0.2)'
                              : msg.sentiment === 'negative'
                              ? '1px solid rgba(255, 159, 159, 0.2)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            animation: msg.id === highlightedQuestionId ? 'questionPulse 1.5s ease' : 'none',
                            boxShadow: msg.id === highlightedQuestionId ? '0 0 20px rgba(255, 159, 159, 0.8)' : 'none',
                            transform: msg.id === highlightedQuestionId ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginBottom: '0.25rem',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              fontWeight: '600',
                              color: msg.isQuestion ? '#F7F7F7' : '#E5E7EB',
                              fontSize: '0.8rem'
                            }}>
                              {msg.username}
                            </span>
                            {msg.isQuestion && (
                              <span style={{
                                fontSize: '0.6rem',
                                background: '#FF9F9F',
                                padding: '0.1rem 0.25rem',
                                borderRadius: '3px',
                                color: '#151E3C',
                                fontWeight: '600'
                              }}>
                                Q
                              </span>
                            )}
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '0.1rem 0.25rem',
                              borderRadius: '3px',
                              background: msg.sentiment === 'positive'
                                ? '#B8EE8A'
                                : msg.sentiment === 'negative'
                                ? '#FF9F9F'
                                : 'rgba(107, 114, 128, 0.8)'
                            }}>
                              {msg.sentiment === 'positive' ? '😊' : msg.sentiment === 'negative' ? '😢' : '😐'}
                            </span>
                            {msg.engagementLevel === 'high' && (
                              <span style={{
                                fontSize: '0.6rem',
                                background: '#FFD700',
                                padding: '0.1rem 0.25rem',
                                borderRadius: '3px',
                                color: '#000',
                                fontWeight: '600'
                              }}>
                                🔥
                              </span>
                            )}
                          </div>
                          <p style={{
                            margin: 0,
                            color: msg.isQuestion ? '#F7F7F7' : '#F3F4F6',
                            lineHeight: '1.3',
                            fontSize: '0.8rem',
                            wordBreak: 'break-word'
                          }}>
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (40%) - Stream Preview + Top Chatters + Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: window.innerWidth < 900 ? '1 1 auto' : '0 0 40%', minWidth: 0, minHeight: 0 }}>
                {/* Stream Preview */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>📺 Preview</h3>
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: '#000'
                  }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${channelName}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'heycasi.com'}&parent=localhost&muted=true`}
                      height="100%"
                      width="100%"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Top Chatters & Topics */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🏆 Top Chatters & Topics</h3>
                  {topChatters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🦗</div>
                      <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>Waiting for your first chatters...</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0 0' }}>
                      {topChatters.map((c) => (
                        <li key={c.username} style={{
                          padding: '0.5rem 0',
                          borderBottom: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#F7F7F7', fontSize: '0.9rem', fontWeight: '600' }}>@{c.username}</span>
                            <span style={{ color: '#5EEAD4', fontWeight: 700, fontSize: '0.85rem' }}>{c.count}</span>
                          </div>
                          {c.topics && c.topics.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {c.topics.map((topic, idx) => (
                                <span key={idx} style={{
                                  fontSize: '0.65rem',
                                  background: 'rgba(94, 234, 212, 0.15)',
                                  color: '#5EEAD4',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px'
                                }}>
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

                {/* Questions - always visible */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 159, 159, 0.2), rgba(255, 159, 159, 0.1))',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 159, 159, 0.3)',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#F7F7F7' }}>
                      🚨 Questions ({questions.length})
                    </h3>
                    <div style={{
                      background: '#FF9F9F',
                      color: '#151E3C',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      PRIORITY
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0 }}>
                    {questions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👀</div>
                        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', fontWeight: '500' }}>No questions yet — looks like chat's chill for now 😌</p>
                      </div>
                    ) : (
                      questions.slice(-10).reverse().map((q) => (
                        <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(255, 159, 159, 0.3)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', color: '#F7F7F7', fontSize: '0.8rem' }}>@{q.username}</span>
                          </div>
                          <p style={{ margin: 0, color: '#F7F7F7', fontSize: '0.8rem', lineHeight: '1.3' }}>{q.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer - Always visible */}
        <div style={{
          textAlign: 'center',
          padding: '1rem 0',
          color: 'rgba(255, 255, 255, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          marginTop: 'auto'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>
            <strong style={{ color: '#5EEAD4' }}>Casi</strong> • Your stream's brainy co-pilot. Reads the room so you don't have to.
          </p>
          {!isConnected && (
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                color: '#5EEAD4',
                textDecoration: 'none',
                fontSize: '0.8rem'
              }}
            >
              ← Back to Landing Page
            </a>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  )
}