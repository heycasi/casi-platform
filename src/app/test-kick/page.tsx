'use client'
import { useState, useEffect } from 'react'
import { KickChatClient, KickMessage } from '@/lib/chat/kick'

export default function TestKickPage() {
  const [channelName, setChannelName] = useState('trainwreckstv') // Popular Kick streamer
  const [messages, setMessages] = useState<KickMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [client, setClient] = useState<KickChatClient | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    try {
      setError(null)
      console.log(`Connecting to Kick channel: ${channelName}`)

      const kickClient = new KickChatClient(channelName)

      kickClient.onMessage((message: KickMessage) => {
        setMessages(prev => [...prev.slice(-49), message])
      })

      await kickClient.connect()

      setClient(kickClient)
      setIsConnected(true)

    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect')
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    if (client) {
      client.disconnect()
      setClient(null)
      setIsConnected(false)
      setMessages([])
    }
  }

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      color: 'white',
      fontFamily: 'Poppins, Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #53FC18, #7FFF3F)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🟢 Kick Chat Test
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          Test Kick WebSocket connection and see chat messages in real-time
        </p>

        {/* Connection Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(83, 252, 24, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              disabled={isConnected}
              placeholder="Kick channel name"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(83, 252, 24, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />

            <button
              onClick={isConnected ? disconnect : connect}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                background: isConnected
                  ? 'linear-gradient(135deg, rgba(255, 100, 100, 0.3), rgba(255, 50, 50, 0.3))'
                  : 'linear-gradient(135deg, #53FC18, #7FFF3F)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isConnected ? '🔴 Disconnect' : '🟢 Connect'}
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              padding: '1rem',
              borderRadius: '8px',
              color: '#FF6464'
            }}>
              ❌ {error}
            </div>
          )}

          {isConnected && (
            <div style={{
              background: 'rgba(83, 252, 24, 0.1)',
              border: '1px solid rgba(83, 252, 24, 0.3)',
              padding: '1rem',
              borderRadius: '8px',
              color: '#53FC18'
            }}>
              ✅ Connected to {channelName}'s chat
            </div>
          )}
        </div>

        {/* Stats */}
        {isConnected && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(83, 252, 24, 0.1)',
              border: '1px solid rgba(83, 252, 24, 0.3)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#53FC18' }}>
                {messages.length}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Messages Captured
              </div>
            </div>

            <div style={{
              background: 'rgba(83, 252, 24, 0.1)',
              border: '1px solid rgba(83, 252, 24, 0.3)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#53FC18' }}>
                {new Set(messages.map(m => m.username)).size}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Unique Chatters
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(83, 252, 24, 0.2)',
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            color: '#53FC18'
          }}>
            💬 Live Chat
          </h2>

          {messages.length === 0 && isConnected && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '2rem' }}>
              Waiting for messages...
            </div>
          )}

          {messages.length === 0 && !isConnected && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '2rem' }}>
              Connect to a Kick channel to see messages
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((msg, index) => (
              <div
                key={`${msg.id}-${index}`}
                style={{
                  background: 'rgba(83, 252, 24, 0.05)',
                  border: '1px solid rgba(83, 252, 24, 0.2)',
                  borderLeft: '4px solid #53FC18',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🟢</span>
                  <strong style={{ color: '#53FC18' }}>@{msg.username}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', color: 'white', marginLeft: '2rem' }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#53FC18' }}>📝 How to Test:</h3>
          <ol style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
            <li>Enter a Kick channel name (try: trainwreckstv, adin, xqc)</li>
            <li>Click "🟢 Connect"</li>
            <li>Watch messages appear in real-time</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
