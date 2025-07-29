'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BetaSignup() {
  const [formData, setFormData] = useState({
    email: '',
    twitchUsername: '',
    averageViewers: '',
    streamingExperience: '',
    primaryPlatform: 'twitch',
    useCase: '',
    hearAbout: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    // Basic validation
    if (!formData.email || !formData.twitchUsername) {
      setMessage('Please fill in email and Twitch username')
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
      const { error } = await supabase
        .from('beta_signups')
        .insert([
          {
            email: formData.email.toLowerCase().trim(),
            twitch_username: formData.twitchUsername.toLowerCase().trim(),
            average_viewers: parseInt(formData.averageViewers) || 0,
            streaming_experience: formData.streamingExperience,
            primary_platform: formData.primaryPlatform,
            use_case: formData.useCase,
            hear_about: formData.hearAbout,
            source: 'beta_signup_page',
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        if (error.code === '23505') {
          setMessage('You\'re already signed up for beta access! 🎉')
        } else {
          setMessage('Something went wrong. Please try again.')
          console.error('Supabase error:', error)
        }
      } else {
        setMessage('Beta application submitted! We\'ll be in touch soon 🚀')
        setFormData({
          email: '',
          twitchUsername: '',
          averageViewers: '',
          streamingExperience: '',
          primaryPlatform: 'twitch',
          useCase: '',
          hearAbout: ''
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header with Navigation */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <img 
            src="/landing-logo.png"
            alt="Casi"
            style={{ height: '32px', width: 'auto' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('h1')
              fallback.style.cssText = 'margin: 0; font-size: 1.3rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
              fallback.textContent = 'Casi'
              target.parentNode?.appendChild(fallback)
            }}
          />
          
          <img 
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{ width: '32px', height: '32px' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.style.cssText = 'width: 32px; height: 32px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
            }}
          />
        </div>

        {/* Navigation Menu */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <a 
            href="/" 
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500'
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
              opacity: 1
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
              fontWeight: '600'
            }}
          >
            Dashboard
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Join the Casi Beta
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Be among the first streamers to experience AI-powered chat analysis. 
              Help us build the future of streaming analytics.
            </p>
          </div>

          {/* Beta Program Info */}
          <div style={{
            background: 'rgba(94, 234, 212, 0.1)',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              color: '#5EEAD4',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🚀 What's Included in Beta
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  ✨ Real-time Chat Analysis
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                  AI-powered sentiment tracking and question detection for live streams
                </p>
              </div>
              
              <div>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  📊 Engagement Insights
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                  Track viewer mood and engagement patterns throughout your streams
                </p>
              </div>
              
              <div>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  🎯 Priority Support
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                  Direct feedback line to our development team
                </p>
              </div>
              
              <div>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  🆓 Free Access
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                  Full platform access during beta period (3-6 months)
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Beta Application Form
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1.5rem'
              }}>
                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
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
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Twitch Username */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
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
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Two Column Layout for Desktop */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* Average Viewers */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      Average Viewers
                    </label>
                    <select
                      name="averageViewers"
                      value={formData.averageViewers}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Poppins, Arial, sans-serif',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select range</option>
                      <option value="1-10">1-10 viewers</option>
                      <option value="11-50">11-50 viewers</option>
                      <option value="51-100">51-100 viewers</option>
                      <option value="101-500">101-500 viewers</option>
                      <option value="501-1000">501-1,000 viewers</option>
                      <option value="1000+">1,000+ viewers</option>
                    </select>
                  </div>

                  {/* Streaming Experience */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      Streaming Experience
                    </label>
                    <select
                      name="streamingExperience"
                      value={formData.streamingExperience}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Poppins, Arial, sans-serif',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select experience</option>
                      <option value="new">New (0-6 months)</option>
                      <option value="intermediate">Intermediate (6 months - 2 years)</option>
                      <option value="experienced">Experienced (2+ years)</option>
                      <option value="professional">Professional/Partner</option>
                    </select>
                  </div>
                </div>

                {/* Primary Platform */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Primary Streaming Platform
                  </label>
                  <select
                    name="primaryPlatform"
                    value={formData.primaryPlatform}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="twitch">Twitch</option>
                    <option value="youtube">YouTube Live</option>
                    <option value="kick">Kick</option>
                    <option value="facebook">Facebook Gaming</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Use Case */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    What would you primarily use Casi for?
                  </label>
                  <textarea
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    placeholder="e.g., Better engage with my community, track viewer sentiment, find important questions..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* How did you hear about us */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    How did you hear about Casi?
                  </label>
                  <select
                    name="hearAbout"
                    value={formData.hearAbout}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select option</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="twitch">Twitch</option>
                    <option value="discord">Discord</option>
                    <option value="reddit">Reddit</option>
                    <option value="youtube">YouTube</option>
                    <option value="friend">Friend/Streamer</option>
                    <option value="search">Google Search</option>
                    <option value="other">Other</option>
                  </select>
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
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, Arial, sans-serif',
                    marginTop: '0.5rem'
                  }}
                >
                  {isSubmitting ? 'Submitting Application...' : 'Apply for Beta Access'}
                </button>
              </div>
            </form>

            {message && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                background: message.includes('wrong') || message.includes('valid') 
                  ? 'rgba(255, 159, 159, 0.2)' 
                  : 'rgba(184, 238, 138, 0.2)',
                border: `1px solid ${message.includes('wrong') || message.includes('valid') 
                  ? 'rgba(255, 159, 159, 0.3)' 
                  : 'rgba(184, 238, 138, 0.3)'}`,
                color: message.includes('wrong') || message.includes('valid') ? '#FF9F9F' : '#B8EE8A',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={{
            marginTop: '3rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.3rem',
              marginBottom: '2rem'
            }}>
              Beta Timeline
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
                <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Week 1-2
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', margin: 0 }}>
                  Application review and beta invitations sent
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</div>
                <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Week 3-4
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', margin: 0 }}>
                  Beta access granted and initial testing phase
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
                <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Month 2-4
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', margin: 0 }}>
                  Feature development based on your feedback
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Month 5-6
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', margin: 0 }}>
                  Public launch with special beta user benefits
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.2rem',
              marginBottom: '1rem'
            }}>
              Questions about the Beta?
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              We're here to help! Reach out if you have any questions about the beta program.
            </p>
            <a
              href="mailto:beta@heycasi.com"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'rgba(94, 234, 212, 0.2)',
                color: '#5EEAD4',
                textDecoration: 'none',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid rgba(94, 234, 212, 0.3)',
                fontFamily: 'Poppins, Arial, sans-serif'
              }}
            >
              📧 Contact Beta Team
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          <strong style={{ color: '#5EEAD4' }}>Casi</strong> • Your stream's brainy co-pilot. Reads the room so you don't have to.
        </p>
      </footer>
    </div>
  )
}
