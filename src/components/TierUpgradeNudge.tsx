'use client'
import { useState } from 'react'

interface TierUpgradeNudgeProps {
  currentTier: string
  avgViewers: number
  viewerLimit: number
  daysOverLimit: number
  percentOver: number
}

export default function TierUpgradeNudge({
  currentTier,
  avgViewers,
  viewerLimit,
  daysOverLimit,
  percentOver
}: TierUpgradeNudgeProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || avgViewers <= viewerLimit) return null

  const suggestedTier = currentTier === 'Creator' ? 'Pro' : 'Streamer+'

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15))',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '2px solid rgba(255, 215, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
      position: 'relative',
      animation: 'slideIn 0.5s ease-out'
    }}>
      <div style={{ fontSize: '3rem' }}>🎉</div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.2rem',
          color: '#FFD700',
          fontWeight: '700'
        }}>
          Your stream is growing!
        </h3>
        <p style={{ margin: '0 0 0.75rem 0', color: '#F7F7F7', fontSize: '0.9rem' }}>
          You're averaging <strong>{avgViewers} viewers</strong> — that's {percentOver}% over your {currentTier} tier limit of {viewerLimit}.
        </p>
        <p style={{ margin: '0 0 1rem 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
          Upgrade to <strong>{suggestedTier}</strong> to unlock advanced analytics, priority support, and features built for your audience size!
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="/account#upgrade"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '8px',
              color: '#000',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'inline-block',
              transition: 'transform 0.2s ease',
              fontFamily: 'Poppins, Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Upgrade to {suggestedTier}
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              fontFamily: 'Poppins, Arial, sans-serif',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            Maybe Later
          </button>
        </div>

        {daysOverLimit > 0 && (
          <p style={{
            margin: '0.75rem 0 0 0',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            You've been over your limit for {daysOverLimit} day{daysOverLimit !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
