'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const handleTwitchLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '8lmg8rwlkhlom3idj51xka2eipxd18'

    // Use the actual current origin to handle all environments correctly
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://heycasi.com'

    const redirectUri = `${baseUrl}/auth/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope:
        'user:read:email chat:read channel:read:subscriptions moderator:read:followers bits:read',
      force_verify: 'true',
    })

    const authUrl = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`

    console.log('Base URL detected:', baseUrl)
    console.log('Redirect URI:', redirectUri)
    console.log('Full auth URL:', authUrl)
    window.location.href = authUrl
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* Back to Home Link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            transition: 'color 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          ← Back to Home
        </Link>

        {/* Casi Logo */}
        <Link href="/" style={{ display: 'block', marginBottom: '2rem' }}>
          <Image
            src="/landing-logo.svg"
            alt="Casi Logo"
            width={250}
            height={100}
            style={{
              width: '250px',
              height: 'auto',
              maxWidth: '100%',
              cursor: 'pointer',
            }}
            priority
          />
        </Link>

        {/* Headline */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Connect Your Stream
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              lineHeight: '1.6',
              fontWeight: '400',
              margin: 0,
            }}
          >
            Get real-time chat analysis, AI-powered insights, and boost your audience engagement.
          </p>
        </div>

        {/* Twitch Connect Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={handleTwitchLogin}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              padding: '1rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 8px 25px rgba(105, 50, 255, 0.3)',
              fontFamily: 'Poppins, sans-serif',
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
            Connect with Twitch
          </button>
        </div>

        {/* Security Features */}
        <div
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ color: '#5EEAD4', marginRight: '8px' }}>✓</span>
            <span>Secure OAuth authentication</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ color: '#5EEAD4', marginRight: '8px' }}>✓</span>
            <span>Read-only access to chat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#5EEAD4', marginRight: '8px' }}>✓</span>
            <span>No posting permissions required</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <p style={{ fontWeight: '600', margin: '0 0 0.5rem 0' }}>Enterprise Analytics</p>
          <p style={{ margin: 0 }}>Real-time Insights • Privacy Protected • Live Now</p>
        </div>
      </div>
    </div>
  )
}
