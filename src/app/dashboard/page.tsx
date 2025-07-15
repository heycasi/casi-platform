// src/app/dashboard/page.tsx - Updated with Beta Access Control

'use client'

import { useState, useEffect } from 'react'

// Types
interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  sentiment?: 'positive' | 'negative' | 'neutral'
  isQuestion?: boolean
  priority?: number
}

interface BetaUser {
  email: string
  hasAccess: boolean
  twitchConnected: boolean
}

export default function Dashboard() {
  // Beta Access State
  const [betaUser, setBetaUser] = useState<BetaUser | null>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [accessError, setAccessError] = useState('')
  
  // Dashboard State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channelName, setChannelName] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Check beta access on load
  useEffect(() => {
    checkBetaAccess()
  }, [])

  const checkBetaAccess = () => {
    // Check if user already has access in localStorage
    const storedAccess = localStorage.getItem('casi_beta_access')
    if (storedAccess) {
      try {
        const userData = JSON.parse(storedAccess)
        setBetaUser(userData)
        setIsCheckingAccess(false)
        return
      } catch (error) {
        localStorage.removeItem('casi_beta_access')
      }
    }
    setIsCheckingAccess(false)
  }

  const handleBetaLogin = async (email: string, betaCode: string) => {
    setIsCheckingAccess(true)
    setAccessError('')

    try {
      // Check if beta code is correct (simple approach)
      const validCodes = ['CASI2025', 'BETASTREAM', 'EARLYACCESS']
      
      if (!validCodes.includes(betaCode.toUpperCase())) {
        setAccessError('Invalid beta access code')
        setIsCheckingAccess(false)
        return
      }

      // TODO: Optional - Check if email is in waitlist via Supabase
      // const { data, error } = await supabase
      //   .from('waitlist')
      //   .select('email')
      //   .eq('email', email.toLowerCase())
      //   .single()

      const userData: BetaUser = {
        email: email.toLowerCase(),
        hasAccess: true,
        twitchConnected: false
      }

      setBetaUser(userData)
      localStorage.setItem('casi_beta_access', JSON.stringify(userData))
      setIsCheckingAccess(false)
    } catch (error) {
      setAccessError('Error verifying access. Please try again.')
      setIsCheckingAccess(false)
    }
  }

  // Twitch OAuth Integration
  const handleTwitchLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || 'your_twitch_client_id'
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/twitch/callback`)
    const scope = encodeURIComponent('user:read:email chat:read')
    
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&force_verify=true`
    
    window.location.href = twitchAuthUrl
  }

  // IRC Connection (existing code)
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected || !channelName) return

    let ws: WebSocket | null = null
    
    const connectToTwitch = () => {
      try {
        console.log(`Connecting to Twitch IRC for channel: ${channelName}`)
        
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
        
        ws.onopen = () => {
          console.log('Connected to Twitch IRC')
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
          
          if (message.includes('PRIVMSG')) {
            const match = message.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/)
            if (match) {
              const [, username, messageText] = match
              
              if (username === 'streamlabs' || username === 'nightbot' || messageText.startsWith('!')) {
                return
              }
              
              const isQuestion = messageText.includes('?') || 
                ['what', 'how', 'when', 'where', 'why', 'who'].some(word => 
                  messageText.toLowerCase().includes(word)
                )
              
              const newMessage: ChatMessage = {
                id: Date.now().toString() + Math.random(),
                username,
                message: messageText,
                timestamp: new Date(),
                sentiment: messageText.toLowerCase().includes('good') || messageText.toLowerCase().includes('great') ? 'positive' :
                          messageText.toLowerCase().includes('bad') || messageText.toLowerCase().includes('hate') ? 'negative' : 'neutral',
                isQuestion,
                priority: isQuestion ? 8 : Math.floor(Math.random() * 6) + 1
              }
              
              setMessages(prev => [newMessage, ...prev].slice(0, 100))
            }
          }
        }
        
        ws.onerror = (error) => {
          console.error('Twitch IRC error:', error)
        }
        
        ws.onclose = () => {
          console.log('Disconnected from Twitch IRC')
        }
      } catch (error) {
        console.error('Failed to connect to Twitch IRC:', error)
      }
    }
    
    connectToTwitch()
    
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [isConnected, channelName])

  const handleConnect = () => {
    if (!channelName.trim()) return
    
    setConnectionStatus('connecting')
    setMessages([])
    
    setTimeout(() => {
      setConnectionStatus('connected')
      setIsConnected(true)
    }, 2000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setMessages([])
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981'
      case 'negative': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getPriorityColor = (priority?: number) => {
    if (!priority) return '#6B7280'
    if (priority >= 8) return '#EF4444'
    if (priority >= 6) return '#F59E0B'
    return '#10B981'
  }

  const questions = messages.filter(msg => msg.isQuestion)
  const avgSentiment = messages.length > 0 ? 
    messages.reduce((acc, msg) => {
      if (msg.sentiment === 'positive') return acc + 1
      if (msg.sentiment === 'negative') return acc - 1
      return acc
    }, 0) / messages.length : 0

  // Beta Access Gate
  if (isCheckingAccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
          <div>Checking access...</div>
        </div>
      </div>
    )
  }

  if (!betaUser) {
    return <BetaAccessForm onLogin={handleBetaLogin} error={accessError} isLoading={isCheckingAccess} />
  }

  // Main Dashboard (existing UI with small additions)
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header with Beta Info */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.2)', 
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <img 
                src="/landing-robot.png" 
                alt="Casi Robot" 
                style={{ 
                  width: '40px', 
                  height: '40px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.insertAdjacentHTML('afterend', `
                    <div style="font-size: 2rem;">🤖</div>
                  `)
                }}
              />
              <div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Casi
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: '300'
                }}>
                  chat analysis & stream intelligence
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <span>Beta User: {betaUser.email}</span>
              <span style={{ color: '#10B981' }}>✓ Verified</span>
            </div>
            {!betaUser.twitchConnected && (
              <button
                onClick={handleTwitchLogin}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #9146FF, #772CE8)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🎮 Connect Twitch
              </button>
            )}
            <a 
              href="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '25px',
                fontSize: '0.9rem',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              ← Home
            </a>
          </div>
        </div>
      </div>

      {/* Rest of dashboard - existing code continues... */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Connection Panel */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '20px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
            Connect to Twitch Channel
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Enter Twitch channel name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              disabled={isConnected}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                minWidth: '250px',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
            
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={!channelName.trim() || connectionStatus === 'connecting'}
                style={{
                  padding: '1rem 2rem',
                  background: connectionStatus === 'connecting' 
                    ? 'linear-gradient(135deg, #FF9F9F, #932FFE)' 
                    : 'linear-gradient(135deg, #6932FF, #932FFE)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: connectionStatus === 'connecting' ? 'not-allowed' : 'pointer',
                  opacity: (!channelName.trim() || connectionStatus === 'connecting') ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #FF9F9F, #6932FF)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Disconnect
              </button>
            )}
          </div>

          {connectionStatus === 'connected' && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(184, 238, 138, 0.2), rgba(94, 234, 212, 0.2))',
              borderRadius: '20px',
              border: '2px solid rgba(184, 238, 138, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>✅ Connected to #{channelName} • {messages.length} live messages</span>
              <span style={{ 
                background: 'rgba(16, 185, 129, 0.2)', 
                color: '#10B981', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '20px', 
                fontSize: '0.8rem',
                fontWeight: 'bold',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                LIVE IRC
              </span>
            </div>
          )}
        </div>

        {/* Analytics and Chat sections - existing code... */}
        {/* [Rest of your existing dashboard UI] */}

        {!isConnected && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Welcome to Casi Beta!</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              Connect to any live Twitch channel to start getting real-time chat analysis, 
              question detection, and audience sentiment tracking from actual viewers.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '1rem' }}>
              Try popular channels like: shroud, pokimane, summit1g, xqc, or any active streamer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Beta Access Form Component
function BetaAccessForm({ onLogin, error, isLoading }: { 
  onLogin: (email: string, code: string) => void
  error: string
  isLoading: boolean 
}) {
  const [email, setEmail] = useState('')
  const [betaCode, setBetaCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && betaCode) {
      onLogin(email, betaCode)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem'
        }}>
          Casi Beta Access
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Enter your email and beta access code to continue
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '50px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />
          
          <input
            type="text"
            value={betaCode}
            onChange={(e) => setBetaCode(e.target.value)}
            placeholder="Enter beta access code"
            required
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '50px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />

          {error && (
            <div style={{
              color: '#FF9F9F',
              fontSize: '0.9rem',
              padding: '0.5rem',
              background: 'rgba(255, 159, 159, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 159, 159, 0.3)'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email || !betaCode || isLoading}
            style={{
              padding: '1rem 2rem',
              background: isLoading 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: (!email || !betaCode || isLoading) ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Verifying...' : 'Access Beta Dashboard'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          fontSize: '0.9rem', 
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Need a beta code? Contact us at <a href="mailto:casi@heycasi.com" style={{ color: '#5EEAD4' }}>casi@heycasi.com</a>
        </div>

        <a 
          href="/" 
          style={{ 
            display: 'inline-block',
            marginTop: '1rem',
            color: 'rgba(255, 255, 255, 0.7)', 
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Home
        </a>
      </div>
    </div>
  )
}
