'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface EmailCaptureProps {
  source: string
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
}

export default function EmailCapture({
  source,
  title = 'Join the Beta',
  description = 'Get early access to Casi Platform',
  placeholder = 'your@email.com',
  buttonText = 'Join Beta',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          email: email.toLowerCase().trim(),
          source: source,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        if (error.code === '23505') {
          setMessage("You're already signed up! Check your email for updates.")
          setIsSuccess(true)
        } else {
          setMessage('Something went wrong. Please try again.')
          console.error('Supabase error:', error)
        }
      } else {
        setMessage('🎉 Welcome to the beta! Check your email for next steps.')
        setIsSuccess(true)
        setEmail('')

        // Generate beta code and send emails
        try {
          await Promise.all([
            // Generate and send beta code
            fetch('/api/beta-code/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email.toLowerCase().trim(),
              }),
            }),
            // Admin notification
            fetch('/api/notify-beta-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email.toLowerCase().trim(),
                source,
                timestamp: new Date().toISOString(),
              }),
            }),
          ])
        } catch (emailError) {
          console.error('Failed to send emails:', emailError)
          // Don't show error to user - signup was successful
        }
      }
    } catch (error: unknown) {
      console.error('Error:', error)
      setMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (isSuccess && message.includes('Welcome')) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          You're In!
        </h3>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '1.5rem',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="/dashboard"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'opacity 0.3s ease',
            }}
          >
            Go to Dashboard
          </a>
          <a
            href="/features"
            style={{
              display: 'block',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background 0.3s ease',
            }}
          >
            View Features
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '2rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{description}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            outline: 'none',
            transition: 'border-color 0.3s ease',
          }}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            background: isSubmitting
              ? 'rgba(105, 50, 255, 0.5)'
              : 'linear-gradient(135deg, #6932FF, #932FFE)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: '700',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
            transition: 'all 0.3s ease',
          }}
          data-event={`cta-email-capture-${source}`}
        >
          {isSubmitting ? 'Joining...' : buttonText}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background:
              message.includes('wrong') || message.includes('valid')
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            color: message.includes('wrong') || message.includes('valid') ? '#EF4444' : '#10B981',
            border:
              message.includes('wrong') || message.includes('valid')
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}
