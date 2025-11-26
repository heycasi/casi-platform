'use client'
import Link from 'next/link'

export default function HistoryLimitBanner() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(105, 50, 255, 0.15), rgba(147, 47, 254, 0.1))',
        border: '1px solid rgba(105, 50, 255, 0.3)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⏰</span>
          <h4
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '700',
              color: 'white',
            }}
          >
            Starter Plan: 24-Hour History Limit
          </h4>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.4',
          }}
        >
          Upgrade to <strong style={{ color: '#a78bfa' }}>Pro</strong> to save unlimited chat
          history and never lose your stream insights.
        </p>
      </div>

      <Link
        href="/pricing"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #6932FF, #932FFE)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '0.9rem',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Upgrade to Pro
      </Link>
    </div>
  )
}
