'use client'

import { motion } from 'framer-motion'
import { casiColors, casiShadows, casiAnimations } from '@/lib/branding'

interface StreamEvent {
  id: string
  event_type: 'subscription' | 'follow' | 'bits' | 'raid' | 'resub' | 'gift_sub'
  user_display_name: string
  event_data: any
  created_at: string
}

interface ActivityTimelineProps {
  events: StreamEvent[]
  maxItems?: number
}

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
      return casiColors.primary
    case 'gift_sub':
      return casiColors.pink
    case 'follow':
      return casiColors.green
    case 'bits':
      return casiColors.teal
    case 'raid':
      return casiColors.orange
    default:
      return casiColors.gray400
  }
}

const getEventTitle = (event: StreamEvent) => {
  switch (event.event_type) {
    case 'subscription':
      return `${event.user_display_name} subscribed!`
    case 'resub':
      return `${event.user_display_name} resubscribed!`
    case 'gift_sub':
      const count = event.event_data?.total || 1
      return `${event.user_display_name} gifted ${count} ${count > 1 ? 'subs' : 'sub'}!`
    case 'follow':
      return `${event.user_display_name} followed!`
    case 'bits':
      return `${event.user_display_name} cheered ${event.event_data?.bits || 0} bits!`
    case 'raid':
      return `${event.user_display_name} raided with ${event.event_data?.viewers || 0} viewers!`
    default:
      return `${event.user_display_name} - ${event.event_type}`
  }
}

export default function ActivityTimeline({ events, maxItems = 10 }: ActivityTimelineProps) {
  const displayEvents = events.slice(0, maxItems)

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '30px',
          bottom: '30px',
          width: '3px',
          background: `linear-gradient(to bottom, ${casiColors.primary}, ${casiColors.primaryLight})`,
          borderRadius: '10px',
          opacity: 0.3,
        }}
      />

      {/* Events */}
      {displayEvents.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.1,
            duration: casiAnimations.duration.normal,
            ease: casiAnimations.easing.easeOut,
          }}
          whileHover={{ x: 5 }}
          style={{
            position: 'relative',
            paddingLeft: '60px',
            paddingBottom: '24px',
            cursor: 'pointer',
          }}
        >
          {/* Icon circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: getEventColor(event.event_type),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: casiShadows.md,
              border: `3px solid ${casiColors.bgLight}`,
            }}
          >
            {getEventIcon(event.event_type)}
          </motion.div>

          {/* Event card */}
          <motion.div
            whileHover={{
              backgroundColor: casiColors.gray100,
              boxShadow: casiShadows.md,
            }}
            style={{
              background: casiColors.bgLight,
              padding: '16px 20px',
              borderRadius: '12px',
              border: `2px solid ${casiColors.gray200}`,
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: casiColors.gray800,
                marginBottom: '4px',
                fontSize: '15px',
              }}
            >
              {getEventTitle(event)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: casiColors.gray500,
              }}
            >
              {new Date(event.created_at).toLocaleTimeString()}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
