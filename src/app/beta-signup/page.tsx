'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BetaSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    twitch_channel: '',
    payment_reference: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Clean twitch channel name (remove @ or twitch.tv/ if user includes them)
      const cleanChannel = formData.twitch_channel
        .replace('@', '')
        .replace('twitch.tv/', '')
        .replace('https://twitch.tv/', '')
        .toLowerCase()

      const { data, error } = await supabase
        .from('beta_users')
        .insert([
          {
            name: formData.name,
            email: formData.email.toLowerCase(),
            twitch_channel: cleanChannel,
            tier: 'creator',
            payment_reference: formData.payment_reference,
            payment_status: 'pending'
          }
        ])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('This email is already registered. Please use a different email or contact support.')
        } else {
          setError('Something went wrong. Please try again or contact support.')
        }
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            Application Submitted!
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            Thanks {formData.name}! We've received your beta application for channel <strong>@{formData.twitch_channel}</strong>.
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            We'll verify your payment and activate your account within 24 hours. You'll receive an email confirmation once your access is ready.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '2rem',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/landing-logo.png" 
              alt="Casi Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <h1 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0
            }}>
              Beta Access
            </h1>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem 0'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              color: 'white',
              fontSize: '2.5rem',
              marginBottom: '1rem',
              fontWeight: '700'
            }}>
              Join Casi Beta
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              Get early access to the smartest streaming analytics platform. Never miss important questions again.
            </p>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              color: '#5EEAD4',
              fontSize: '1.3rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Creator Plan - £19/month
            </h3>
            <ul style={{
              color: 'rgba(255, 255, 255, 0.8)',
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Up to 100 viewers</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Real-time chat analysis</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Question detection & highlighting</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Sentiment tracking</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Discord notifications</li>
              <li>✅ Email support</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}
                placeholder="Enter your full name"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}
                placeholder="your@email.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Twitch Channel Username *
              </label>
              <input
                type="text"
                name="twitch_channel"
                value={formData.twitch_channel}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}
                placeholder="your_twitch_username"
              />
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}>
                Enter just your username (no @ or twitch.tv/)
              </p>
            </div>

            {/* Payment Instructions */}
            <div style={{
              background: 'rgba(255, 204, 0, 0.1)',
              border: '1px solid rgba(255, 204, 0, 0.3)',
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                color: '#FFD700',
                fontSize: '1.1rem',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                Payment Instructions
              </h4>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '1rem'
              }}>
                To secure your beta access, transfer £19 to:
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ color: 'white', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Account Name:</strong> [Your Business Name]
                </p>
                <p style={{ color: 'white', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Sort Code:</strong> XX-XX-XX
                </p>
                <p style={{ color: 'white', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Account Number:</strong> XXXXXXXX
                </p>
                <p style={{ color: 'white', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Reference:</strong> CASI-[YourTwitchUsername]
                </p>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem',
                lineHeight: '1.4'
              }}>
                Use your Twitch username in the reference so we can match your payment to your application.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Payment Reference *
              </label>
              <input
                type="text"
                name="payment_reference"
                value={formData.payment_reference}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}
                placeholder="CASI-your_twitch_username"
              />
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}>
                Enter the reference you used for the bank transfer
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#ff6b6b',
                fontSize: '0.95rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: isSubmitting 
                  ? 'rgba(105, 50, 255, 0.5)' 
                  : 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                color: 'white',
                border: 'none',
                padding: '1.25rem',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Beta Application'}
            </button>
          </form>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.85rem',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: '1.4'
          }}>
            By submitting this form, you agree to our terms of service. We'll activate your account within 24 hours of payment verification.
          </p>
        </div>
      </div>
    </div>
  )
}
