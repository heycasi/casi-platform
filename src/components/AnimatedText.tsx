'use client'

import { useEffect, useState } from 'react'

interface AnimatedTextProps {
  text: string
  delay?: number
  className?: string
  style?: React.CSSProperties
}

export function FadeInText({ text, delay = 0, className = '', style = {} }: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {text}
    </div>
  )
}

export function ShinyText({ text, className = '', style = {} }: Omit<AnimatedTextProps, 'delay'>) {
  return (
    <span
      className={className}
      style={{
        ...style,
        background: 'linear-gradient(120deg, #5EEAD4 0%, #FF9F9F 50%, #932FFE 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer 3s ease-in-out infinite'
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </span>
  )
}

export function SplitText({ text, delay = 0, style = {} }: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false)
  const words = text.split(' ')

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s ease-out ${i * 0.1}s, transform 0.5s ease-out ${i * 0.1}s`
          }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}
