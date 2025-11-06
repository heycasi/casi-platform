'use client'

import { motion } from 'framer-motion'
import { casiColors, casiAnimations } from '@/lib/branding'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementBadgeProps {
  achievement: Achievement
  index: number
}

const rarityColors = {
  common: casiColors.gray400,
  rare: casiColors.blue,
  epic: casiColors.primary,
  legendary: casiColors.orange,
}

const rarityGlow = {
  common: 'none',
  rare: `0 0 20px ${casiColors.blue}40`,
  epic: `0 0 25px ${casiColors.primary}60`,
  legendary: `0 0 30px ${casiColors.orange}80`,
}

export default function AchievementBadge({ achievement, index }: AchievementBadgeProps) {
  const { title, description, icon, unlocked, rarity = 'common' } = achievement

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        delay: index * 0.1,
        duration: casiAnimations.duration.slow,
        ease: casiAnimations.easing.bounce,
      }}
      whileHover={{
        scale: unlocked ? 1.05 : 1.02,
        y: -5,
      }}
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${rarityColors[rarity]}20, ${rarityColors[rarity]}10)`
          : casiColors.gray100,
        padding: '20px',
        borderRadius: '16px',
        border: `2px solid ${unlocked ? rarityColors[rarity] : casiColors.gray300}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        opacity: unlocked ? 1 : 0.5,
        boxShadow: unlocked ? rarityGlow[rarity] : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Shine effect on unlocked badges */}
      {unlocked && (
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Icon */}
      <motion.div
        animate={
          unlocked
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4,
        }}
        style={{
          fontSize: '48px',
          textAlign: 'center',
          marginBottom: '12px',
          filter: unlocked ? 'none' : 'grayscale(100%)',
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <div
        style={{
          fontWeight: 700,
          fontSize: '16px',
          color: unlocked ? 'white' : 'rgba(255, 255, 255, 0.4)',
          marginBottom: '6px',
          textAlign: 'center',
          textShadow: unlocked ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '13px',
          color: unlocked ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          lineHeight: 1.4,
          textShadow: unlocked ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
        }}
      >
        {description}
      </div>

      {/* Rarity badge */}
      {unlocked && rarity !== 'common' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: rarityColors[rarity],
            color: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {rarity}
        </motion.div>
      )}

      {/* Lock icon for locked achievements */}
      {!unlocked && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            fontSize: '20px',
            opacity: 0.3,
          }}
        >
          🔒
        </div>
      )}
    </motion.div>
  )
}
