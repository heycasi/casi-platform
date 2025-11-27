'use client'
import { useEffect, useState } from 'react'
import FeatureGate from './FeatureGate'

type TierName = 'Starter' | 'Pro' | 'Agency'

interface StreamSummaryProps {
  sessionId: string
  sessionData: {
    channel_name: string
    session_start: string
    session_end: string
    duration_minutes: number
    total_messages: number
    peak_viewer_count: number
    avg_viewer_count?: number
    stream_title?: string
    stream_category?: string
  }
  userTier: TierName
  onClose: () => void
}

interface SessionAnalytics {
  avgSentiment: number
  positiveMessages: number
  negativeMessages: number
  neutralMessages: number
  questionsCount: number
  languagesDetected: Record<string, number>
  topicsDiscussed: Record<string, number>
}

export default function StreamSummary({
  sessionId,
  sessionData,
  userTier,
  onClose,
}: StreamSummaryProps) {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch session analytics
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/report/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.analytics)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [sessionId])

  // Calculate sentiment emoji
  const getSentimentEmoji = (avgSentiment: number) => {
    if (avgSentiment >= 0.3) return { emoji: '🔥', label: 'Fire', color: '#FF6B6B' }
    if (avgSentiment >= -0.1) return { emoji: '😐', label: 'Neutral', color: '#FFD93D' }
    return { emoji: '💀', label: 'Rough', color: '#6C5CE7' }
  }

  const sentiment = analytics ? getSentimentEmoji(analytics.avgSentiment) : null

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(26, 28, 44, 0.95), rgba(15, 16, 28, 0.98))',
          border: '1px solid rgba(105, 50, 255, 0.3)',
          borderRadius: '24px',
          maxWidth: '900px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(105, 50, 255, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #B8EE8A, #6932FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Stream Summary
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1rem',
            }}
          >
            {sessionData.stream_title || sessionData.channel_name}
          </p>
          {sessionData.stream_category && (
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.9rem',
                marginTop: '0.25rem',
              }}
            >
              {sessionData.stream_category}
            </p>
          )}
        </div>

        {/* Core Metrics - Always Visible */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Duration */}
          <div
            style={{
              background: 'rgba(184, 238, 138, 0.1)',
              border: '1px solid rgba(184, 238, 138, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#B8EE8A',
                marginBottom: '0.5rem',
              }}
            >
              {formatDuration(sessionData.duration_minutes)}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Stream Duration
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              background: 'rgba(105, 50, 255, 0.1)',
              border: '1px solid rgba(105, 50, 255, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#B8A0FF',
                marginBottom: '0.5rem',
              }}
            >
              {sessionData.total_messages.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Total Messages
            </div>
          </div>

          {/* Peak Viewers */}
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#FFD700',
                marginBottom: '0.5rem',
              }}
            >
              {sessionData.peak_viewer_count}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Peak Viewers
            </div>
          </div>

          {/* Sentiment */}
          {sentiment && !loading && (
            <div
              style={{
                background: `rgba(${sentiment.color === '#FF6B6B' ? '255, 107, 107' : sentiment.color === '#FFD93D' ? '255, 217, 61' : '108, 92, 231'}, 0.1)`,
                border: `1px solid ${sentiment.color}50`,
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                {sentiment.emoji}
              </div>
              <div
                style={{
                  color: sentiment.color,
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem',
                }}
              >
                {sentiment.label}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Chat Vibe</div>
            </div>
          )}
        </div>

        {/* Pro Features - Gated */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Community VIPs - LOCKED */}
          <FeatureGate
            currentTier={userTier}
            requiredTier="Pro"
            featureName="Community VIPs"
            featureDescription="See your top 5 most engaged chatters and identify potential whales"
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                minHeight: '250px',
              }}
            >
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>👑</span>
                <span>Community VIPs</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'rgba(105, 50, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: '600',
                          color: 'white',
                          fontSize: '1rem',
                        }}
                      >
                        User{i}_VIP
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {Math.floor(Math.random() * 50 + 20)} messages
                      </div>
                    </div>
                    {i <= 2 && (
                      <span
                        style={{
                          background: '#FFD700',
                          color: '#000',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                        }}
                      >
                        🐋 WHALE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FeatureGate>

          {/* Sentiment Graph - LOCKED */}
          <FeatureGate
            currentTier={userTier}
            requiredTier="Pro"
            featureName="Sentiment Timeline"
            featureDescription="See how chat sentiment evolved throughout your stream"
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                minHeight: '250px',
              }}
            >
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>📈</span>
                <span>Sentiment Timeline</span>
              </h3>
              {/* Fake graph */}
              <div
                style={{
                  height: '150px',
                  background:
                    'linear-gradient(180deg, rgba(184, 238, 138, 0.3) 0%, rgba(105, 50, 255, 0.3) 100%)',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <svg
                  style={{ width: '100%', height: '100%' }}
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,40 20,35 40,25 60,30 80,20 100,25"
                    fill="none"
                    stroke="#B8EE8A"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </FeatureGate>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(105, 50, 255, 0.4)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start New Session
          </button>

          <a
            href={`/analytics?session=${sessionId}`}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            View Full Analytics
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(105, 50, 255, 0.3)',
                borderTopColor: '#6932FF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
            <p style={{ marginTop: '1rem' }}>Loading analytics...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
