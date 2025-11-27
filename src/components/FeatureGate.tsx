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
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Blurred content - absolute positioning to fill container behind overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.4,
          zIndex: 0,
        }}
      >
        {children}
      </div>

      {/* Upgrade overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column', // Added flex-col
          alignItems: 'center', // Added items-center
          justifyContent: 'center', // Added justify-center
          height: '100%', // Added h-full
          width: '100%', // Added w-full
          background: 'rgba(11, 13, 20, 0.75)',
          backdropFilter: 'blur(3px)',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(105, 50, 255, 0.1), rgba(147, 47, 254, 0.05))',
            border: '1px solid rgba(105, 50, 255, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '90%',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '0.5rem',
              marginTop: 0,
            }}
          >
            {featureName}
          </h3>

          {featureDescription && (
            <p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1.25rem',
                lineHeight: '1.4',
                maxWidth: '280px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {featureDescription}
            </p>
          )}

          <Link
            href="/pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)', // Primary purple CTA
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 'bold', // Changed to bold
              fontSize: '1rem', // Slightly larger font
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(105, 50, 255, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)' // More pronounced lift
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(105, 50, 255, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(105, 50, 255, 0.4)'
            }}
          >
            <span>🔒</span>
            <span>Unlock VIP Tracking</span> {/* Changed text */}
          </Link>
        </div>
      </div>
    </div>
  )
}
