'use client'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  animate?: boolean
}

export default function GradientText({ children, className = '', style = {}, animate = true }: GradientTextProps) {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(120deg, #6932FF 0%, #932FFE 25%, #5EEAD4 50%, #FF9F9F 75%, #6932FF 100%)',
        backgroundSize: animate ? '200% auto' : '100% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: animate ? 'gradientFlow 8s ease infinite' : 'none',
        display: 'inline-block',
        ...style
      }}
    >
      {children}
      <style jsx>{`
        @keyframes gradientFlow {
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
