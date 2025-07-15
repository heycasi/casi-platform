  // Real Twitch IRC Connection
  useEffect(() => {
    if (!isConnected || !channelName) return

    let ws: WebSocket | null = null
    
    const connectToTwitch = () => {
      // Connect to Twitch IRC WebSocket
      ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
      
      ws.onopen = () => {
        console.log('Connected to Twitch IRC')
        // Send authentication (anonymous)
        ws?.send('PASS SCHMOOPIIE') // Anonymous login
        ws?.send('NICK justinfan12345') // Anonymous username
        ws?.send(`JOIN #${channelName.toLowerCase()}`) // Join the channel
      }
      
      ws.onmessage = (event) => {
        const message = event.data.trim()
        console.log('Raw IRC message:', message)
        
        // Handle PING/PONG to stay connected
        if (message.startsWith('PING')) {
          ws?.send('PONG :tmi.twitch.tv')
          return
        }
        
        // Parse chat messages
        if (message.includes('PRIVMSG')) {
          const parsedMessage = parseIRCMessage(message)
          if (parsedMessage) {
            setMessages(prev => [parsedMessage, ...prev].slice(0, 100)) // Keep last 100 messages
          }
        }
      }
      
      ws.onerror = (error) => {
        console.error('Twitch IRC error:', error)
      }
      
      ws.onclose = () => {
        console.log('Disconnected from Twitch IRC')
      }
    }
    
    connectToTwitch()
    
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [isConnected, channelName])

  // Parse IRC message into our ChatMessage format
  const parseIRCMessage = (rawMessage: string): ChatMessage | null => {
    try {
      // Example IRC message format:
      // :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
      const messageRegex = /:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/
      const match = rawMessage.match(messageRegex)
      
      if (!match) return null
      
      const [, username, messageText] = match
      
      // Skip bot messages and commands
      if (username === 'streamlabs' || username === 'nightbot' || messageText.startsWith('!')) {
        return null
      }
      
      // Analyze the message
      const isQuestion = detectQuestion(messageText)
      const sentiment = analyzeSentiment(messageText)
      const priority = calculatePriority(messageText, isQuestion, sentiment)
      
      return {
        id: Date.now().toString() + Math.random(),
        username,
        message: messageText,
        timestamp: new Date(),
        sentiment,
        isQuestion,
        priority
      }
    } catch (error) {
      console.error('Error parsing IRC message:', error)
      return null
    }
  }

  // Improved question detection
  const detectQuestion = (message: string): boolean =>'use client'
import React, { useState, useEffect } from 'react'

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

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channelName, setChannelName] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Real Twitch IRC Connection
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    if (!isConnected || !channelName) return

    let ws: WebSocket | null = null
    
    const connectToTwitch = () => {
      console.log(`Connecting to Twitch IRC for channel: ${channelName}`)
      
      try {
        // Connect to Twitch IRC WebSocket
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
        
        ws.onopen = () => {
          console.log('Connected to Twitch IRC')
          // Send authentication (anonymous)
          ws?.send('PASS SCHMOOPIIE') // Anonymous login
          ws?.send('NICK justinfan12345') // Anonymous username
          ws?.send(`JOIN #${channelName.toLowerCase()}`) // Join the channel
        }
        
        ws.onmessage = (event) => {
          const message = event.data.trim()
          
          // Handle PING/PONG to stay connected
          if (message.startsWith('PING')) {
            ws?.send('PONG :tmi.twitch.tv')
            return
          }
          
          // Parse chat messages
          if (message.includes('PRIVMSG')) {
            const parsedMessage = parseIRCMessage(message)
            if (parsedMessage) {
              setMessages(prev => [parsedMessage, ...prev].slice(0, 100)) // Keep last 100 messages
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

  // Parse IRC message into our ChatMessage format
  const parseIRCMessage = (rawMessage: string): ChatMessage | null => {
    try {
      // Example IRC message format:
      // :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
      const messageRegex = /:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/
      const match = rawMessage.match(messageRegex)
      
      if (!match) return null
      
      const [, username, messageText] = match
      
      // Skip bot messages and commands
      if (username === 'streamlabs' || username === 'nightbot' || messageText.startsWith('!')) {
        return null
      }
      
      // Analyze the message
      const isQuestion = detectQuestion(messageText)
      const sentiment = analyzeSentiment(messageText)
      const priority = calculatePriority(messageText, isQuestion, sentiment)
      
      return {
        id: Date.now().toString() + Math.random(),
        username,
        message: messageText,
        timestamp: new Date(),
        sentiment,
        isQuestion,
        priority
      }
    } catch (error) {
      console.error('Error parsing IRC message:', error)
      return null
    }
  }

  // Improved question detection
  const detectQuestion = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    
    // Direct question indicators
    if (message.includes('?')) return true
    
    // Question words
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'can you', 'could you', 'would you', 'do you', 'did you', 'are you', 'is it', 'will you']
    
    return questionWords.some(word => lowerMessage.includes(word))
  }

  // Improved sentiment analysis
  const analyzeSentiment = (message: string): 'positive' | 'negative' | 'neutral' => {
    const lowerMessage = message.toLowerCase()
    
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'best', 'nice', 'cool', 'fantastic', 'excellent', 'perfect', 'beautiful', 'wonderful', 'incredible', 'fun', 'exciting', 'happy', 'thanks', 'thank you', 'appreciate', 'wow', 'poggers', 'pog', 'lit', 'fire', '❤️', '😍', '😊', '👍', '🔥', '💯']
    
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'boring', 'stupid', 'dumb', 'sucks', 'trash', 'garbage', 'wtf', 'annoying', 'frustrated', 'angry', 'mad', 'disappointed', 'sad', '😢', '😡', '😞', '👎', '💩']
    
    let positiveScore = 0
    let negativeScore = 0
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveScore++
    })
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeScore++
    })
    
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  // Calculate message priority
  const calculatePriority = (message: string, isQuestion: boolean, sentiment: 'positive' | 'negative' | 'neutral'): number => {
    let priority = 5 // Base priority
    
    if (isQuestion) priority += 3
    if (sentiment === 'negative') priority += 2
    if (sentiment === 'positive') priority += 1
    
    // High priority keywords
    const urgentWords = ['help', 'issue', 'problem', 'bug', 'broken', 'error', 'crash']
    if (urgentWords.some(word => message.toLowerCase().includes(word))) {
      priority += 2
    }
    
    return Math.min(priority, 10) // Cap at 10
  }

  const getRandomMessage = () => {
    const messages = [
      'Hello everyone!',
      'What game is this?',
      'Great content!',
      'How do you do that trick?',
      'Amazing stream!',
      'Can you play some music?',
      'This is so cool!',
      'When did you start streaming?',
      'Love this game!',
      'What settings do you use?'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getRandomSentiment = (): 'positive' | 'negative' | 'neutral' => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral']
    return sentiments[Math.floor(Math.random() * sentiments.length)]
  }

  const handleConnect = () => {
    if (!channelName.trim()) return
    
    setConnectionStatus('connecting')
    setMessages([]) // Clear previous messages
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected')
      setIsConnected(true)
    }, 2000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setMessages([]) // Clear messages when disconnecting
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981' // Green
      case 'negative': return '#EF4444' // Red
      default: return '#6B7280' // Gray
    }
  }

  const getPriorityColor = (priority?: number) => {
    if (!priority) return '#6B7280'
    if (priority >= 8) return '#EF4444' // High priority - Red
    if (priority >= 6) return '#F59E0B' // Medium priority - Yellow
    return '#10B981' // Low priority - Green
  }

  const questions = messages.filter(msg => msg.isQuestion)
  const avgSentiment = messages.length > 0 ? 
    messages.reduce((acc, msg) => {
      if (msg.sentiment === 'positive') return acc + 1
      if (msg.sentiment === 'negative') return acc - 1
      return acc
    }, 0) / messages.length : 0

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.2)', 
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Casi Robot Logo - matching your landing page */}
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
                  // Fallback if image doesn't load
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
            <a 
              href="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '25px',
                fontSize: '0.9rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

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
              <span>✅ Connected to #{channelName} • {messages.length} messages analyzed • LIVE CHAT</span>
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

        {isConnected && (
          <>
            {/* Analytics Overview */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '20px', 
                padding: '1.5rem',
                textAlign: 'center',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Questions Detected</div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {avgSentiment > 0 ? '😊' : avgSentiment < 0 ? '😞' : '😐'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Chat Mood</div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>
                  {messages.length}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Messages</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              
              {/* Live Chat Feed */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                  📊 Live Chat Analysis
                </h3>
                
                <div style={{ 
                  height: '400px', 
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        background: msg.isQuestion 
                          ? 'rgba(59, 130, 246, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        borderLeft: `4px solid ${getPriorityColor(msg.priority)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <strong style={{ color: 'white', fontSize: '0.9rem' }}>{msg.username}</strong>
                            {msg.isQuestion && (
                              <span style={{ 
                                background: '#3B82F6', 
                                color: 'white', 
                                padding: '0.125rem 0.5rem', 
                                borderRadius: '12px', 
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}>
                                QUESTION
                              </span>
                            )}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                            {msg.message}
                          </div>
                        </div>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: getSentimentColor(msg.sentiment),
                          marginLeft: '0.5rem',
                          marginTop: '0.25rem'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Sidebar */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                  ❓ Priority Questions
                </h3>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {questions
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                    .slice(0, 10)
                    .map((question) => (
                      <div
                        key={question.id}
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: 'white', fontSize: '0.9rem' }}>
                              {question.username}
                            </strong>
                            <div style={{ 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              fontSize: '0.9rem',
                              marginTop: '0.25rem'
                            }}>
                              {question.message}
                            </div>
                          </div>
                          <div style={{
                            background: getPriorityColor(question.priority),
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            marginLeft: '0.5rem'
                          }}>
                            {question.priority}/10
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

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
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Ready to Analyze Your Stream</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              Connect to any live Twitch channel to start getting real-time chat analysis, 
              question detection, and audience sentiment tracking.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '1rem' }}>
              Try channels like: shroud, pokimane, summit1g, or any active streamer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
