'use client'

import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'
import { casiColors, casiShadows, casiAnimations } from '@/lib/branding'

interface StatCardProps {
  value: number
  label: string
  icon: string
  color?: string
  delay?: number
  suffix?: string
  prefix?: string
  decimals?: number
}

export default function StatCard({
  value,
  label,
  icon,
  color = casiColors.primary,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: casiAnimations.duration.normal,
        delay,
        ease: casiAnimations.easing.easeOut,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: casiShadows.glow,
      }}
      style={{
        background: casiColors.gray50,
        padding: '28px',
        borderRadius: '16px',
        border: `2px solid ${casiColors.gray200}`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.05 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: casiColors.gradient,
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
        style={{
          fontSize: '32px',
          marginBottom: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {icon}
      </motion.div>

      {/* Animated Value */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontSize: '42px',
            fontWeight: 800,
            color,
            marginBottom: '8px',
            fontFamily: casiColors.primary,
            lineHeight: 1,
          }}
        >
          {prefix}
          <AnimatedCounter value={value} delay={delay + 0.2} decimals={decimals} />
          {suffix}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: '13px',
            color: casiColors.gray500,
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  )
}
