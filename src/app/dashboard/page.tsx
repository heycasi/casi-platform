// src/app/dashboard/page.tsx - Dashboard with Navigation
'use client'
import { useState, useEffect } from 'react'
import { analyzeMessage, generateMotivationalSuggestion } from '../../lib/multilingual'
import { AnalyticsService } from '../../lib/analytics'

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

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [betaCode, setBetaCode] = useState('')
  const [email, setEmail] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [questions, setQuestions] = useState<ChatMessage[]>([])
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null)
  const [elapsedDuration, setElapsedDuration] = useState<string>('00:00:00')
  const [topChatters, setTopChatters] = useState<Array<{ username: string; count: number }>>([])
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

  const validCodes = ['CASI2025', 'BETASTREAM', 'EARLYACCESS']

  const botUsernames = [
    'nightbot', 'streamelements', 'moobot', 'fossabot', 'wizebot', 
    'streamlabs', 'botisimo', 'deepbot', 'ankhbot', 'revlobot',
    'phantombot', 'coebot', 'ohbot', 'tipeeebot', 'chatty',
    'streamdeckerbot', 'vivbot', 'soundalerts', 'own3dbot',
    'pretzelrocks', 'songrequestbot', 'musicbot'
  ]

  const handleBetaAccess = () => {
    if (validCodes.includes(betaCode.toUpperCase()) && email.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem('casi_beta_access', 'true')
      localStorage.setItem('casi_user_email', email)
    }
  }

  useEffect(() => {
    const hasAccess = localStorage.getItem('casi_beta_access')
    const savedEmail = localStorage.getItem('casi_user_email')
    const twitchUserRaw = localStorage.getItem('twitch_user')
    if (twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        if (tu?.login) {
          setIsAuthenticated(true)
          setChannelName(tu.login)
        }
      } catch {}
    }
    if (hasAccess && savedEmail) {
      setIsAuthenticated(true)
      setEmail(savedEmail)
    }
  }, [])

  // Create session when connecting
  const startSession = async () => {
    if (email && channelName) {
      try {
        const sessionId = await AnalyticsService.createSession(email, channelName)
        setCurrentSessionId(sessionId)
        console.log('Started session:', sessionId)
        const now = Date.now()
        setStreamStartTime(now)
        setElapsedDuration('00:00:00')
        // duration ticker
        const intervalId = window.setInterval(() => {
          setElapsedDuration(formatDurationMs(Date.now() - now))
        }, 1000)
        // store to window for cleanup
        ;(window as any).__casi_duration_interval = intervalId
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
        
        // Generate report after a short delay to ensure all data is processed
        setTimeout(() => {
          generateReport(currentSessionId)
        }, 2000)
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }
    // cleanup timers
    if ((window as any).__casi_duration_interval) {
      clearInterval((window as any).__casi_duration_interval)
      ;(window as any).__casi_duration_interval = null
    }
    setStreamStartTime(null)
  }

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

    // Start session when connecting
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
              setQuestions(prev => [...prev.slice(-9), chatMessage])
            }

            // Store message in database if we have an active session
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
            // Stream ended, end session
            endSession()
          }
        }

      } catch {
        setTimeout(connectToTwitch, 3000)
      }
    }

    connectToTwitch()

    // Real viewer count from Twitch if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('twitch_access_token') : null
    const twitchUserRaw = typeof window !== 'undefined' ? localStorage.getItem('twitch_user') : null
    if (token && twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        const userId = tu?.id
        const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
        if (userId && clientId) {
          const fetchViewers = async () => {
            try {
              const res = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Client-Id': clientId
                }
              })
              const data = await res.json()
              const vc = data?.data?.[0]?.viewer_count
              if (typeof vc === 'number') {
                setStats(prev => ({ ...prev, viewerCount: vc }))
              }
            } catch {}
          }
          fetchViewers()
          viewerInterval = window.setInterval(fetchViewers, 30000)
        }
      } catch {}
    }

    return () => {
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

    const viewerCount = Math.max(50, uniqueUsers * 3 + Math.floor(Math.random() * 100))

    setStats({
      totalMessages: messages.length,
      questions: questions.length,
      avgSentiment,
      positiveMessages,
      negativeMessages,
      viewerCount: stats.viewerCount || viewerCount,
      activeUsers: uniqueUsers,
      currentMood
    })

    // Compute top chatters in-session
    const counts: Record<string, number> = {}
    messages.forEach(m => { counts[m.username] = (counts[m.username] || 0) + 1 })
    const top = Object.entries(counts)
      .sort((a,b) => b[1]-a[1])
      .slice(0,5)
      .map(([username,count]) => ({ username, count }))
    setTopChatters(top)

    // Update session stats in database
    if (currentSessionId && messages.length > 0) {
      AnalyticsService.updateSessionStats(currentSessionId, {
        peak_viewer_count: Math.max(stats.viewerCount, viewerCount),
        total_messages: messages.length,
        unique_chatters: uniqueUsers
      }).catch(error => {
        console.error('Failed to update session stats:', error)
      })
    }
  }, [messages, questions])

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
              src="/landing-robot.png"
              alt="Casi Robot"
              style={{
                width: '60px',
                height: '60px'
              }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.style.cssText = 'width: 60px; height: 60px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;'
                fallback.textContent = '🤖'
                target.parentNode?.appendChild(fallback)
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
            Casi Beta
          </h1>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 1.5rem 0',
            fontSize: '1rem'
          }}>
            Access the future of streaming analytics
          </p>

          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              margin: '0 0 1rem 0',
              borderRadius: '25px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, Arial, sans-serif',
              boxSizing: 'border-box'
            }}
          />

          <input
            type="text"
            placeholder="Beta access code"
            value={betaCode}
            onChange={(e) => setBetaCode(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              margin: '0 0 1.5rem 0',
              borderRadius: '25px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, Arial, sans-serif',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handleBetaAccess}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '25px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Access Beta Dashboard
          </button>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
            margin: '1rem 0 0 0'
          }}>
            Need a beta code? Join our waitlist at{' '}
            <a href="/" style={{ color: '#5EEAD4', textDecoration: 'none' }}>
              heycasi.com
            </a>
          </p>
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
          <button
            onClick={() => {
              localStorage.removeItem('casi_beta_access')
              localStorage.removeItem('casi_user_email')
              setIsAuthenticated(false)
            }}
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        minHeight: 'calc(100vh - 80px)'
      }}>
        
        {/* Connection Panel */}
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
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F7F7F7' }}>
              🎮 Connect to Twitch Channel
            </h2>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem', 
              alignItems: 'center' 
            }}>
              <input
                type="text"
                placeholder="Enter channel name (e.g., shroud)"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  padding: '0.75rem',
                  borderRadius: '25px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  textAlign: 'center'
                }}
              />
              
              <button
                onClick={() => {
                  if (channelName.trim()) {
                    setIsConnected(true)
                    setMessages([])
                    setQuestions([])
                    setMotivationalMessage(null)
                  }
                }}
                disabled={!channelName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: channelName.trim() ? 'pointer' : 'not-allowed',
                  opacity: channelName.trim() ? 1 : 0.5,
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                Connect
              </button>
            </div>
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
              width: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#B8EE8A',
                  borderRadius: '50%'
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

              {/* Live duration */}
              {streamStartTime && (
                <span style={{ color: '#B8EE8A', fontSize: '0.8rem' }}>
                  ⏱️ {elapsedDuration}
                </span>
              )}
              
              <button
                onClick={() => {
                  setIsConnected(false)
                  setMessages([])
                  setQuestions([])
                  setMotivationalMessage(null)
                  setCurrentSessionId(null)
                  // endSession will be called by WebSocket onclose
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
                { icon: '👥', value: stats.viewerCount, label: 'Viewers', color: '#5EEAD4' },
                { icon: '💬', value: stats.totalMessages, label: 'Messages', color: '#5EEAD4' },
                { icon: '❓', value: stats.questions, label: 'Questions', color: '#FF9F9F' },
                { 
                  icon: stats.currentMood === 'Very Positive' ? '😊' : 
                        stats.currentMood === 'Positive' ? '🙂' : 
                        stats.currentMood === 'Negative' ? '😢' : 
                        stats.currentMood === 'Slightly Negative' ? '😕' : '😐', 
                  value: stats.currentMood, 
                  label: 'Mood', 
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
                  flex: '1 1 auto'
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
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>Waiting for chat messages...</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>Make sure the channel is live and has active chat</p>
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
                              : '1px solid rgba(255, 255, 255, 0.1)'
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

              {/* Right Column (40%) - Top Chatters + Questions always visible */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: window.innerWidth < 900 ? '1 1 auto' : '0 0 40%', minWidth: 0, minHeight: 0 }}>
                {/* Top Chatters / Stats */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🏆 Top Chatters</h3>
                  {topChatters.length === 0 ? (
                    <p style={{ margin: '0.75rem 0 0 0', opacity: 0.7 }}>No chatters yet</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0 0' }}>
                      {topChatters.map((c) => (
                        <li key={c.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                          <span style={{ color: '#F7F7F7' }}>@{c.username}</span>
                          <span style={{ color: '#5EEAD4', fontWeight: 700 }}>{c.count}</span>
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
                      <p style={{ margin: 0, opacity: 0.7 }}>No questions yet</p>
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
    </div>
  )
}
