'use client'

import { motion } from 'framer-motion'
import { casiColors, casiShadows, casiAnimations } from '@/lib/branding'

interface ClipMoment {
  timestamp: string
  relativeTime: string
  minutesIn: number
  type: string
  icon: string
  title: string
  description: string
  intensity: number
  clipUrl: string
}

interface ClipMomentsProps {
  clips: ClipMoment[]
}

export default function ClipMoments({ clips }: ClipMomentsProps) {
  if (!clips || clips.length === 0) return null

  return (
    <div>
      {clips.map((clip, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.1,
            duration: casiAnimations.duration.normal,
          }}
          whileHover={{ x: 5, scale: 1.02 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '16px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Intensity bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clip.intensity * 100}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              background: `linear-gradient(90deg, ${casiColors.primary}20, transparent)`,
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
                delay: index * 0.5,
              }}
              style={{
                fontSize: '48px',
                flexShrink: 0,
              }}
            >
              {clip.icon}
            </motion.div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  style={{
                    background: casiColors.primary,
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {clip.relativeTime}
                </motion.div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {clip.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '12px',
                }}
              >
                {clip.description}
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={clip.clipUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: casiColors.gradient,
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: casiShadows.md,
                }}
              >
                🎬 Create Clip on Twitch
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
