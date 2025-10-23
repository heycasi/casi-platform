'use client'

import { useState, useEffect } from 'react'

interface StreamEvent {
  id: string
  event_type: 'subscription' | 'follow' | 'bits' | 'raid' | 'resub' | 'gift_sub'
  user_name: string
  user_display_name: string
  event_data: any
  created_at: string
  event_timestamp: string
}

interface ActivityFeedProps {
  channelName: string
  maxHeight?: string
}

export default function ActivityFeed({ channelName, maxHeight = '500px' }: ActivityFeedProps) {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!channelName) return

    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/stream-events?channel=${encodeURIComponent(channelName)}&limit=50`)
        const data = await response.json()

        if (data.events) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to fetch stream events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()

    // Poll for new events every 10 seconds
    const interval = setInterval(fetchEvents, 10000)
    return () => clearInterval(interval)
  }, [channelName])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'subscription':
      case 'resub':
        return '⭐'
      case 'gift_sub':
        return '🎁'
      case 'follow':
        return '❤️'
      case 'bits':
        return '💎'
      case 'raid':
        return '⚔️'
      default:
        return '📢'
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'subscription':
      case 'resub':
      case 'gift_sub':
        return '#B8EE8A' // Green for subs
      case 'follow':
        return '#FF9F9F' // Pink for follows
      case 'bits':
        return '#9932FF' // Purple for bits
      case 'raid':
        return '#FFD700' // Gold for raids
      default:
        return '#5EEAD4' // Teal default
    }
  }

  const formatEventMessage = (event: StreamEvent) => {
    const name = event.user_display_name || event.user_name

    switch (event.event_type) {
      case 'subscription':
        return `${name} subscribed (Tier ${parseInt(event.event_data?.tier || '1000') / 1000})`
      case 'resub':
        const months = event.event_data?.cumulative_months || 0
        return `${name} resubscribed for ${months} months!`
      case 'gift_sub':
        return `${name} gifted a subscription!`
      case 'follow':
        return `${name} followed the channel`
      case 'bits':
        return `${name} cheered ${event.event_data?.amount || 0} bits`
      case 'raid':
        return `${name} raided with ${event.event_data?.viewer_count || 0} viewers!`
      default:
        return `${name} triggered an event`
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime()
    const eventTime = new Date(timestamp).getTime()
    const diff = now - eventTime

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: maxHeight,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📊 Activity Feed
        {events.length > 0 && (
          <span style={{
            background: '#5EEAD4',
            color: '#151E3C',
            padding: '0.2rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: '600'
          }}>
            {events.length}
          </span>
        )}
      </h3>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '0.75rem',
        minHeight: 0
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
            <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>No events yet</p>
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>Events will appear here when viewers interact!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${getEventColor(event.event_type)}40`,
                  borderLeft: `4px solid ${getEventColor(event.event_type)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {getEventIcon(event.event_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#F7F7F7',
                    fontWeight: '500',
                    lineHeight: '1.3'
                  }}>
                    {formatEventMessage(event)}
                  </p>
                  {event.event_data?.message && (
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontStyle: 'italic',
                      lineHeight: '1.2'
                    }}>
                      "{event.event_data.message}"
                    </p>
                  )}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}>
                  {getTimeAgo(event.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
