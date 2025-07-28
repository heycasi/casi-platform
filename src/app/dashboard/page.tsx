// src/app/dashboard/page.tsx - Enhanced Dashboard with Mobile Optimization & AI Motivation
'use client'
import { useState, useEffect } from 'react'
import { analyzeMessage, generateMotivationalSuggestion } from '../../lib/multilingual'

// Types
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

  // Valid beta codes
  const validCodes = ['CASI2025', 'BETASTREAM', 'EARLYACCESS']

  // Expanded bot usernames to filter out
  const botUsernames = [
    'nightbot', 'streamelements', 'moobot', 'fossabot', 'wizebot', 
    'streamlabs', 'botisimo', 'deepbot', 'ankhbot', 'revlobot',
    'phantombot', 'coebot', 'ohbot', 'tipeeebot', 'chatty',
    'streamdeckerbot', 'vivbot', 'soundalerts', 'own3dbot',
    'pretzelrocks', 'songrequestbot', 'musicbot'
  ]

  // Language flag helper function
  const getLanguageFlag = (language: string): string => {
    const flags: { [key: string]: string } = {
      'english': '🇺🇸', 'spanish': '🇪🇸', 'french': '🇫🇷', 'german': '🇩🇪',
      'portuguese': '🇵🇹', 'italian': '🇮🇹', 'dutch': '🇳🇱', 'japanese': '🇯🇵',
      'korean': '🇰🇷', 'chinese': '🇨🇳', 'russian': '🇷🇺', 'arabic': '🇸🇦', 'hindi': '🇮🇳'
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

  // Real Twitch IRC Connection with Enhanced Analysis
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    let ws: WebSocket | null = null

    const connectToTwitch = () => {
      try {
        console.log(`Connecting to Twitch IRC for channel: ${channelName}`)
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
        
        ws.onopen = () => {
          console.log('✅ Connected to Twitch IRC')
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
            
            // Filter out bot messages
            if (botUsernames.includes(username.toLowerCase())) {
              console.log(`🤖 Filtered bot message from: ${username}`)
              return
            }
            
            // Enhanced analysis with detailed sentiment
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

            console.log('📨 Enhanced message analysis:', chatMessage)
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

  // Generate motivational suggestions every 30 seconds
  useEffect(() => {
    if (!isConnected || messages.length < 10) return

    const interval = setInterval(() => {
      const recentMessages = messages.slice(-20)
      const suggestion = generateMotivationalSuggestion(recentMessages)
      if (suggestion) {
        setMotivationalMessage(suggestion)
        // Auto-hide after 15 seconds
        setTimeout(() => setMotivationalMessage(null), 15000)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [messages, isConnected])

  // Enhanced stats calculation with detailed insights
  useEffect(() => {
    const uniqueUsers = new Set(messages.map(m => m.username)).size
    const positiveMessages = messages.filter(m => m.sentiment === 'positive').length
    const negativeMessages = messages.filter(m => m.sentiment === 'negative').length
    
    const sentimentValues = messages.map(m => m.sentimentScore || 0)
    const avgSentiment = sentimentValues.length > 0 
      ? Math.round((sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length) * 100) / 100
      : 0

    // Determine current mood based on recent messages
    const recentMessages = messages.slice(-10)
    const recentPositive = recentMessages.filter(m => m.sentiment === 'positive').length
    const recentNegative = recentMessages.filter(m => m.sentiment === 'negative').length
    
    let currentMood = 'Neutral'
    if (recentPositive > recentNegative * 2) currentMood = 'Very Positive'
    else if (recentPositive > recentNegative) currentMood = 'Positive'
    else if (recentNegative > recentPositive * 2) currentMood = 'Negative'
    else if (recentNegative > recentPositive) currentMood = 'Slightly Negative'

    // Simulate viewer count (in real implementation, this would come from Twitch API)
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
        padding: 'clamp(1rem, 5vw, 2rem)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(15px, 3vw, 20px)',
          padding: 'clamp(2rem, 6vw, 3rem)',
          maxWidth: 'min(90vw, 400px)',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
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
                width: 'clamp(60px, 15vw, 80px)',
                height: 'clamp(60px, 15vw, 80px)',
                borderRadius: '50%',
                background: 'transparent',
                padding: '10px'
              }}
              onError={(e) => {
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
              width: 'clamp(60px, 15vw, 80px)',
              height: 'clamp(60px, 15vw, 80px)',
              background: '#B8EE8A',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)'
            }}>
              🤖
            </div>
          </div>
          
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            Casi Beta
          </h1>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 2rem 0',
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.5'
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
              padding: 'clamp(0.8rem, 3vw, 1rem)',
              margin: '0 0 1rem 0',
              borderRadius: '50px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
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
              padding: 'clamp(0.8rem, 3vw, 1rem)',
              margin: '0 0 1.5rem 0',
              borderRadius: '50px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'Poppins, sans-serif',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handleBetaAccess}
            style={{
              width: '100%',
              padding: 'clamp(0.8rem, 3vw, 1rem)',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: 'clamp(1rem, 3vw, 1.1rem)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Poppins, sans-serif',
              minHeight: '44px'
            }}
          >
            Access Beta Dashboard
          </button>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
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
      {/* Mobile-Optimized Header */}
      <div style={{
        padding: 'clamp(0.5rem, 2vw, 1rem)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'clamp(0.5rem, 2vw, 1rem)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(0.3rem, 1.5vw, 0.5rem)',
          flex: '1',
          minWidth: '150px'
        }}>
          <img 
            src="/landing-logo.png"
            alt="Casi"
            style={{
              height: 'clamp(24px, 6vw, 36px)',
              width: 'auto',
              background: 'transparent'
            }}
            onError={(e) => {
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
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Casi
          </h1>
          
          <img 
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{
              width: 'clamp(24px, 6vw, 36px)',
              height: 'clamp(24px, 6vw, 36px)',
              background: 'transparent',
              flexShrink: 0
            }}
            onError={(e) => {
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
            width: 'clamp(24px, 6vw, 36px)',
            height: 'clamp(24px, 6vw, 36px)',
            background: '#B8EE8A',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(0.8rem, 3vw, 1.2rem)',
            flexShrink: 0
          }}>
            🤖
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(0.3rem, 1.5vw, 0.5rem)',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              localStorage.removeItem('casi_beta_access')
              localStorage.removeItem('casi_user_email')
              setIsAuthenticated(false)
            }}
            style={{
              padding: 'clamp(0.3rem, 1.5vw, 0.4rem) clamp(0.6rem, 2vw, 0.8rem)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
              fontFamily: 'Poppins, sans-serif',
              minHeight: '36px',
              whiteSpace: 'nowrap'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        padding: 'clamp(0.5rem, 2vw, 1rem)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'clamp(1rem, 3vw, 1.5rem)', 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        
        {/* Connection Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(15px, 3vw, 20px)',
          padding: 'clamp(1rem, 4vw, 2rem)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
            fontWeight: '600',
            color: '#F7F7F7'
          }}>
            🎮 Connect to Twitch Channel
          </h2>
          
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(0.5rem, 2vw, 1rem)', 
            alignItems: 'center', 
            flexWrap: 'wrap' 
          }}>
            <input
              type="text"
              placeholder="Enter channel name (e.g., shroud)"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: 'clamp(0.8rem, 3vw, 1rem)',
                borderRadius: '50px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                fontFamily: 'Poppins, sans-serif',
                minHeight: '44px',
                boxSizing: 'border-box'
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
                padding: 'clamp(0.8rem, 3vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                background: isConnected 
                  ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                  : 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                fontWeight: '600',
                cursor: channelName.trim() ? 'pointer' : 'not-allowed',
                opacity: channelName.trim() ? 1 : 0.5,
                fontFamily: 'Poppins, sans-serif',
                minHeight: '44px',
                whiteSpace: 'nowrap'
              }}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
          
          {isConnected && (
            <div style={{
              marginTop: '1rem',
              padding: 'clamp(0.8rem, 3vw, 1rem)',
              background: 'rgba(184, 238, 138, 0.2)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
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
              <span style={{ 
                color: '#F7F7F7', 
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                lineHeight: '1.4'
              }}>
                Hey @{channelName}! Your friendly stream sidekick is here to analyze your stream in real-time! 🎮✨
              </span>
            </div>
          )}
        </div>

        {/* AI Motivational Suggestions */}
        {motivationalMessage && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.1))',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(15px, 3vw, 20px)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            position: 'relative',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <div style={{
              position: 'absolute',
              top: 'clamp(-6px, -1.5vw, -8px)',
              right: 'clamp(8px, 3vw, 12px)',
              background: '#5EEAD4',
              color: '#151E3C',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
              fontWeight: '600'
            }}>
              AI INSIGHT
            </div>
            
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)', 
              fontWeight: '600',
              color: '#F7F7F7',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🤖 AI Coach Suggestion
            </h3>
            
            <p style={{
              margin: 0,
              color: '#F7F7F7',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              lineHeight: '1.5',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: 'clamp(0.8rem, 3vw, 1rem)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              border: '1px solid rgba(94, 234, 212, 0.2)'
            }}>
              {motivationalMessage}
            </p>
            
            <button
              onClick={() => setMotivationalMessage(null)}
              style={{
                position: 'absolute',
                top: 'clamp(0.5rem, 2vw, 1rem)',
                right: 'clamp(0.5rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 'clamp(24px, 6vw, 32px)',
                height: 'clamp(24px, 6vw, 32px)',
                color: 'white',
                cursor: 'pointer',
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Enhanced Priority Questions Panel */}
        {isConnected && questions.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 159, 159, 0.2), rgba(255, 159, 159, 0.1))',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(15px, 3vw, 20px)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            border: '1px solid rgba(255, 159, 159, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 'clamp(-6px, -1.5vw, -8px)',
              right: 'clamp(8px, 3vw, 12px)',
              background: '#FF9F9F',
              color: '#151E3C',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
              fontWeight: '600'
            }}>
              PRIORITY
            </div>
            
            <h2 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              fontWeight: '600',
              color: '#F7F7F7'
            }}>
              🚨 Questions Detected ({questions.length})
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
              {questions.slice(-5).map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(0.8rem, 3vw, 1rem)',
                    border: '1px solid rgba(255, 159, 159, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '600', color: '#F7F7F7', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                        {getLanguageFlag(q.language || 'english')} {q.username}
                      </span>
                      <span style={{
                        fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                        background: 'rgba(94, 234, 212, 0.3)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '8px',
                        color: '#5EEAD4',
                        border: '1px solid rgba(94, 234, 212, 0.3)'
                      }}>
                        {q.language || 'english'}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#F7F7F7',
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    lineHeight: '1.4'
                  }}>
                    {q.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Analytics Grid - Mobile Optimized */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'clamp(0.8rem, 2.5vw, 1rem)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>👥</div>
            <p style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.viewerCount}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Viewers
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>💬</div>
            <p style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: '#5EEAD4' }}>
              {stats.totalMessages}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Messages
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>❓</div>
            <p style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: '#FF9F9F' }}>
              {stats.questions}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Questions
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>
              {stats.avgSentiment > 0.5 ? '😊' : stats.avgSentiment < -0.5 ? '😢' : '😐'}
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              fontWeight: 'bold', 
              color: stats.avgSentiment > 0.5 ? '#B8EE8A' : stats.avgSentiment < -0.5 ? '#FF9F9F' : '#F7F7F7'
            }}>
              {stats.currentMood}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Current Mood
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>✨</div>
            <p style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: '#B8EE8A' }}>
              {stats.positiveMessages}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Positive
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: '0 0 0.5rem 0' }}>💔</div>
            <p style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold', color: '#FF9F9F' }}>
              {stats.negativeMessages}
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', opacity: 0.7 }}>
              Negative
            </p>
          </div>
        </div>

        {/* Detailed Sentiment Insights Panel */}
        {isConnected && messages.length > 5 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(15px, 3vw, 20px)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              fontWeight: '600',
              color: '#F7F7F7'
            }}>
              📊 Detailed Sentiment Analysis
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              <div style={{
                background: 'rgba(184, 238, 138, 0.1)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                padding: 'clamp(0.8rem, 3vw, 1rem)',
                border: '1px solid rgba(184, 238, 138, 0.2)'
              }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: 'clamp(1rem, 3vw, 1.1rem)', 
                  color: '#B8EE8A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ✨ Why Chat is Positive
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {messages
                    .filter(m => m.sentiment === 'positive' && m.sentimentReason)
                    .slice(-3)
                    .map(m => (
                      <div key={m.id} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: 'clamp(0.5rem, 2vw, 0.8rem)',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                      }}>
                        <strong>{m.username}:</strong> {m.sentimentReason}
                      </div>
                    ))}
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 159, 159, 0.1)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                padding: 'clamp(0.8rem, 3vw, 1rem)',
                border: '1px solid rgba(255, 159, 159, 0.2)'
              }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: 'clamp(1rem, 3vw, 1.1rem)', 
                  color: '#FF9F9F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💔 Areas to Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {messages
                    .filter(m => m.sentiment === 'negative' && m.sentimentReason)
                    .slice(-3)
                    .map(m => (
                      <div key={m.id} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: 'clamp(0.5rem, 2vw, 0.8rem)',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                      }}>
                        <strong>{m.username}:</strong> {m.sentimentReason}
                      </div>
                    ))}
                  {messages.filter(m => m.sentiment === 'negative').length === 0 && (
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                      No negative sentiment detected - great job! 🎉
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Chat Feed with Enhanced Analysis */}
        {isConnected && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(15px, 3vw, 20px)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
              fontWeight: '600'
            }}>
              💬 Live Chat Feed
            </h2>
            
            <div style={{
              height: 'clamp(300px, 50vh, 400px)',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              padding: 'clamp(0.8rem, 3vw, 1rem)'
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
                    <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '1rem' }}>💭</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                      Waiting for chat messages...
                    </p>
                    <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', fontFamily: 'Poppins, sans-serif' }}>
                      Make sure the channel is live and has active chat
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
                  {messages.slice(-20).map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                        background: msg.isQuestion 
                          ? 'rgba(255, 159, 159, 0.2)' 
                          : msg.sentiment === 'positive'
                          ? 'rgba(184, 238, 138, 0.1)'
                          : msg.sentiment === 'negative'
                          ? 'rgba(255, 159, 159, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'clamp(6px, 2vw, 8px)',
                        border: msg.isQuestion 
                          ? '1px solid rgba(255, 159, 159, 0.3)' 
                          : msg.sentiment === 'positive'
                          ? '1px solid rgba(184, 238, 138, 0.2)'
                          : msg.sentiment === 'negative'
                          ? '1px solid rgba(255, 159, 159, 0.2)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        animation: msg.isQuestion ? 'pulse 2s infinite' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                          {getLanguageFlag(msg.language || 'english')}
                        </span>
                        <span style={{
                          fontWeight: '600',
                          color: msg.isQuestion ? '#F7F7F7' : '#E5E7EB',
                          fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                        }}>
                          {msg.username}
                        </span>
                        <span style={{
                          fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
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
                            fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
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
                          fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
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
                        {msg.engagementLevel === 'high' && (
                          <span style={{
                            fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
                            background: '#FFD700',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '6px',
                            color: '#000',
                            fontWeight: '600'
                          }}>
                            HYPE
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        color: msg.isQuestion ? '#F7F7F7' : '#F3F4F6',
                        lineHeight: '1.4',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                      }}>
                        {msg.message}
                      </p>
                      {msg.sentimentReason && (
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                          fontStyle: 'italic'
                        }}>
                          Reason: {msg.sentimentReason}
                        </p>
                      )}
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
          padding: 'clamp(1rem, 4vw, 2rem) 0',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', 
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.5'
          }}>
            Casi Beta Dashboard • Your stream's brainy co-pilot. Reads the room so you don't have to.
          </p>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: '#5EEAD4',
              textDecoration: 'none',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            ← Back to Landing Page
          </a>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        ::-webkit-scrollbar {
          width: clamp(6px, 1.5vw, 8px);
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
      `}</style>
    </div>
  )
}
