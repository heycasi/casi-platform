// src/app/dashboard/page.tsx - Clean Dashboard with Full Width Layout
'use client'
import { useState, useEffect } from 'react'
import { analyzeMessage, generateMotivationalSuggestion } from '../../lib/multilingual'

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

  const getLanguageFlag = (language: string): string => {
    const flags: { [key: string]: string } = {
      'english': '🇺🇸', 'spanish': '🇪🇸', 'french': '🇫🇷', 'german': '🇩🇪',
      'portuguese': '🇵🇹', 'italian': '🇮🇹', 'dutch': '🇳🇱', 'japanese': '🇯🇵',
      'korean': '🇰🇷', 'chinese': '🇨🇳', 'russian': '🇷🇺', 'arabic': '🇸🇦', 'hindi': '🇮🇳'
    }
    return flags[language] || '🌍'
  }

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
    if (hasAccess && savedEmail) {
      setIsAuthenticated(true)
      setEmail(savedEmail)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    let ws: WebSocket | null = null

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
            
            const chatMessage: ChatMessage = {
              id: Date.now().toString() + Math.random(),
              username,
              message: messageText,
              timestamp: Date.now(),
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
          }
        }

        ws.onerror = () => {
          // Handle error silently
        }

        ws.onclose = () => {
          if (isConnected) {
            setTimeout(connectToTwitch, 3000)
          }
        }

      } catch {
        setTimeout(connectToTwitch, 3000)
      }
    }

    connectToTwitch()

    return () => {
      if (ws) {
        ws.close()
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
      viewerCount,
      activeUsers: uniqueUsers,
      currentMood
    })
  }, [messages, questions])

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
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
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
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
                background: 'transparent'
              }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.style.cssText = 'width: 80px; height: 80px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;'
                fallback.textContent = '🤖'
                target.parentNode?.appendChild(fallback)
              }}
            />
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
            fontSize: '1.1rem'
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
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Access Beta Dashboard
          </button>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            margin: '1.5rem 0 0 0'
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
      fontFamily: 'Poppins, sans-serif',
      color: 'white'
    }}>
      <div style={{
        padding: '1rem',
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
            style={{ height: '36px', width: 'auto', background: 'transparent' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('h1')
              fallback.style.cssText = 'margin: 0; font-size: 1.5rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
              fallback.textContent = 'Casi'
              target.parentNode?.appendChild(fallback)
            }}
          />
          
          <img 
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{ width: '36px', height: '36px', background: 'transparent' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.style.cssText = 'width: 36px; height: 36px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
            }}
          />
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

      <div style={{ 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        height: 'calc(100vh - 80px)',
        overflow: 'hidden'
      }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isConnected ? '1fr 400px' : '1fr',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F7F7F7' }}>
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
                      setMotivationalMessage(null)
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
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#F7F7F7', fontSize: '1rem' }}>
                  Hey @{channelName}! Your friendly stream sidekick is here to analyze your stream in real-time! 🎮✨
                </span>
              </div>
            )}
          </div>

          {isConnected && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#F7F7F7' }}>
                📺 Stream Preview
              </h3>
              
              <div style={{
                width: '100%',
                height: '225px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <iframe
                  src={`https://player.twitch.tv/?channel=${channelName}&parent=localhost&parent=vercel.app&parent=heycasi.com&autoplay=false&muted=true`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '8px' }}
                  allowFullScreen
                />
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  zIndex: -1
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📺</div>
                  <p style={{ margin: 0 }}>Stream Preview</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>@{channelName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {motivationalMessage && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.1))',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: '#5EEAD4',
              color: '#151E3C',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              🤖 AI INSIGHT
            </div>
            
            <p style={{ margin: 0, color: '#F7F7F7', fontSize: '0.95rem', flex: 1 }}>
              {motivationalMessage}
            </p>
            
            <button
              onClick={() => setMotivationalMessage(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>👥</div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.viewerCount}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Viewers</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>💬</div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.totalMessages}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Messages</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>❓</div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#FF9F9F' }}>
              {stats.questions}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Questions</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
              {stats.avgSentiment > 0.5 ? '😊' : stats.avgSentiment < -0.5 ? '😢' : '😐'}
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              color: stats.avgSentiment > 0.5 ? '#B8EE8A' : stats.avgSentiment < -0.5 ? '#FF9F9F' : '#F7F7F7'
            }}>
              {stats.currentMood}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Mood</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>✨</div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#B8EE8A' }}>
              {stats.positiveMessages}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Positive</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>💔</div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#FF9F9F' }}>
              {stats.negativeMessages}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Negative</p>
          </div>
        </div>

        {isConnected && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: questions.length > 0 ? '1fr 1fr' : '1fr',
            gap: '1rem',
            flex: 1,
            minHeight: 0
          }}>
            
            {questions.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 159, 159, 0.2), rgba(255, 159, 159, 0.1))',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 159, 159, 0.3)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
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
                
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F7F7F7' }}>
                  🚨 Questions ({questions.length})
                </h2>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem',
                  flex: 1,
                  overflowY: 'auto',
                  minHeight: 0
                }}>
                  {questions.slice(-10).map((q) => (
                    <div
                      key={q.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid rgba(255, 159, 159, 0.3)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontWeight: '600', color: '#F7F7F7', fontSize: '0.95rem' }}>
                          {getLanguageFlag(q.language || 'english')} {q.username}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(94, 234, 212, 0.3)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '6px',
                          color: '#5EEAD4',
                          border: '1px solid rgba(94, 234, 212, 0.3)'
                        }}>
                          {q.language || 'english'}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        color: '#F7F7F7',
                        fontSize: '0.95rem',
                        lineHeight: '1.4'
                      }}>
                        {q.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
                💬 Live Chat Feed
              </h2>
              
              <div style={{
                flex: 1,
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
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
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💭</div>
                      <p style={{ fontSize: '1rem' }}>Waiting for chat messages...</p>
                      <p style={{ fontSize: '0.9rem' }}>Make sure the channel is live and has active chat</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {messages.slice(-50).map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          padding: '0.7rem',
                          background: msg.isQuestion 
                            ? 'rgba(255, 159, 159, 0.2)' 
                            : msg.sentiment === 'positive'
                            ? 'rgba(184, 238, 138, 0.1)'
                            : msg.sentiment === 'negative'
                            ? 'rgba(255, 159, 159, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
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
                          gap: '0.4rem',
                          marginBottom: '0.3rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ fontSize: '0.85rem' }}>
                            {getLanguageFlag(msg.language || 'english')}
                          </span>
                          <span style={{
                            fontWeight: '600',
                            color: msg.isQuestion ? '#F7F7F7' : '#E5E7EB',
                            fontSize: '0.9rem'
                          }}>
                            {msg.username}
                          </span>
                          {msg.isQuestion && (
                            <span style={{
                              fontSize: '0.7rem',
                              background: '#FF9F9F',
                              padding: '0.1rem 0.3rem',
                              borderRadius: '4px',
                              color: '#151E3C',
                              fontWeight: '600'
                            }}>
                              Q
                            </span>
                          )}
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '4px',
                            color: 'white',
                            background: msg.sentiment === 'positive' 
                              ? '#B8EE8A' 
                              : msg.sentiment === 'negative' 
                              ? '#FF9F9F' 
                              : 'rgba(107, 114, 128, 0.8)'
                          }}>
                            {msg.sentiment?.charAt(0).toUpperCase()}
                          </span>
                          {msg.engagementLevel === 'high' && (
                            <span style={{
                              fontSize: '0.7rem',
                              background: '#FFD700',
                              padding: '0.1rem 0.3rem',
                              borderRadius: '4px',
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
                          lineHeight: '1.4',
                          fontSize: '0.9rem'
                        }}>
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          padding: '1rem 0',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>
            Casi Beta Dashboard • Your stream's brainy co-pilot. Reads the room so you don't have to.
          </p>
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
        </div>
      </div>
    </div>
  )
}
