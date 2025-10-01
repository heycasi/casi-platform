'use client'

interface DotGridBackgroundProps {
  dotColor?: string
  dotSize?: number
  spacing?: number
}

export default function DotGridBackground({
  dotColor = 'rgba(147, 47, 254, 0.3)', // Casi purple
  dotSize = 1.5,
  spacing = 30
}: DotGridBackgroundProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: -1,
      background: `
        radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)
      `,
      backgroundSize: `${spacing}px ${spacing}px`,
      backgroundPosition: '0 0, ${spacing/2}px ${spacing/2}px',
      opacity: 0.6
    }} />
  )
}
