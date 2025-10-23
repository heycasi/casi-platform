'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
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

        setStatus('🔍 Checking for existing account...')

        // Check if this Twitch account should be linked to an existing account
        const linkResponse = await fetch('/api/link-twitch-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twitchUserId: tokenData.user.id,
            twitchEmail: `${tokenData.user.id}@twitch.casi.app`,
            twitchUserData: tokenData.user
          }),
        })

        const linkData = await linkResponse.json()
        let accountEmail = `${tokenData.user.id}@twitch.casi.app`

        if (linkData.linked && linkData.primaryAccount) {
          setStatus('🔗 Linking to your existing account...')
          accountEmail = linkData.primaryAccount.email
          console.log('✅ Twitch account linked to:', accountEmail)
        }

        setStatus('💾 Signing in...')

        // Create/sign in Supabase user with Twitch data
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // Use Twitch user ID as the email domain to create a unique account
        const twitchEmail = `${tokenData.user.id}@twitch.casi.app`

        // If account was linked, sign in with the primary account
        if (linkData.linked && linkData.primaryAccount) {
          // Sign in with the primary account
          // Note: We can't sign in without a password, so we'll use the Twitch account
          // but the subscription will be transferred

          // Try to sign in with Twitch email first
          let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: twitchEmail,
            password: tokenData.user.id
          })

          if (signInError) {
            // Create Twitch account if it doesn't exist
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: twitchEmail,
              password: tokenData.user.id,
              options: {
                data: {
                  twitch_id: tokenData.user.id,
                  display_name: tokenData.user.display_name,
                  preferred_username: tokenData.user.login,
                  avatar_url: tokenData.user.profile_image_url,
                  provider: 'twitch',
                  linked_to: linkData.primaryAccount.email
                }
              }
            })

            if (signUpError) {
              console.error('Supabase signup error:', signUpError)
            }
          }
        } else {
          // No existing account found, proceed with normal Twitch sign-in/sign-up
          let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: twitchEmail,
            password: tokenData.user.id
          })

          if (signInError) {
            // User doesn't exist, create new account
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: twitchEmail,
              password: tokenData.user.id,
              options: {
                data: {
                  twitch_id: tokenData.user.id,
                  display_name: tokenData.user.display_name,
                  preferred_username: tokenData.user.login,
                  avatar_url: tokenData.user.profile_image_url,
                  provider: 'twitch'
                }
              }
            })

            if (signUpError) {
              console.error('Supabase signup error:', signUpError)
              setStatus('⚠️ Account creation failed, but you can still use the dashboard')
            } else {
              // Subscribe to Twitch events for this new user
              try {
                await fetch('/api/subscribe-user-events', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ broadcaster_user_id: tokenData.user.id })
                })
              } catch (error) {
                console.error('Failed to subscribe to events:', error)
              }
            }
          }
        }

        // Store tokens in localStorage as well for backward compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem('twitch_access_token', tokenData.access_token)
          localStorage.setItem('twitch_user', JSON.stringify(tokenData.user))
          localStorage.setItem('casi_user_email', twitchEmail)
        }

        setStatus('✅ Authentication successful! Redirecting...')

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)

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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
