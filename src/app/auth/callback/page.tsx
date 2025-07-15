'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authorization...')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        console.log('OAuth callback received:', { code, error })

        if (error) {
          setStatus(`❌ Authorization failed: ${error}`)
          return
        }

        if (!code) {
          setStatus('❌ No authorization code received')
          return
        }

        setStatus('🔄 Exchanging authorization code...')
        
        // Call our API to exchange code for tokens
        const response = await fetch('/api/auth/twitch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        const tokenData = await response.json()

        if (tokenData.error) {
          setStatus(`❌ Token exchange failed: ${tokenData.error}`)
          return
        }

        setStatus('💾 Storing user session...')
        
        // Store tokens securely (you can enhance this later)
        if (typeof window !== 'undefined') {
          localStorage.setItem('twitch_access_token', tokenData.access_token)
          localStorage.setItem('twitch_user', JSON.stringify(tokenData.user))
        }

        setStatus('✅ Authentication successful! Redirecting...')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (err) {
        console.error('Auth error:', err)
        setStatus('❌ Authentication failed - please try again')
      }
    }

    handleAuth()
  }, [searchParams, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        padding: '3rem 2rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Casi Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <img 
            src="/landing-logo.png" 
            alt="Casi" 
            style={{ 
              width: '200px', 
              height: 'auto',
              maxWidth: '100%'
            }} 
          />
        </div>
        
        {/* Processing Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '2rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(105, 50, 255, 0.3)',
            borderTop: '4px solid #6932FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'white',
            fontWeight: '500',
            lineHeight: '1.6',
            margin: 0
          }}>
            {status}
          </p>
        </div>

        {/* Footer Text */}
        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '400'
        }}>
          <p style={{ margin: 0 }}>Connecting your Twitch account securely...</p>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
