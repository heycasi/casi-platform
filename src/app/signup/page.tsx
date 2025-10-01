'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signUpError) throw signUpError

      // Check if this email has an existing subscription and link it
      if (data.user) {
        try {
          const linkResponse = await fetch('/api/link-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              userId: data.user.id
            })
          })

          const linkData = await linkResponse.json()

          if (linkData.linked) {
            setMessage(`Account created and your ${linkData.subscription.plan_name} subscription has been linked! Please check your email to verify your account.`)
          } else {
            setMessage('Account created! Please check your email to verify your account.')
          }
        } catch (linkError) {
          console.error('Error linking subscription:', linkError)
          setMessage('Account created! Please check your email to verify your account.')
        }
      } else {
        setMessage('Account created! Please check your email to verify your account.')
      }

      setEmail('')
      setPassword('')
      setConfirmPassword('')

    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif',
      padding: '1rem',
      position: 'relative'
    }}>
      <AnimatedBackground />
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem 2rem',
        maxWidth: '420px',
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/landing-logo.png"
            alt="Casi"
            style={{ width: '180px', height: 'auto', maxWidth: '100%' }}
          />
        </div>

        <h1 style={{
          color: 'white',
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Create Account
        </h1>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Start your free Casi account today
        </p>

        <form onSubmit={handleSignUp}>
          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="Re-enter password"
            />
          </div>

          {/* Error/Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.875rem'
        }}>
          Already have an account?{' '}
          <a href="/login-email" style={{ color: '#6932FF', textDecoration: 'none', fontWeight: '600' }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
