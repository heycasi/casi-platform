'use client'
import { ReactNode } from 'react'
import Link from 'next/link'

type TierName = 'Starter' | 'Pro' | 'Agency'

interface FeatureGateProps {
  children: ReactNode
  requiredTier: TierName
  currentTier: TierName
  featureName: string
  featureDescription?: string
}

const TIER_HIERARCHY: Record<TierName, number> = {
  Starter: 0,
  Pro: 1,
  Agency: 2,
}

export default function FeatureGate({
  children,
  requiredTier,
  currentTier,
  featureName,
  featureDescription,
}: FeatureGateProps) {
  const hasAccess = TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  // Locked state
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Blurred content */}
      <div
        style={{
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.4,
        }}
      >
        {children}
      </div>

      {/* Upgrade overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(11, 13, 20, 0.85)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(105, 50, 255, 0.2), rgba(147, 47, 254, 0.15))',
            border: '2px solid rgba(105, 50, 255, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            🔒
          </div>

          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '0.5rem',
            }}
          >
            {featureName}
          </h3>

          {featureDescription && (
            <p
              style={{
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              {featureDescription}
            </p>
          )}

          <div
            style={{
              display: 'inline-block',
              background: 'rgba(105, 50, 255, 0.15)',
              border: '1px solid rgba(105, 50, 255, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#a78bfa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Requires {requiredTier} Plan
            </span>
          </div>

          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              padding: '0.875rem 2rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(105, 50, 255, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(105, 50, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(105, 50, 255, 0.4)'
            }}
          >
            Upgrade to {requiredTier}
          </Link>

          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Unlock this feature and more
          </p>
        </div>
      </div>
    </div>
  )
}
