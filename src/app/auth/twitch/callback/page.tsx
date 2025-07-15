'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function TwitchCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        
        if (error) {
          setStatus('error')
          setMessage(`OAuth error: ${error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          return
        }

        // Exchange code for access token
        const tokenResponse = await fetch('/api/auth/twitch/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        })

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token')
        }

        const tokenData = await tokenResponse.json()
        
        // Store user data in localStorage
        const userData = {
          email: tokenData.user?.email || '',
          hasAccess: true,
          twitchConnected: true,
          twitchUser: tokenData.user,
          accessToken: tokenData.access_token
        }

        localStorage.setItem('casi_beta_access', JSON.stringify(userData))
        
        setStatus('success')
        setMessage('Successfully connected to Twitch!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)

      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Failed to complete Twitch authentication')
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        {/* Casi Robot */}
        <div style={{ marginBottom: '2rem' }}>
          <img 
            src="/landing-robot.png" 
            alt="Casi Robot" 
            style={{ 
              width: '80px', 
              height: '80px',
              marginBottom: '1rem'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.insertAdjacentHTML('afterend', `
                <div style="font-size: 4rem; margin-bottom: 1rem;">🤖</div>
              `)
            }}
          />
        </div>

        {status === 'loading' && (
          <>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem'
            }}>
              Connecting to Twitch...
            </h1>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem'
            }}>
              Processing your authentication
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: '#10B981',
              marginBottom: '1rem'
            }}>
              ✅ Success!
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              {message}
            </p>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              Redirecting to dashboard...
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: '#FF9F9F',
              marginBottom: '1rem'
            }}>
              ❌ Error
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              {message}
            </p>
            <a 
              href="/dashboard"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Return to Dashboard
            </a>
          </>
        )}
      </div>
    </div>
  )
}
