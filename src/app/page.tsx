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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{
          email: email.toLowerCase().trim(),
          source: 'homepage',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }])

      if (error) {
        if (error.code === '23505') {
          setMessage('You\'re already on the waitlist! 🎉')
        } else {
          setMessage('Something went wrong. Please try again.')
        }
      } else {
        setMessage('Welcome to the waitlist! 🚀')
        setEmail('')
        fetchWaitlistCount()
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
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
            .mobile-logo { height: 60px !important; }
          }
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-logo { height: 90px !important; }
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
            <img src="/landing-logo.png" alt="Casi" className="mobile-logo" style={{ height: '90px', width: 'auto' }} />
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
              href="/dashboard"
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
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero Section */}
        <section style={{
          padding: '3rem 1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              section { padding: 6rem 2rem !important; }
            }
          `}} />
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
              marginBottom: '2rem'
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
                href="#features"
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
              <span>✓ No credit card required</span>
              <span>✓ 2 weeks free</span>
              <span>✓ 20+ streamers waiting</span>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative'
          }}>
            <img
              src="/whole-dashboard.png"
              alt="Casi Dashboard"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '24px',
                border: '3px solid rgba(94, 234, 212, 0.3)',
                boxShadow: '0 50px 100px rgba(94, 234, 212, 0.2), 0 30px 60px rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onClick={() => window.open('/whole-dashboard.png', '_blank')}
            />
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(94, 234, 212, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#151E3C'
            }}>
              Live Preview
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{
          padding: '2rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              .stats-section { padding: 4rem 2rem !important; }
              .stats-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 3rem !important; }
            }
            @media (max-width: 767px) {
              .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem !important; }
            }
          `}} />
          <div className="stats-grid" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { number: 'Pre-Launch', label: 'Beta Testing Phase', color: '#5EEAD4' },
              { number: '20+', label: 'Streamers on Waitlist', color: '#FF9F9F' },
              { number: '99.9%', label: 'Target Uptime', color: '#B8EE8A' },
              { number: '2025', label: 'Full Launch Coming', color: '#932FFE' }
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: '140px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: stat.color,
                  marginBottom: '0.75rem',
                  lineHeight: '1.2',
                  textAlign: 'center'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Simple setup, instant insights
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem'
          }}>
            {[
              {
                step: '1',
                title: 'Connect Your Stream',
                desc: 'Link your Twitch account in seconds. No complex setup, no API keys needed.',
                color: '#5EEAD4'
              },
              {
                step: '2',
                title: 'AI Analyzes in Real-Time',
                desc: 'Our AI processes every message for sentiment, questions, and engagement signals.',
                color: '#FF9F9F'
              },
              {
                step: '3',
                title: 'Get Insights & Alerts',
                desc: 'See live dashboards, get notified of important questions, track your stream\'s mood.',
                color: '#B8EE8A'
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#151E3C',
                  margin: '0 auto 1.5rem'
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#F7F7F7'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Showcase - Alternating Layout */}
        <section id="features" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 1.5rem'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              #features { padding: 6rem 2rem !important; }
              .feature-item { grid-template-columns: repeat(2, 1fr) !important; gap: 4rem !important; }
            }
            @media (max-width: 767px) {
              .feature-item { grid-template-columns: 1fr !important; gap: 2rem !important; }
              .feature-item > div { order: 1 !important; }
            }
          `}} />
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {[
              {
                title: 'Real-Time Sentiment Tracking',
                desc: 'Watch your chat\'s mood shift in real-time. See what\'s landing well and adjust on the fly.',
                image: '/sentiment-analysis.png',
                reverse: false,
                color: '#B8EE8A'
              },
              {
                title: 'Never Miss a Question',
                desc: 'AI highlights every question in chat and tracks your top chatters. Get alerts so you can respond fast, keep viewers engaged, and recognize your most active community members.',
                image: '/missedquestions-topchatters.png',
                reverse: true,
                color: '#FF9F9F'
              },
              {
                title: 'Live Chat Feed Analysis',
                desc: 'See every message analyzed for sentiment, questions, and engagement level in real-time.',
                image: '/live chat feed.png',
                reverse: false,
                color: '#5EEAD4'
              }
            ].map((feature, i) => (
              <div key={i} className="feature-item" style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2rem',
                alignItems: 'center',
                marginBottom: i < 2 ? '8rem' : '0',
                flexDirection: feature.reverse ? 'row-reverse' : 'row'
              }}>
                <div style={{ order: feature.reverse ? 2 : 1 }}>
                  <h3 style={{
                    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    color: feature.color
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.7',
                    marginBottom: '2rem'
                  }}>
                    {feature.desc}
                  </p>
                  <Link
                    href="/features"
                    style={{
                      color: feature.color,
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Learn more →
                  </Link>
                </div>
                <div style={{ order: feature.reverse ? 1 : 2 }}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '20px',
                      border: `2px solid ${feature.color}40`,
                      boxShadow: `0 30px 60px ${feature.color}20`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem'
            }}>
              Join the Beta Community
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Be among the first streamers to experience next-gen chat analytics
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🚀',
                title: 'Early Access',
                desc: 'Get exclusive access to all features during our beta testing phase'
              },
              {
                icon: '💬',
                title: 'Shape the Product',
                desc: 'Your feedback will directly influence the features we build'
              },
              {
                icon: '🎁',
                title: 'Special Pricing',
                desc: 'Lock in discounted rates as an early supporter when we launch'
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1.5rem'
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#F7F7F7'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Preview */}
        <section style={{
          padding: '6rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                Simple, Transparent Pricing
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Start free, scale as you grow
              </p>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @media (min-width: 768px) {
                .pricing-grid { grid-template-columns: repeat(3, 1fr) !important; }
              }
              @media (max-width: 767px) {
                .pricing-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
              }
            `}} />
            <div className="pricing-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
              alignItems: 'start',
              padding: '0 1rem'
            }}>
              {[
                {
                  name: 'Creator',
                  price: '£19',
                  period: 'per month',
                  features: ['Real-time sentiment analysis', 'Question detection', 'Live chat feed', 'Top chatters tracking', 'Email support'],
                  cta: 'Get Creator',
                  highlight: false
                },
                {
                  name: 'Pro',
                  price: '£37',
                  period: 'per month',
                  features: ['Everything in Creator', 'Advanced analytics', 'Missed questions alerts', 'Historical data', 'Priority support', 'Discord integration'],
                  cta: 'Get Pro',
                  highlight: true
                },
                {
                  name: 'Streamer+',
                  price: '£75',
                  period: 'per month',
                  features: ['Everything in Pro', 'OBS overlay widget', 'Custom alerts & notifications', 'API access', 'Multi-stream support', 'Dedicated support'],
                  cta: 'Get Streamer+',
                  highlight: false
                }
              ].map((plan, i) => (
                <div key={i} style={{
                  background: plan.highlight ? 'linear-gradient(135deg, rgba(105, 50, 255, 0.1), rgba(147, 47, 254, 0.1))' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  border: plan.highlight ? '2px solid #932FFE' : '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                      padding: '0.4rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: '#F7F7F7',
                    textAlign: 'center'
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{
                      fontSize: '3rem',
                      fontWeight: '700',
                      color: plan.highlight ? '#932FFE' : '#5EEAD4'
                    }}>
                      {plan.price}
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginLeft: '0.5rem'
                    }}>
                      {plan.period}
                    </span>
                  </div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    marginBottom: '2rem',
                    flex: 1
                  }}>
                    {plan.features.map((feature, j) => (
                      <li key={j} style={{
                        padding: '0.75rem 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: '#B8EE8A' }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '1rem',
                      background: plan.highlight ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'rgba(255, 255, 255, 0.1)',
                      border: plan.highlight ? 'none' : '2px solid rgba(94, 234, 212, 0.5)',
                      borderRadius: '50px',
                      textAlign: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      marginTop: 'auto'
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '3rem'
            }}>
              <Link
                href="/pricing"
                style={{
                  color: '#5EEAD4',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}
              >
                See full pricing details →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '6rem 2rem',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>
            Ready to Level Up Your Stream?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Join the beta and get 2 weeks free. No credit card required.
          </p>

          {/* Email Signup */}
          <form onSubmit={handleSubmit} style={{
            maxWidth: '500px',
            margin: '0 auto 2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                flex: '1 1 300px',
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '1rem 2.5rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
          {message && (
            <div style={{
              color: message.includes('🎉') || message.includes('🚀') ? '#B8EE8A' : '#FF9F9F',
              marginTop: '1rem',
              fontSize: '1rem'
            }}>
              {message}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 1.5rem 2rem'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              footer { padding: 4rem 2rem 2rem !important; }
              .footer-grid { grid-template-columns: repeat(4, 1fr) !important; }
            }
            @media (max-width: 767px) {
              .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
            }
          `}} />
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div className="footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <img src="/landing-logo.png" alt="Casi" style={{ height: '40px' }} />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: '1.7', maxWidth: '300px' }}>
                  Our mission: Transform how streamers connect with their communities through data-driven insights and AI-powered engagement optimisation.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#F7F7F7' }}>Product</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link href="/features" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Features</Link>
                  <Link href="/pricing" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                  <Link href="/beta" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Beta Program</Link>
                  <Link href="/dashboard" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#F7F7F7' }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Twitch Integration</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>OBS Widget</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Discord Bot</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>API Access</a>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#F7F7F7' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link href="/about" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
                  <Link href="/contact" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</a>
                  <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms</a>
                </div>
              </div>
            </div>

            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                © 2025 Casi. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.2rem' }}>𝕏</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.2rem' }}>📘</a>
                <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.2rem' }}>💬</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}