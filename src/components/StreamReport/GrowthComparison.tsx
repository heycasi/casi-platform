'use client'

import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'
import { casiColors, casiAnimations } from '@/lib/branding'

interface GrowthComparisonProps {
  comparison: {
    previousSession: {
      id: string
      date: string
      duration_minutes: number
    }
    comparison: {
      messages: { current: number; previous: number; change: number }
      viewers: { current: number; previous: number; change: number }
      positiveRate: { current: number; previous: number; change: number }
      questions: { current: number; previous: number; change: number }
    }
  }
}

export default function GrowthComparison({ comparison }: GrowthComparisonProps) {
  const metrics = [
    {
      label: 'Messages',
      icon: '💬',
      current: comparison.comparison.messages.current,
      previous: comparison.comparison.messages.previous,
      change: comparison.comparison.messages.change,
    },
    {
      label: 'Peak Viewers',
      icon: '👥',
      current: comparison.comparison.viewers.current,
      previous: comparison.comparison.viewers.previous,
      change: comparison.comparison.viewers.change,
    },
    {
      label: 'Positive Rate',
      icon: '✨',
      current: comparison.comparison.positiveRate.current,
      previous: comparison.comparison.positiveRate.previous,
      change: comparison.comparison.positiveRate.change,
      suffix: '%',
    },
    {
      label: 'Questions',
      icon: '❓',
      current: comparison.comparison.questions.current,
      previous: comparison.comparison.questions.previous,
      change: comparison.comparison.questions.change,
    },
  ]

  const getChangeColor = (change: number) => {
    if (change > 0) return casiColors.green
    if (change < 0) return '#ef4444'
    return casiColors.gray400
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈'
    if (change < 0) return '📉'
    return '➡️'
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        vs.{' '}
        {new Date(comparison.previousSession.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}{' '}
        stream
      </motion.div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.1,
              duration: casiAnimations.duration.normal,
            }}
            whileHover={{ scale: 1.03, x: 5 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Left: Icon + Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>{metric.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px',
                  }}
                >
                  {metric.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>
                  <AnimatedCounter value={metric.current} delay={index * 0.1 + 0.2} />
                  {metric.suffix || ''}
                </div>
              </div>
            </div>

            {/* Right: Change indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.4, type: 'spring', stiffness: 200 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '20px',
                background: `${getChangeColor(metric.change)}20`,
                border: `2px solid ${getChangeColor(metric.change)}40`,
              }}
            >
              <span style={{ fontSize: '20px' }}>{getChangeIcon(metric.change)}</span>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: getChangeColor(metric.change),
                }}
              >
                {metric.change > 0 ? '+' : ''}
                <AnimatedCounter value={metric.change} delay={index * 0.1 + 0.5} />%
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
