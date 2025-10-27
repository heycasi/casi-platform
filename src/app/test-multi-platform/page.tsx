'use client'
import { useState, useEffect, useRef } from 'react'
import { createChatClient } from '@/lib/chat/factory'
import type { IChatClient, UnifiedChatMessage } from '@/types/chat'

export default function TestMultiPlatform() {
  const [twitchChannel, setTwitchChannel] = useState('xqc')
  const [kickChannel, setKickChannel] = useState('trainwreckstv')
  const [twitchConnected, setTwitchConnected] = useState(false)
  const [kickConnected, setKickConnected] = useState(false)
  const [messages, setMessages] = useState<UnifiedChatMessage[]>([])
  const [stats, setStats] = useState({
    totalMessages: 0,
    twitchMessages: 0,
    kickMessages: 0,
    uniqueChatters: 0,
    avgSentiment: 0,
  })

  const chatFeedRef = useRef<HTMLDivElement>(null)
  const twitchClientRef = useRef<IChatClient | null>(null)
  const kickClientRef = useRef<IChatClient | null>(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight
    }
  }, [messages])

  // Update stats when messages change
  useEffect(() => {
    const twitchCount = messages.filter((m) => m.platform === 'twitch').length
    const kickCount = messages.filter((m) => m.platform === 'kick').length
    const uniqueChatters = new Set(messages.map((m) => m.username)).size
    const avgSentiment =
      messages.length > 0
        ? messages.reduce((sum, m) => sum + m.sentiment_score, 0) / messages.length
        : 0

    setStats({
      totalMessages: messages.length,
      twitchMessages: twitchCount,
      kickMessages: kickCount,
      uniqueChatters,
      avgSentiment: Math.round(avgSentiment * 100) / 100,
    })
  }, [messages])

  const connectTwitch = async () => {
    if (!twitchChannel.trim()) return

    try {
      console.log(`🟣 Connecting to Twitch: ${twitchChannel}`)

      const client = createChatClient('twitch', twitchChannel)
      twitchClientRef.current = client

      client.onMessage((message) => {
        console.log('🟣 [Twitch Message]:', message)
        setMessages((prev) =>
          [...prev.slice(-99), message].sort((a, b) => a.timestamp - b.timestamp)
        )
      })

      client.onError((error) => {
        console.error('🔴 [Twitch Error]:', error)
      })

      client.onConnectionChange?.((connected) => {
        console.log('🟣 [Twitch] Connection status:', connected)
        setTwitchConnected(connected)
      })

      await client.connect()
      console.log('🟣 Twitch connected successfully')
      setTwitchConnected(true)
    } catch (error) {
      console.error('🔴 Failed to connect to Twitch:', error)
      alert(
        `Failed to connect to Twitch: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const connectKick = async () => {
    if (!kickChannel.trim()) return

    try {
      console.log(`🟢 Connecting to Kick: ${kickChannel}`)

      const client = createChatClient('kick', kickChannel)
      kickClientRef.current = client

      client.onMessage((message) => {
        console.log('🟢 [Kick Message]:', message)
        setMessages((prev) =>
          [...prev.slice(-99), message].sort((a, b) => a.timestamp - b.timestamp)
        )
      })

      client.onError((error) => {
        console.error('🔴 [Kick Error]:', error)
      })

      client.onConnectionChange?.((connected) => {
        console.log('🟢 [Kick] Connection status:', connected)
        setKickConnected(connected)
      })

      await client.connect()
      console.log('🟢 Kick connected successfully')
      setKickConnected(true)
    } catch (error) {
      console.error('🔴 Failed to connect to Kick:', error)
      alert(
        `Failed to connect to Kick: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const disconnectAll = () => {
    if (twitchClientRef.current) {
      twitchClientRef.current.disconnect()
      twitchClientRef.current = null
      setTwitchConnected(false)
    }
    if (kickClientRef.current) {
      kickClientRef.current.disconnect()
      kickClientRef.current = null
      setKickConnected(false)
    }
    setMessages([])
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #6441A5, #53FC18)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Multi-Platform Chat Test
          </h1>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Test Twitch 🟣 and Kick 🟢 chat connections simultaneously
          </p>
        </div>

        {/* Connection Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Twitch Controls */}
          <div
            style={{
              background: 'rgba(100, 65, 165, 0.1)',
              border: '2px solid rgba(100, 65, 165, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🟣 Twitch
              {twitchConnected && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: '#53FC18',
                    color: '#000',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  LIVE
                </span>
              )}
            </h3>
            <input
              type="text"
              value={twitchChannel}
              onChange={(e) => setTwitchChannel(e.target.value)}
              placeholder="Channel name"
              disabled={twitchConnected}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(100, 65, 165, 0.5)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                marginBottom: '0.75rem',
                fontFamily: 'Poppins, Arial, sans-serif',
              }}
            />
            <button
              onClick={twitchConnected ? disconnectAll : connectTwitch}
              disabled={!twitchChannel.trim()}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: twitchConnected ? '#FF4444' : '#6441A5',
                color: 'white',
                fontWeight: '600',
                cursor: twitchChannel.trim() ? 'pointer' : 'not-allowed',
                opacity: twitchChannel.trim() ? 1 : 0.5,
              }}
            >
              {twitchConnected ? 'Disconnect' : 'Connect to Twitch'}
            </button>
          </div>

          {/* Kick Controls */}
          <div
            style={{
              background: 'rgba(83, 252, 24, 0.1)',
              border: '2px solid rgba(83, 252, 24, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🟢 Kick
              {kickConnected && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: '#53FC18',
                    color: '#000',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}
                >
                  LIVE
                </span>
              )}
            </h3>
            <input
              type="text"
              value={kickChannel}
              onChange={(e) => setKickChannel(e.target.value)}
              placeholder="Channel name"
              disabled={kickConnected}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(83, 252, 24, 0.5)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                marginBottom: '0.75rem',
                fontFamily: 'Poppins, Arial, sans-serif',
              }}
            />
            <button
              onClick={kickConnected ? disconnectAll : connectKick}
              disabled={!kickChannel.trim()}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: kickConnected ? '#FF4444' : '#53FC18',
                color: '#000',
                fontWeight: '600',
                cursor: kickChannel.trim() ? 'pointer' : 'not-allowed',
                opacity: kickChannel.trim() ? 1 : 0.5,
              }}
            >
              {kickConnected ? 'Disconnect' : 'Connect to Kick'}
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.totalMessages}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Total Messages
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem',
                color: '#6441A5',
              }}
            >
              {stats.twitchMessages}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>🟣 Twitch</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem',
                color: '#53FC18',
              }}
            >
              {stats.kickMessages}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>🟢 Kick</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.uniqueChatters}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Unique Chatters
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.avgSentiment.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Avg Sentiment
            </div>
          </div>
        </div>

        {/* Live Chat Feed - EXACT DASHBOARD STYLING */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
            💬 Live Chat Feed (Multi-Platform)
          </h3>

          <div
            ref={chatFeedRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              minHeight: 0,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💭</div>
                  <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                    Chat's quiet for now... 🤔
                  </p>
                  <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
                    Connect to Twitch or Kick to see messages!
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {messages
                  .slice(-50)
                  .reverse()
                  .map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        padding: '0.5rem',
                        background: msg.is_question
                          ? 'rgba(255, 159, 159, 0.2)'
                          : msg.sentiment === 'positive'
                            ? 'rgba(184, 238, 138, 0.1)'
                            : msg.sentiment === 'negative'
                              ? 'rgba(255, 159, 159, 0.1)'
                              : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${msg.platform === 'twitch' ? '#6441A5' : '#53FC18'}`, // PLATFORM COLOR!
                        border: msg.is_question
                          ? '1px solid rgba(255, 159, 159, 0.3)'
                          : msg.sentiment === 'positive'
                            ? '1px solid rgba(184, 238, 138, 0.2)'
                            : msg.sentiment === 'negative'
                              ? '1px solid rgba(255, 159, 159, 0.2)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                        borderLeftWidth: '4px', // Thick platform border
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginBottom: '0.25rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Platform Icon */}
                        <span style={{ fontSize: '0.9rem' }}>
                          {msg.platform === 'twitch' ? '🟣' : '🟢'}
                        </span>

                        <span
                          style={{
                            fontWeight: '600',
                            color: msg.is_question ? '#F7F7F7' : '#E5E7EB',
                            fontSize: '0.8rem',
                          }}
                        >
                          {msg.username}
                        </span>

                        {msg.is_question && (
                          <span
                            style={{
                              fontSize: '0.6rem',
                              background: '#FF9F9F',
                              padding: '0.1rem 0.25rem',
                              borderRadius: '3px',
                              color: '#151E3C',
                              fontWeight: '600',
                            }}
                          >
                            Q
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: '0.6rem',
                            padding: '0.1rem 0.25rem',
                            borderRadius: '3px',
                            background:
                              msg.sentiment === 'positive'
                                ? '#B8EE8A'
                                : msg.sentiment === 'negative'
                                  ? '#FF9F9F'
                                  : 'rgba(107, 114, 128, 0.8)',
                          }}
                        >
                          {msg.sentiment === 'positive'
                            ? '😊'
                            : msg.sentiment === 'negative'
                              ? '😢'
                              : '😐'}
                        </span>

                        {msg.engagement_level === 'high' && (
                          <span
                            style={{
                              fontSize: '0.6rem',
                              background: '#FFD700',
                              padding: '0.1rem 0.25rem',
                              borderRadius: '3px',
                              color: '#000',
                              fontWeight: '600',
                            }}
                          >
                            🔥
                          </span>
                        )}

                        {/* Platform Badge */}
                        <span
                          style={{
                            fontSize: '0.6rem',
                            background: msg.platform === 'twitch' ? '#6441A5' : '#53FC18',
                            color: msg.platform === 'twitch' ? 'white' : '#000',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}
                        >
                          {msg.platform}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: msg.is_question ? '#F7F7F7' : '#F3F4F6',
                          lineHeight: '1.3',
                          fontSize: '0.8rem',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.message}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
