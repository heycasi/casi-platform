'use client'
import Image from 'next/image'

interface QuestionQueueMockProps {
  variant?: 'questions' | 'chat'
}

export default function QuestionQueueMock({ variant = 'questions' }: QuestionQueueMockProps) {
  const getImageSrc = () => {
    switch (variant) {
      case 'chat':
        return '/live chat feed.png'
      case 'questions':
      default:
        return '/missedquestions-topchatters.png'
    }
  }

  const getAltText = () => {
    switch (variant) {
      case 'chat':
        return 'Live chat feed showing real-time message analysis'
      case 'questions':
      default:
        return 'Question queue showing missed questions and top chatters with anonymized usernames'
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
            height={600}
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