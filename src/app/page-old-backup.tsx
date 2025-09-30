'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(0)

  // Fetch waitlist count on component mount
  useEffect(() => {
    fetchWaitlistCount()
  }, [])

  const fetchWaitlistCount = async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching waitlist count:', error)
        return
      }
      setWaitlistCount(count || 0)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setIsSubmitting(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: 'homepage',
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage('You\'re already on the waitlist! 🎉')
        } else {
          setMessage('Something went wrong. Please try again.')
          console.error('Supabase error:', error)
        }
      } else {
        setMessage('Welcome to the waitlist! 🚀')
        setEmail('')
        // Refresh waitlist count
        fetchWaitlistCount()
      }
    } catch (error: unknown) {
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
      <header className="header-nav" style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <img
            src="/landing-logo.png"
            alt="Casi"
            style={{ height: '80px', width: 'auto' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('h1')
              fallback.style.cssText = 'margin: 0; font-size: 2.5rem; font-weight: bold; background: linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
              fallback.textContent = 'Casi'
              target.parentNode?.appendChild(fallback)
            }}
          />

          <img
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{ width: '70px', height: '70px' }}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.style.cssText = 'width: 70px; height: 70px; background: #B8EE8A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;'
              fallback.textContent = '🤖'
              target.parentNode?.appendChild(fallback)
            }}
          />
        </div>

        {/* Navigation Menu */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <a
            href="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: 1,
              whiteSpace: 'nowrap'
            }}
          >
            Home
          </a>
          <a
            href="/features"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            Features
          </a>
          <a
            href="/pricing"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            Pricing
          </a>
          <a
            href="/beta"
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            Join Beta
          </a>
        </nav>
      </header>

      {/* Live Stats Bar */}
      <div style={{
        padding: '0.75rem 2rem',
        background: 'rgba(184, 238, 138, 0.1)',
        borderBottom: '1px solid rgba(184, 238, 138, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          color: '#B8EE8A',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: '#B8EE8A',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          {waitlistCount} streamers waiting for early access
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content" style={{
        padding: '4rem 2rem',
        position: 'relative'
      }}>
        {/* Background Casi C Logos - Multiple for full coverage */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {/* Top Left */}
          <img
            src="/logo_casiC.jpeg"
            alt=""
            style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              width: '400px',
              height: '400px',
              objectFit: 'contain',
              opacity: 0.03
            }}
          />
          {/* Top Right */}
          <img
            src="/logo_casiC.jpeg"
            alt=""
            style={{
              position: 'absolute',
              top: '5%',
              right: '5%',
              width: '400px',
              height: '400px',
              objectFit: 'contain',
              opacity: 0.03
            }}
          />
          {/* Center - Largest */}
          <img
            src="/logo_casiC.jpeg"
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1000px',
              height: '1000px',
              objectFit: 'contain',
              opacity: 0.04
            }}
          />
          {/* Bottom Left */}
          <img
            src="/logo_casiC.jpeg"
            alt=""
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '10%',
              width: '350px',
              height: '350px',
              objectFit: 'contain',
              opacity: 0.03
            }}
          />
          {/* Bottom Right */}
          <img
            src="/logo_casiC.jpeg"
            alt=""
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '350px',
              height: '350px',
              objectFit: 'contain',
              opacity: 0.03
            }}
          />
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Hero Section */}
          <div style={{ marginBottom: '4rem' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              Turn Your Chat Into
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Content Gold
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '3rem',
              maxWidth: '600px',
              margin: '0 auto 3rem auto',
              lineHeight: '1.6'
            }}>
              Real-time analytics for Twitch — see sentiment, spot questions, and act fast. YouTube & Kick coming soon.
            </p>

            {/* Dashboard Preview */}
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto 3rem auto',
              position: 'relative'
            }}>
              <img
                src="/whole-dashboard.png"
                alt="Dashboard preview showing real-time sentiment analysis and chat monitoring"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '20px',
                  border: '3px solid rgba(94, 234, 212, 0.4)',
                  boxShadow: '0 40px 80px rgba(94, 234, 212, 0.25), 0 20px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 50px 100px rgba(94, 234, 212, 0.3), 0 30px 60px rgba(0, 0, 0, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 40px 80px rgba(94, 234, 212, 0.25), 0 20px 40px rgba(0, 0, 0, 0.5)'
                }}
                onClick={() => {
                  window.open('/whole-dashboard.png', '_blank')
                }}
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Preview
              </div>
            </div>

            {/* CTAs */}
            <div className="quick-access-buttons" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem'
            }}>
              <a
                href="/beta"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                Join Beta
              </a>

              <a
                href="/features"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: 'rgba(94, 234, 212, 0.2)',
                  color: '#5EEAD4',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                See Features
              </a>
            </div>

            {/* Waitlist Form */}
            <div className="form-container" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '500px',
              margin: '0 auto 3rem auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                color: 'white',
                marginBottom: '1rem',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                Get Early Access
              </h3>

              <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  flexDirection: 'column'
                }}>
                  <label htmlFor="email" style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '25px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: isSubmitting
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'linear-gradient(135deg, #6932FF, #932FFE)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      width: '100%'
                    }}
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </div>
              </form>

              {message && (
                <p style={{
                  color: message.includes('wrong') || message.includes('valid') ? '#FF9F9F' : '#B8EE8A',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* 3-Step Process */}
          <div style={{
            marginBottom: '4rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              How It Works
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '3rem',
              fontSize: '1.1rem'
            }}>
              Simple setup, instant insights
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  1
                </div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Connect Your Stream</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                  Link your Twitch account in seconds (YouTube & Kick coming soon)
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  2
                </div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>We Analyse Chat in Real Time</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                  AI processes every message for sentiment and questions
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  3
                </div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>You Get Insights & Alerts</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                  Live dashboard shows mood and highlights key questions
                </p>
              </div>
            </div>
          </div>

          {/* MVP Features Preview */}
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Real-time Sentiment Tracking</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
                Watch your chat's mood change live with AI-powered sentiment analysis
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❓</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Question Detection & Alerts</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
                Never miss important questions with smart AI detection and priority alerts
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem 2rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div className="footer-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Brand */}
          <div>
            <h4 style={{
              color: '#5EEAD4',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Casi
            </h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              Your stream's brainy co-pilot. AI-powered chat analysis for better audience engagement.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{
              color: 'white',
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Home
              </a>
              <a href="/features" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Features
              </a>
              <a href="/pricing" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Pricing
              </a>
              <a href="/beta" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Beta
              </a>
              <a href="/dashboard-preview" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Dashboard Preview
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{
              color: 'white',
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/about" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                About
              </a>
              <a href="/community" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Community
              </a>
              <a href="/contact" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Contact
              </a>
              <a href="mailto:casi@heycasi.com" style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                casi@heycasi.com
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{
              color: 'white',
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#" onClick={(e) => {
                e.preventDefault()
                setMessage('📄 Privacy policy coming soon!')
              }} style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Privacy Policy
              </a>
              <a href="#" onClick={(e) => {
                e.preventDefault()
                setMessage('📋 Terms of service coming soon!')
              }} style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            © 2024 Casi. All rights reserved.
          </p>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .header-nav {
            padding: 1rem !important;
            flex-direction: column !important;
            gap: 1rem !important;
            text-align: center !important;
          }

          .header-nav nav {
            gap: 1rem !important;
            justify-content: center !important;
          }

          .features-grid {
            grid-template-columns: 1fr !important;
          }

          .quick-access-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }

          .quick-access-buttons a {
            width: 100% !important;
            max-width: 300px !important;
            text-align: center !important;
          }

          .footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }

          .form-container {
            margin: 0 1rem 3rem 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .header-nav {
            padding: 0.75rem !important;
          }

          .header-nav nav {
            gap: 0.75rem !important;
            flex-direction: column !important;
          }

          .header-nav nav a {
            font-size: 0.85rem !important;
            padding: 0.5rem 1rem !important;
          }

          .main-content {
            padding: 2rem 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}