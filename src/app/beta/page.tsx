'use client'
import { useState } from 'react'
import Link from 'next/link'
import EmailCapture from '../../components/EmailCapture'

export default function BetaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "Will this impact my stream performance?",
      answer: "No! Casi runs entirely in the cloud. We connect to your chat via APIs, so there's no software to install and zero impact on your streaming performance or computer resources."
    },
    {
      question: "Which platforms are supported?",
      answer: "We currently support Twitch with full chat analysis. YouTube and Kick integration is coming during the beta period. All beta users get access to new platforms as they're added."
    },
    {
      question: "When will automation features arrive?",
      answer: "AI response suggestions and OBS overlays are planned for later releases. The beta focuses on core analytics (sentiment tracking and question detection) to ensure they work perfectly before adding automation features."
    },
    {
      question: "How much does the beta cost?",
      answer: "The beta is completely free for 2 weeks! No credit card required, just email signup. After beta, you can choose from our Creator (£19/mo), Pro (£37/mo), or Streamer+ (£75/mo) plans."
    },
    {
      question: "What happens to my data?",
      answer: "We analyze chat messages in real-time but don't store personal conversations. Only anonymized analytics and insights are kept. Your privacy and your viewers' privacy are our top priorities."
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, Arial, sans-serif',
      color: 'white'
    }}>
      {/* Hero Section */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '2rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            lineHeight: '1.2',
            marginBottom: '2rem'
          }}>
            Join the <span style={{
              background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Beta</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Get early access, help shape the roadmap, and lock in launch pricing. Beta is free for 2 weeks.
          </p>
        </div>
      </section>

      {/* Beta Benefits & Email Capture */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>

            {/* Benefits */}
            <div>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '2rem',
                color: 'white'
              }}>
                Why Join the Beta?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>Early Access to MVP Features</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6'
                    }}>Be among the first to use real-time sentiment tracking and question detection for your streams.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>Help Shape the Roadmap</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6'
                    }}>Your feedback directly influences which features we build next and how we prioritize development.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>Lock in Launch Pricing</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6'
                    }}>Beta users get access to special launch pricing when we exit beta. Plus, your first 2 weeks are completely free.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>Exclusive Discord Community</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6'
                    }}>Join our private Discord for beta users to share feedback, get support, and connect with other streamers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Capture */}
            <div style={{ paddingLeft: '2rem' }}>
              <EmailCapture
                source="beta-page"
                title="Start Your Free Beta"
                description="Join the exclusive beta program and start improving your stream today"
                buttonText="Join Beta Program"
              />
            </div>

          </div>
        </div>
      </section>

      {/* What You Get */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              What's Included in Beta
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>Full access to our MVP features</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                📈
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'white'
              }}>Real-time Sentiment Tracking</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                Watch your chat's mood change live with AI-powered sentiment analysis. See positive, neutral, and negative trends as they happen.
              </p>
              <ul style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.25rem' }}>• Live sentiment charts</li>
                <li style={{ marginBottom: '0.25rem' }}>• Historical data & trends</li>
                <li>• Emoji-based mood indicators</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                ❓
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'white'
              }}>Question Detection & Alerts</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                Never miss important questions from your viewers. Smart AI identifies and prioritizes questions that need your attention.
              </p>
              <ul style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.25rem' }}>• Automatic question detection</li>
                <li style={{ marginBottom: '0.25rem' }}>• Priority-based alerts</li>
                <li>• Queue management system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>Everything you need to know about the beta</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {faq.question}
                  <span style={{
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            Ready to transform your stream?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join the beta today and start getting insights that will change how you stream.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link
              href="#email-capture"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'opacity 0.3s ease'
              }}
              data-event="cta-beta-join"
            >
              Start Free Beta
            </Link>
            <Link
              href="/features"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '9999px',
                fontWeight: '500',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease'
              }}
              data-event="cta-beta-view-features"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}