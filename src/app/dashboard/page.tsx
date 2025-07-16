// src/app/dashboard/page.tsx - COMPLETE Dashboard with Correct Casi Branding & Multilingual Support
'use client'
import { useState, useEffect } from 'react'
import { analyzeMessage } from '../../lib/multilingual'

// Types
interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  isQuestion?: boolean
  priority?: 'high' | 'medium' | 'low'
  language?: string
  confidence?: number
}

interface DashboardStats {
  totalMessages: number
  questions: number
  avgSentiment: number
  languages: string[]
  activeUsers: number
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [betaCode, setBetaCode] = useState('')
  const [email, setEmail] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [questions, setQuestions] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    questions: 0,
    avgSentiment: 0,
    languages: [],
    activeUsers: 0
  })

  // Valid beta codes
  const validCodes = ['CASI2025', 'BETASTREAM', 'EARLYACCESS']

  // Language flag helper function
  const getLanguageFlag = (language: string): string => {
    const flags: { [key: string]: string } = {
      'english': '🇺🇸',
      'spanish': '🇪🇸',
      'french': '🇫🇷',
      'german': '🇩🇪',
      'portuguese': '🇵🇹',
      'italian': '🇮🇹',
      'dutch': '🇳🇱',
      'japanese': '🇯🇵',
      'korean': '🇰🇷',
      'chinese': '🇨🇳',
      'russian': '🇷🇺',
      'arabic': '🇸🇦',
      'hindi': '🇮🇳'
    }
    return flags[language] || '🌍'
  }

  // Beta authentication
  const handleBetaAccess = () => {
    if (validCodes.includes(betaCode.toUpperCase()) && email.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem('casi_beta_access', 'true')
      localStorage.setItem('casi_user_email', email)
    }
  }

  // Check for existing beta access
  useEffect(() => {
    const hasAccess = localStorage.getItem('casi_beta_access')
    const savedEmail = localStorage.getItem('casi_user_email')
    if (hasAccess && savedEmail) {
      setIsAuthenticated(true)
      setEmail(savedEmail)
    }
  }, [])

  // Real Twitch IRC Connection with Multilingual Support
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    let ws: WebSocket | null = null

    const connectToTwitch = () => {
      try {
        console.log(`Connecting to Twitch IRC for channel: ${channelName}`)
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
        
        ws.onopen = () => {
          console.log('✅ Connected to Twitch IRC')
          // Anonymous login to Twitch IRC
          ws?.send('PASS SCHMOOPIIE')
          ws?.send('NICK justinfan12345')
          ws?.send(`JOIN #${channelName.toLowerCase()}`)
        }

        ws.onmessage = (event) => {
          const message = event.data.trim()
          
          // Handle PING to keep connection alive
          if (message.startsWith('PING')) {
            ws?.send('PONG :tmi.twitch.tv')
            return
          }

          // Parse chat messages using proper IRC format
          const chatMatch = message.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/)
          if (chatMatch) {
            const [, username, messageText] = chatMatch
            
            // Analyze message with multilingual support
            const analysis = analyzeMessage(messageText)
            
            const chatMessage: ChatMessage = {
              id: Date.now().toString() + Math.random(),
              username,
              message: messageText,
              timestamp: Date.now(),
              sentiment: analysis.sentiment,
              isQuestion: analysis.isQuestion,
              language: analysis.language,
              confidence: analysis.confidence,
              priority: analysis.isQuestion ? 'high' : 'low'
            }

            console.log('📨 New message:', chatMessage)
            setMessages(prev => [...prev.slice(-49), chatMessage])
            
            // Add to questions queue if it's a question
            if (analysis.isQuestion) {
              setQuestions(prev => [...prev.slice(-9), chatMessage])
            }
          }
        }

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
        }

        ws.onclose = (event) => {
          console.log('🔌 Disconnected from Twitch IRC', event.code, event.reason)
          // Auto-reconnect after 3 seconds if still connected
          if (isConnected) {
            setTimeout(connectToTwitch, 3000)
          }
        }

      } catch (error) {
        console.error('🚨 Connection error:', error)
        setTimeout(connectToTwitch, 3000)
      }
    }

    connectToTwitch()

    return () => {
      if (ws) {
        console.log('🔌 Closing WebSocket connection')
        ws.close()
      }
    }
  }, [isConnected, channelName])

  // Update stats with multilingual tracking
  useEffect(() => {
    const uniqueUsers = new Set(messages.map(m => m.username)).size
    const languageSet = new Set(messages.map(m => m.language).filter(Boolean))
    const sentimentValues = messages
      .map(m => m.sentiment === 'positive' ? 1 : m.sentiment === 'negative' ? -1 : 0)
    const avgSentiment = sentimentValues.length > 0 
      ? Math.round((sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length) * 100) / 100
      : 0

    setStats({
      totalMessages: messages.length,
      questions: questions.length,
      avgSentiment,
      languages: Array.from(languageSet),
      activeUsers: uniqueUsers
    })
  }, [messages, questions])

  // Beta access gate
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Casi Robot Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <img 
              src="/landing-robot.png"
              alt="Casi Robot"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#B8EE8A',
                padding: '10px'
              }}
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.currentTarget
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  target.style.display = 'none'
                  fallback.style.display = 'flex'
                }
              }}
            />
            <div style={{
              display: 'none',
              width: '80px',
              height: '80px',
              background: '#B8EE8A',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem'
            }}>
              🤖
            </div>
          </div>
          
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
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
            margin: '0 0 2rem 0',
            fontSize: '1.1rem',
            fontFamily: 'Poppins, sans-serif'
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
              padding: '1rem',
              margin: '0 0 1rem 0',
              borderRadius: '50px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              fontFamily: 'Poppins, sans-serif',
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
              padding: '1rem',
              margin: '0 0 1.5rem 0',
              borderRadius: '50px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              fontFamily: 'Poppins, sans-serif',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handleBetaAccess}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Access Beta Dashboard
          </button>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            margin: '1.5rem 0 0 0',
            fontFamily: 'Poppins, sans-serif'
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

  // Main Dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
      color: 'white'
    }}>
      {/* Header with Casi Logo and Robot */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Casi Full Logo */}
          <img 
            src="/landing-logo.png"
            alt="Casi"
            style={{
              height: '40px',
              width: 'auto',
              background: 'transparent'
            }}
            onError={(e) => {
              // Fallback text if logo doesn't exist
              const target = e.currentTarget
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) {
                target.style.display = 'none'
                fallback.style.display = 'block'
              }
            }}
          />
          <h1 style={{
            display: 'none',
            margin: 0,
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Casi
          </h1>
          
          {/* Casi Robot */}
          <img 
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#B8EE8A',
              padding: '8px'
            }}
            onError={(e) => {
              // Fallback emoji if robot doesn't exist
              const target = e.currentTarget
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) {
                target.style.display = 'none'
                fallback.style.display = 'flex'
              }
            }}
          />
          <div style={{
            display: 'none',
            width: '50px',
            height: '50px',
            background: '#B8EE8A',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            🤖
          </div>
          
          <div>
            <p style={{
              margin: '0',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem'
            }}>
              Welcome back, {email}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(184, 238, 138, 0.2)',
            borderRadius: '20px',
            fontSize: '0.9rem',
            border: '1px solid rgba(184, 238, 138, 0.3)'
          }}>
            {stats.languages.length} languages detected
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('casi_beta_access')
              localStorage.removeItem('casi_user_email')
              setIsAuthenticated(false)
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem', display: 'grid', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Connection Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: '#F7F7F7'
          }}>
            🎮 Connect to Twitch Channel
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter channel name (e.g., shroud)"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem',
                borderRadius: '50px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}
            />
            
            <button
              onClick={() => {
                if (channelName.trim()) {
                  setIsConnected(!isConnected)
                  if (!isConnected) {
                    setMessages([])
                    setQuestions([])
                  }
                }
              }}
              disabled={!channelName.trim()}
              style={{
                padding: '1rem 2rem',
                background: isConnected 
                  ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                  : 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: channelName.trim() ? 'pointer' : 'not-allowed',
                opacity: channelName.trim() ? 1 : 0.5,
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
          
          {isConnected && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(184, 238, 138, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid rgba(184, 238, 138, 0.3)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#B8EE8A',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ color: '#F7F7F7' }}>
                Connected to #{channelName} • Analyzing chat in real-time with multilingual support
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Priority Questions Panel with Language Info */}
        {isConnected && questions.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 159, 159, 0.2), rgba(255, 159, 159, 0.1))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 159, 159, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '12px',
              background: '#FF9F9F',
              color: '#151E3C',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              PRIORITY
            </div>
            
            <h2 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#F7F7F7'
            }}>
              🚨 Questions Detected ({questions.length})
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.slice(-5).map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(255, 159, 159, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#F7F7F7' }}>
                        {getLanguageFlag(q.language || 'english')} {q.username}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        background: 'rgba(94, 234, 212, 0.3)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '8px',
                        color: '#5EEAD4',
                        border: '1px solid rgba(94, 234, 212, 0.3)'
                      }}>
                        {q.language || 'english'}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'rgba(247, 247, 247, 0.7)'
                    }}>
                      {Math.round((q.confidence || 0) * 100)}% confidence
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#F7F7F7',
                    fontSize: '1rem',
                    lineHeight: '1.4'
                  }}>
                    {q.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>💬</div>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.totalMessages}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              Total Messages
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>❓</div>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#FF9F9F' }}>
              {stats.questions}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              Questions
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              {stats.avgSentiment > 0 ? '😊' : stats.avgSentiment < 0 ? '😢' : '😐'}
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: stats.avgSentiment > 0 ? '#B8EE8A' : stats.avgSentiment < 0 ? '#FF9F9F' : '#F7F7F7'
            }}>
              {stats.avgSentiment > 0 ? '+' : ''}{stats.avgSentiment}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              Mood Score
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🌍</div>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#932FFE' }}>
              {stats.languages.length}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              Languages
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>👥</div>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.activeUsers}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              Active Users
            </p>
          </div>
        </div>

        {/* Global Audience Panel */}
        {stats.languages.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
              🌍 Global Audience
            </h2>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {stats.languages.map((language) => (
                <div
                  key={language}
                  style={{
                    background: 'rgba(105, 50, 255, 0.2)',
                    border: '1px solid rgba(105, 50, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {getLanguageFlag(language)}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: '#F7F7F7'
                  }}>
                    {language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Chat Feed with Language Detection */}
        {isConnected && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
              💬 Live Chat Feed
            </h2>
            
            <div style={{
              height: '400px',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '1rem'
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
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💭</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif' }}>Waiting for chat messages...</p>
                    <p style={{ fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif' }}>
                      Make sure the channel is live and has active chat
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.slice(-20).map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: '0.75rem',
                        background: msg.isQuestion 
                          ? 'rgba(255, 159, 159, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: msg.isQuestion 
                          ? '1px solid rgba(255, 159, 159, 0.3)' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        animation: msg.isQuestion ? 'pulse 2s infinite' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>
                          {getLanguageFlag(msg.language || 'english')}
                        </span>
                        <span style={{
                          fontWeight: '600',
                          color: msg.isQuestion ? '#F7F7F7' : '#E5E7EB'
                        }}>
                          {msg.username}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(94, 234, 212, 0.2)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '6px',
                          color: '#5EEAD4',
                          border: '1px solid rgba(94, 234, 212, 0.3)'
                        }}>
                          {msg.language || 'english'}
                        </span>
                        {msg.isQuestion && (
                          <span style={{
                            fontSize: '0.7rem',
                            background: '#FF9F9F',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '6px',
                            color: '#151E3C',
                            fontWeight: '600'
                          }}>
                            QUESTION
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '6px',
                          color: 'white',
                          background: msg.sentiment === 'positive' 
                            ? '#B8EE8A' 
                            : msg.sentiment === 'negative' 
                            ? '#FF9F9F' 
                            : 'rgba(107, 114, 128, 0.8)'
                        }}>
                          {msg.sentiment?.toUpperCase()}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        color: msg.isQuestion ? '#F7F7F7' : '#F3F4F6',
                        lineHeight: '1.4',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif' }}>
            Casi Beta Dashboard • Real-time multilingual chat analysis for streamers
          </p>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: '#5EEAD4',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            ← Back to Landing Page
          </a>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(184, 238, 138, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(184, 238, 138, 0.7);
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .connection-form {
            flex-direction: column;
          }
          
          .connection-form input {
            min-width: 100%;
          }
          
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
