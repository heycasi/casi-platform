'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
            source: 'landing_page',
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
            href="/beta-signup" 
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
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
              whiteSpace: 'nowrap'
            }}
          >
            Dashboard
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
      <main className="main-content" style={{ padding: '4rem 2rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
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
              Real-time Streaming
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Analytics
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
              AI-powered chat analysis that helps streamers engage better with their audience.
              Get instant insights on viewer sentiment and never miss important questions.
            </p>

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

            {/* Quick Access Buttons */}
            <div className="quick-access-buttons" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/beta-signup"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(94, 234, 212, 0.2)',
                  color: '#5EEAD4',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                📝 Beta Program Details
              </a>
              
              <button
                onClick={() => {
                  setMessage('🔒 Dashboard demo coming soon! Join the waitlist above for early access.')
                }}
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 159, 159, 0.2)',
                  color: '#FF9F9F',
                  border: '1px solid rgba(255, 159, 159, 0.3)',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  cursor: 'pointer'
                }}
              >
                🔒 Preview Dashboard
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Real-time Chat Analysis</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
                AI-powered sentiment analysis and question detection in live chat
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Engagement Insights</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
                Track viewer mood and engagement levels throughout your stream
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>AI Response Suggestions</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
                Get smart suggestions for engaging with your community
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

          {/* Links */}
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
              <a href="/beta-signup" style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Beta Program
              </a>
              <button 
                onClick={() => setMessage('🔒 Dashboard demo coming soon!')}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ 
              color: 'white', 
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="mailto:casi@heycasi.com" style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                casi@heycasi.com
              </a>
              <a href="#" onClick={(e) => {
                e.preventDefault()
                setMessage('📞 Support available for beta users!')
              }} style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Support
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
          
          .quick-access-buttons a,
          .quick-access-buttons button {
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
