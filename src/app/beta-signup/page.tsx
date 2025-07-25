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
    beta_reason: ''
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
            beta_reason: formData.beta_reason,
            payment_status: 'beta_free'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        padding: 'clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(15px, 3vw, 20px)',
          padding: 'clamp(2rem, 6vw, 3rem)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          maxWidth: '90vw',
          width: '100%'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: '1rem' }}>✅</div>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            marginBottom: '1rem',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            Application Submitted!
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            wordWrap: 'break-word'
          }}>
            Thanks {formData.name}! We've received your beta application for channel <strong>@{formData.twitch_channel}</strong>.
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Your free 2-week beta access starts as soon as we activate your account. We'll email you with login details and getting started instructions.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
              color: 'white',
              border: 'none',
              padding: 'clamp(0.8rem, 3vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
              borderRadius: '50px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              width: '100%',
              maxWidth: '300px'
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
      padding: 'clamp(1rem, 3vw, 2rem)',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: 'clamp(1rem, 3vw, 2rem)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
            <img 
              src="/landing-logo.png" 
              alt="Casi Logo" 
              style={{ height: 'clamp(30px, 6vw, 40px)', width: 'auto' }}
            />
            <h1 style={{
              color: 'white',
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(1rem, 3vw, 3rem) 0'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(15px, 3vw, 20px)',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '95vw',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
            <h2 style={{
              color: 'white',
              fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
              marginBottom: '1.5rem',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              Join Casi Beta
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 'clamp(1rem, 3vw, 1.1rem)',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Get early access to the smartest streaming analytics platform. Never miss important questions again.
            </p>
          </div>

          {/* Free Beta Box with Matching Gradient Background */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.15) 0%, rgba(147, 47, 254, 0.15) 35%, rgba(255, 159, 159, 0.15) 70%, rgba(184, 238, 138, 0.15) 100%)',
            borderRadius: 'clamp(12px, 3vw, 15px)',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Robot Logo */}
            <div style={{
              position: 'absolute',
              top: 'clamp(1rem, 3vw, 1.5rem)',
              right: 'clamp(1rem, 3vw, 1.5rem)',
              opacity: 0.7
            }}>
              <img 
                src="/landing-robot.png" 
                alt="Casi Robot" 
                style={{ height: 'clamp(40px, 8vw, 70px)', width: 'auto' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>🎉</div>
              <h3 style={{
                color: '#5EEAD4',
                fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                margin: 0,
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                FREE Beta Access - Limited to 10 Users!
              </h3>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'clamp(8px, 2vw, 10px)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                color: '#FFD700',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                fontWeight: '600',
                margin: '0 0 0.75rem 0'
              }}>
                🚀 2-Week Free Trial
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Get complete access to all Creator Plan features absolutely free for 2 weeks. No payment required to start!
              </p>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                <ul style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Real-time chat analysis</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Question detection & highlighting</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Sentiment tracking</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Discord notifications</li>
                </ul>
                <ul style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Email support</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ Priority feedback channel</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>✅ End of stream report!</li>
                  <li style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.6)' }}>(Normally only available in Pro tier and above)</li>
                </ul>
              </div>
            </div>
            
            {/* After Beta Pricing */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'clamp(6px, 2vw, 8px)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                margin: '0 0 0.75rem 0',
                fontWeight: '600'
              }}>
                After your 2-week trial:
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
                margin: 0,
                lineHeight: '1.5'
              }}>
                If you love Casi and want to continue, plans start from just <strong style={{ color: '#5EEAD4' }}>£19/month</strong> with higher tiers available for larger streamers. 
                No pressure - we'll contact you before your trial ends to see if you'd like to continue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(1rem, 3vw, 1.5rem)',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.75rem'
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
                      padding: 'clamp(0.8rem, 3vw, 1rem)',
                      borderRadius: 'clamp(8px, 2vw, 10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                      fontFamily: 'Poppins, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label style={{
                    color: 'white',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.75rem'
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
                      padding: 'clamp(0.8rem, 3vw, 1rem)',
                      borderRadius: 'clamp(8px, 2vw, 10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                      fontFamily: 'Poppins, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label style={{
                  color: 'white',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '0.75rem'
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
                    padding: 'clamp(0.8rem, 3vw, 1rem)',
                    borderRadius: 'clamp(8px, 2vw, 10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    fontFamily: 'Poppins, sans-serif',
                    boxSizing: 'border-box'
                  }}
                  placeholder="your_twitch_username"
                />
                <p style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 'clamp(0.75rem, 2.2vw, 0.9rem)',
                  marginTop: '0.75rem'
                }}>
                  Enter just your username (no @ or twitch.tv/)
                </p>
              </div>
            </div>

            {/* Beta Access Instructions with Gradient Background */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.15) 0%, rgba(147, 47, 254, 0.15) 35%, rgba(255, 159, 159, 0.15) 70%, rgba(184, 238, 138, 0.15) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'clamp(8px, 2vw, 10px)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              position: 'relative'
            }}>
              {/* Small Robot Logo */}
              <div style={{
                position: 'absolute',
                top: 'clamp(1rem, 3vw, 1.5rem)',
                right: 'clamp(1rem, 3vw, 1.5rem)',
                opacity: 0.6
              }}>
                <img 
                  src="/landing-robot.png" 
                  alt="Casi Robot" 
                  style={{ height: 'clamp(30px, 6vw, 45px)', width: 'auto' }}
                />
              </div>
              
              <h4 style={{
                color: '#5EEAD4',
                fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                marginBottom: '1.5rem',
                fontWeight: '600',
                lineHeight: '1.2'
              }}>
                🎯 How to Get Your Free Beta Access
              </h4>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                borderRadius: 'clamp(6px, 2vw, 8px)',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    <strong>Step 1:</strong> Fill out the form with your details
                  </p>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    <strong>Step 2:</strong> We'll review and activate within 24 hours
                  </p>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    <strong>Step 3:</strong> Start using Casi - completely free for 2 weeks!
                  </p>
                </div>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
                lineHeight: '1.5',
                margin: 0,
                textAlign: 'center'
              }}>
                <strong>Limited spots:</strong> Only 10 beta users will be selected for this exclusive free trial. 
                Apply now to secure your spot!
              </p>
            </div>

            <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <label style={{
                color: 'white',
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.75rem'
              }}>
                Why do you want to join the Casi beta? *
              </label>
              <textarea
                name="beta_reason"
                value={formData.beta_reason}
                onChange={handleChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: 'clamp(0.8rem, 3vw, 1rem)',
                  borderRadius: 'clamp(8px, 2vw, 10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  fontFamily: 'Poppins, sans-serif',
                  resize: 'vertical',
                  minHeight: 'clamp(100px, 15vw, 120px)',
                  boxSizing: 'border-box'
                }}
                placeholder="Tell us why you'd be a great beta tester and how you plan to use Casi..."
              />
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.9rem)',
                marginTop: '0.75rem'
              }}>
                Help us understand your streaming goals and how Casi can help you grow
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: 'clamp(8px, 2vw, 10px)',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                color: '#ff6b6b',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                textAlign: 'center',
                wordWrap: 'break-word'
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
                padding: 'clamp(1rem, 4vw, 1.5rem) clamp(1.5rem, 4vw, 2rem)',
                borderRadius: '50px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease',
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                boxSizing: 'border-box'
              }}
            >
              {isSubmitting ? 'Submitting Application...' : 'Apply for Free Beta Access'}
            </button>
          </form>

          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
            textAlign: 'center',
            lineHeight: '1.5',
            maxWidth: '100%',
            margin: '0 auto',
            wordWrap: 'break-word'
          }}>
            By applying, you agree to provide feedback during the beta period. Only 10 spots available - we'll contact successful applicants within 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
