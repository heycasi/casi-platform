'use client'
import Image from 'next/image'

interface DashboardMockProps {
  variant?: 'sentiment' | 'full' | 'stream'
}

export default function DashboardMock({ variant = 'sentiment' }: DashboardMockProps) {
  const getImageSrc = () => {
    switch (variant) {
      case 'full':
        return '/whole-dashboard.png'
      case 'stream':
        return '/stream-preview.png'
      case 'sentiment':
      default:
        return '/sentiment-analysis.png'
    }
  }

  const getAltText = () => {
    switch (variant) {
      case 'full':
        return 'Complete Casi dashboard showing all analytics features'
      case 'stream':
        return 'Stream preview showing live chat analysis'
      case 'sentiment':
      default:
        return 'Real-time sentiment analysis dashboard with anonymized data'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="relative">
        <div style={{ position: 'relative' }}>
          <Image
            src={getImageSrc()}
            alt={getAltText()}
            width={800}
            height={500}
            className="w-full h-auto"
            priority
            style={{ filter: 'none' }}
          />
          {/* Professional overlay for privacy */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.03) 0%, rgba(236,72,153,0.03) 100%)',
            pointerEvents: 'none'
          }}></div>
          {/* Privacy notice */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            🔒 Anonymized Data Preview
          </div>
        </div>
        {/* Overlay to indicate this is a preview */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          <span style={{
            background: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px'
          }}>
            Preview
          </span>
        </div>
      </div>
    </div>
  )
}