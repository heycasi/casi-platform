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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🎮 Casi Platform
        </h1>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 leading-relaxed">{status}</p>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Connecting your Twitch account securely...</p>
        </div>
      </div>
    </div>
  )
}
