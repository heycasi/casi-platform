'use client'
import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BetaSignup() {
  const [formData, setFormData] = useState({
    email: '',
    twitchUsername: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    // Basic validation
    if (!formData.email || !formData.twitchUsername) {
      setMessage('Please fill in both email and Twitch username')
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase.from('beta_signups').insert([
        {
          email: formData.email.toLowerCase().trim(),
          twitch_username: formData.twitchUsername.toLowerCase().trim(),
          source: 'beta_signup_page',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        if (error.code === '23505') {
          setMessage("You're already signed up for beta access! 🎉")
        } else {
          setMessage('Something went wrong. Please try again.')
          console.error('Supabase error:', error)
        }
      } else {
        setMessage("🚀 Beta application submitted! We'll be in touch soon with your access code.")
        setFormData({
          email: '',
          twitchUsername: '',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        fontFamily: 'Poppins, Arial, sans-serif',
        color: 'white',
      }}
    >
      {/* Header with Navigation */}
      <header
        style={{
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Image
            src="/landing-logo.svg"
            alt="Casi Logo"
            width={100}
            height={32}
            style={{ height: '32px', width: 'auto' }}
            priority
          />

          <img
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{ width: '32px', height: '32px' }}
          />
        </div>

        {/* Navigation Menu */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="/"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            Home
          </a>
          <a
            href="/beta-signup"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: 1,
              whiteSpace: 'nowrap',
            }}
          >
            Beta Program
          </a>
          <a
            href="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            Dashboard
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {/* Header Section */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '800',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Join the Casi Beta
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              Get early access to AI-powered streaming analytics. Help us build the future of chat
              analysis.
            </p>

            {/* Benefits List */}
            <div
              style={{
                background: 'rgba(94, 234, 212, 0.1)',
                border: '1px solid rgba(94, 234, 212, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
              }}
            >
              <h3
                style={{
                  color: '#5EEAD4',
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}
              >
                ✨ What you'll get:
              </h3>
              <ul
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  paddingLeft: '1.5rem',
                  margin: 0,
                }}
              >
                <li>Early access to the dashboard before public launch</li>
                <li>Direct influence on features and development</li>
                <li>Free access during the beta period</li>
                <li>Priority support and onboarding</li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2
              style={{
                color: 'white',
                fontSize: '1.3rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              Quick Beta Application
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '1.5rem',
                }}
              >
                {/* Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Twitch Username */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Twitch Username *
                  </label>
                  <input
                    type="text"
                    name="twitchUsername"
                    value={formData.twitchUsername}
                    onChange={handleInputChange}
                    placeholder="your_twitch_username"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Info Note */}
                <div
                  style={{
                    background: 'rgba(94, 234, 212, 0.1)',
                    border: '1px solid rgba(94, 234, 212, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.85rem',
                      margin: 0,
                      lineHeight: '1.4',
                    }}
                  >
                    💡 That's it for now! We'll ask for additional details (like viewer count and
                    streaming experience) during the onboarding process to keep things simple.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: isSubmitting
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'linear-gradient(135deg, #6932FF, #932FFE)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, Arial, sans-serif',
                    marginTop: '0.5rem',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Apply for Beta Access'}
                </button>
              </div>
            </form>

            {message && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background:
                    message.includes('wrong') || message.includes('valid')
                      ? 'rgba(255, 159, 159, 0.1)'
                      : 'rgba(184, 238, 138, 0.1)',
                  border: `1px solid ${
                    message.includes('wrong') || message.includes('valid')
                      ? 'rgba(255, 159, 159, 0.3)'
                      : 'rgba(184, 238, 138, 0.3)'
                  }`,
                  color:
                    message.includes('wrong') || message.includes('valid') ? '#FF9F9F' : '#B8EE8A',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}
              >
                {message}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.85rem',
            }}
          >
            <p>
              Questions? Email us at{' '}
              <a href="mailto:casi@heycasi.com" style={{ color: '#5EEAD4' }}>
                casi@heycasi.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
