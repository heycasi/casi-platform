'use client'

import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'
import { casiColors } from '@/lib/branding'

interface StreamRatingProps {
  rating: {
    grade: string
    percentage: number
    score: number
    maxScore: number
    color: string
    emoji: string
    breakdown: Record<string, string>
  }
}

export default function StreamRatingCard({ rating }: StreamRatingProps) {
  // Calculate metrics for the new design
  const metrics = Object.entries(rating.breakdown).map(([category, scoreStr]) => {
    const score = parseInt(scoreStr.replace('%', ''))
    return { category, score, scoreStr }
  })

  // Count milestones (>=75% is a milestone achieved)
  const milestonesUnlocked = metrics.filter((m) => m.score >= 75).length
  const totalMilestones = metrics.length

  // Get top 2-3 performers for highlights
  const highlights = [...metrics].sort((a, b) => b.score - a.score).slice(0, 3)

  // Get growth opportunities (lowest 1-2 that aren't already maxed)
  const growthOpportunities = [...metrics]
    .filter((m) => m.score < 100)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)

  // Icon mapping for categories
  const categoryIcons: Record<string, string> = {
    duration: '⏱️',
    engagement: '💬',
    positivity: '✨',
    events: '🎉',
    viewers: '👥',
  }

  // Positive color scheme
  const mainColor = casiColors.primary
  const accentColor = casiColors.green

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `2px solid rgba(255, 255, 255, 0.15)`,
        borderRadius: '24px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '30px' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>
            📊 Stream Performance Stats
          </h3>
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Your stream by the numbers
          </div>
        </motion.div>

        {/* Milestones Unlocked */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${mainColor}20)`,
            border: `2px solid ${accentColor}40`,
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '5px' }}>
            <AnimatedCounter value={milestonesUnlocked} delay={0.3} /> / {totalMilestones}{' '}
            Performance Milestones
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {milestonesUnlocked === totalMilestones ? 'Perfect score!' : 'Keep up the great work!'}
          </div>
        </motion.div>

        {/* Stream Highlights */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '30px' }}
          >
            <h4 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '15px' }}>
              🌟 Stream Highlights
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {highlights.map((metric, index) => (
                <motion.div
                  key={metric.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}
                >
                  <div style={{ fontSize: '32px' }}>{categoryIcons[metric.category] || '📈'}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {metric.category}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>
                      {metric.scoreStr}
                    </div>
                  </div>
                  {index === 0 && <div style={{ fontSize: '24px' }}>👑</div>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Performance Breakdown with Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '30px' }}
        >
          <h4 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '15px' }}>
            📈 Full Performance Breakdown
          </h4>
          <div style={{ display: 'grid', gap: '15px' }}>
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{categoryIcons[metric.category] || '📊'}</span>
                    {metric.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                    {metric.scoreStr}
                  </div>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background:
                        metric.score >= 75
                          ? `linear-gradient(90deg, ${accentColor}, ${mainColor})`
                          : `linear-gradient(90deg, ${casiColors.blue}, ${mainColor})`,
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Level / Growth Opportunities */}
        {growthOpportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              background: `linear-gradient(135deg, ${casiColors.blue}15, ${mainColor}15)`,
              border: `2px solid ${casiColors.blue}30`,
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <h4
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'white',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🚀 Level Up Opportunities
            </h4>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {growthOpportunities.map((metric, index) => (
                <div key={metric.category} style={{ marginTop: index > 0 ? '8px' : 0 }}>
                  • <span style={{ textTransform: 'capitalize' }}>{metric.category}</span>: Try to
                  reach {Math.min(100, metric.score + 20)}% next stream!
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
