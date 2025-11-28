'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Not authenticated, redirect to signup
        router.push('/signup')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleConnectTwitch = async () => {
    try {
      // Use Supabase OAuth which handles identity linking automatically
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes:
            'user:read:email chat:read channel:read:subscriptions moderator:read:followers bits:read',
        },
      })

      if (error) {
        console.error('OAuth error:', error)
        alert('Failed to connect Twitch account. Please try again.')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Failed to connect Twitch account. Please try again.')
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif',
          padding: '1rem',
          position: 'relative',
        }}
      >
        <AnimatedBackground />
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        padding: '1rem',
        position: 'relative',
      }}
    >
      <AnimatedBackground />
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 2rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image
              src="/landing-logo.svg"
              alt="Casi Logo"
              width={220}
              height={88}
              style={{ width: '220px', height: 'auto', maxWidth: '100%', cursor: 'pointer' }}
              priority
            />
          </Link>
        </div>

        {/* Welcome Message */}
        <h1
          style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '1rem',
          }}
        >
          Welcome to Casi!
        </h1>

        <p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '2.5rem',
          }}
        >
          Let's connect your Twitch channel to unlock real-time chat analysis, AI-powered insights,
          and powerful audience engagement tools.
        </p>

        {/* Connect Twitch Button */}
        <button
          onClick={handleConnectTwitch}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            padding: '1.25rem 2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 8px 25px rgba(105, 50, 255, 0.3)',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '1.5rem',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(105, 50, 255, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(105, 50, 255, 0.3)'
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
          Connect Twitch Channel
        </button>

        {/* Skip Option */}
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            fontWeight: '500',
            padding: '1rem 2rem',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
            fontFamily: 'Poppins, sans-serif',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          Skip for now
        </button>

        {/* Features */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              fontWeight: '600',
            }}
          >
            What you'll get:
          </p>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ color: '#B8EE8A', marginRight: '8px' }}>✓</span>
              <span>Real-time chat analysis</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ color: '#B8EE8A', marginRight: '8px' }}>✓</span>
              <span>AI-powered audience insights</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#B8EE8A', marginRight: '8px' }}>✓</span>
              <span>Multilingual sentiment detection</span>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div
          style={{
            marginTop: '2rem',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: '1.5',
          }}
        >
          Secure OAuth • Read-only access • No posting permissions required
        </div>
      </div>
    </div>
  )
}
