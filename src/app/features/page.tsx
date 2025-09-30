'use client'
import Link from 'next/link'
import DashboardMock from '../../components/DashboardMock'
import QuestionQueueMock from '../../components/QuestionQueueMock'

export default function FeaturesPage() {
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
        <div style={{ maxWidth: '4xl', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            lineHeight: '1.2',
            marginBottom: '2rem'
          }}>
            What <span style={{
              background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Casi</span> Does For You
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Turn your stream chat into actionable insights with AI-powered analytics
          </p>
        </div>
      </section>

      {/* MVP Features */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Real-time Sentiment Tracking */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '5rem'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem'
              }}>
                📈
              </div>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                Real-time Sentiment Tracking
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Watch your audience's mood change in real-time as you stream. Our AI analyzes every chat message to provide instant sentiment feedback.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Live sentiment analysis
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Positive/neutral/negative breakdown
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Historical trends & patterns
                </li>
              </ul>
            </div>
            <div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                  borderRadius: '0.5rem',
                  transform: 'rotate(1deg)',
                  opacity: '0.3'
                }}></div>
                <div style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <DashboardMock />
                </div>
              </div>
            </div>
          </div>

          {/* Question Detection & Alerts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div style={{ order: '2' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem'
              }}>
                ❓
              </div>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                Question Detection & Alerts
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Never miss important questions from your viewers. Smart AI identifies and prioritizes questions that need your attention.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Automatic question detection
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Priority-based alerts
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem'
                  }}>✓</span>
                  Queue management system
                </li>
              </ul>
            </div>
            <div style={{ order: '1' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                  borderRadius: '0.5rem',
                  transform: 'rotate(-1deg)',
                  opacity: '0.3'
                }}></div>
                <div style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <QuestionQueueMock variant="questions" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Coming Soon Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Coming Soon
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>Features in development for future releases</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* OBS Overlay */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              opacity: '0.8'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                🎥
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'white'
              }}>OBS Overlay</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                Real-time sentiment and question alerts directly in your stream overlay
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Coming Later
              </span>
            </div>

            {/* AI Suggested Responses */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              opacity: '0.8'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                🤖
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'white'
              }}>AI Suggested Responses</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                Smart response suggestions to help you engage better with your community
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Coming Later
              </span>
            </div>

            {/* Multi-platform Dashboard */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              opacity: '0.8'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                🌐
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'white'
              }}>Multi-platform Dashboard</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                Unified analytics across Twitch, YouTube, and Kick in one dashboard
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Coming Later
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
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
            Ready to get started?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join the beta to access these features and help shape the roadmap.
          </p>

          <Link
            href="/beta"
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
            data-event="cta-features-join-beta"
          >
            Join Beta Program
          </Link>
        </div>
      </section>
    </div>
  )
}