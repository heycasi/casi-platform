'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { casiAnimations } from '@/lib/branding'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  decimals?: number
  delay?: number
}

export default function AnimatedCounter({
  value,
  duration = 2,
  className = '',
  decimals = 0,
  delay = 0,
}: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(count, value, {
        duration,
        ease: casiAnimations.easing.easeOut,
      })
      return () => controls.stop()
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, duration, count, delay])

  return <motion.span className={className}>{rounded}</motion.span>
}
