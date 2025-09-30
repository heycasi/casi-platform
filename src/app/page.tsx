'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, sans-serif',
      color: '#F7F7F7',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Robot Mascot */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.04,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src="/landing-robot.png"
          alt=""
          style={{
            width: '800px',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 1.5rem'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 768px) {
            header { padding: 2rem 3rem !important; }
          }
          @media (max-width: 767px) {
            .desktop-nav { display: none !important; }
            .mobile-logo { height: 80px !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-logo { height: 140px !important; }
            .mobile-menu-btn { display: none !important; }
          }
        `}} />
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Centered Logo */}
          <Link href="/" style={{
            textDecoration: 'none',
            zIndex: 10
          }}>
            <img src="/landing-logo.png" alt="Casi" className="mobile-logo" style={{ height: '140px', width: 'auto' }} />
          </Link>

          {/* Right-aligned Navigation - Desktop Only */}
          <nav className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            position: 'absolute',
            right: 0
          }}>
            <Link href="/features" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>Features</Link>
            <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>Pricing</Link>
            <Link href="/beta" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>Beta</Link>
            <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>Dashboard</Link>
            <Link
              href="/beta"
              style={{
                padding: '0.65rem 1.5rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                borderRadius: '50px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              position: 'absolute',
              right: 0,
              width: '2.5rem',
              height: '2.5rem',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1001
            }}
            aria-label="Toggle mobile menu"
          >
            <div style={{
              width: '1.5rem',
              height: '2px',
              background: 'white',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'rotate(0)',
              marginBottom: '4px'
            }} />
            <div style={{
              width: '1.5rem',
              height: '2px',
              background: 'white',
              transition: 'all 0.3s ease',
              opacity: isMobileMenuOpen ? 0 : 1,
              marginBottom: '4px'
            }} />
            <div style={{
              width: '1.5rem',
              height: '2px',
              background: 'white',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'rotate(0)'
            }} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div style={{
          display: isMobileMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.5rem',
          background: 'rgba(26, 26, 26, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Link
            href="/features"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem'
            }}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem'
            }}
          >
            Pricing
          </Link>
          <Link
            href="/beta"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem'
            }}
          >
            Beta
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem'
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/beta"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '50px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
              textAlign: 'center'
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero Section */}
        <section style={{
          padding: '4rem 1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center',
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              Turn Your Chat Into
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Content Gold
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              lineHeight: '1.6'
            }}>
              Real-time analytics for Twitch streamers. See sentiment, spot questions, and act fast—so you never miss what matters.
            </p>

            {/* Dual CTAs */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem'
            }}>
              <Link
                href="/beta"
                style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  borderRadius: '50px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 8px 30px rgba(105, 50, 255, 0.5)',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/features"
                style={{
                  padding: '1rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(94, 234, 212, 0.5)',
                  borderRadius: '50px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
              >
                See Features
              </Link>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span> Free 2-week beta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span> No credit card required
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span> {waitlistCount > 0 ? `${waitlistCount}+` : '20+'} streamers waiting
              </div>
            </div>
          </div>

          {/* Preview Image */}
          <div style={{
            maxWidth: '1100px',
            width: '100%',
            marginTop: '2rem',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: '-20px',
              background: 'linear-gradient(135deg, rgba(105, 50, 255, 0.3), rgba(147, 47, 254, 0.3))',
              borderRadius: '20px',
              filter: 'blur(40px)',
              opacity: '0.6'
            }}></div>
            <img
              src="/wholedashboard.png"
              alt="Casi Dashboard Preview"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 1
              }}
            />
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{
          padding: '3rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #5EEAD4, #FF9F9F)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Pre-Launch
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Beta Testing Phase
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #FF9F9F, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                {waitlistCount > 0 ? `${waitlistCount}+` : '20+'}
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Streamers on Waitlist
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #B8EE8A, #5EEAD4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                99.9%
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Target Uptime
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #932FFE, #6932FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                2025
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Full Launch Coming
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          padding: '5rem 1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join the beta program today and transform how you engage with your audience.
          </p>
          <Link
            href="/beta"
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '50px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              boxShadow: '0 8px 30px rgba(105, 50, 255, 0.5)',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
          >
            Join Beta Program
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <img src="/landing-logo.png" alt="Casi" style={{ height: '40px', width: 'auto' }} />
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Your stream's brainy co-pilot. AI-powered chat analysis for better audience engagement.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://twitter.com/HeyCasi_"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: '#1DA1F2',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease',
                  fontSize: '1.2rem'
                }}
                aria-label="Follow us on Twitter"
              >
                𝕏
              </a>
              <a
                href="https://tiktok.com/@HeyCasi_"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: '#000000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease',
                  fontSize: '1.2rem'
                }}
                aria-label="Follow us on TikTok"
              >
                🎵
              </a>
              <a
                href="https://linkedin.com/company/heycasi"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: '#0A66C2',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '700'
                }}
                aria-label="Follow us on LinkedIn"
              >
                in
              </a>
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white'
            }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/features" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Features</Link>
              <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
              <Link href="/beta" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Beta</Link>
              <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white'
            }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/about" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
              <Link href="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link>
              <a href="mailto:casi@heycasi.com" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>casi@heycasi.com</a>
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white'
            }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem'
        }}>
          © 2024 Casi. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
