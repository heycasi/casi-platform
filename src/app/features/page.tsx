'use client'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'

export default function FeaturesPage() {
  return (
    <PageLayout>
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
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '2rem'
          }}>
            What <span style={{
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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

      {/* Feature 1: Sentiment Tracking */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              📈
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '700',
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
              {['Live sentiment analysis', 'Positive/neutral/negative breakdown', 'Historical trends & patterns'].map((item, i) => (
                <li key={i} style={{
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
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/sentimentanalysis.png"
              alt="Sentiment Analysis"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Feature 2: Question Detection */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div style={{ order: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              ❓
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '700',
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
              {['Automatic question detection', 'Priority-based alerts', 'Queue management system'].map((item, i) => (
                <li key={i} style={{
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
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ order: 1 }}>
            <img
              src="/missedquestions-topchatters.png"
              alt="Question Detection"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Feature 3: Live Chat Feed */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              💬
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Live Chat Feed
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              See your entire chat stream with sentiment indicators in real-time. Filter, search, and track top chatters all in one place.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Real-time chat monitoring', 'Sentiment indicators per message', 'Top chatters tracking'].map((item, i) => (
                <li key={i} style={{
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
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/livechatfeed.png"
              alt="Live Chat Feed"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
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
            {[
              { emoji: '🎥', title: 'OBS Overlay', desc: 'Real-time sentiment and question alerts directly in your stream overlay' },
              { emoji: '🤖', title: 'AI Suggested Responses', desc: 'Smart response suggestions to help you engage better with your community' },
              { emoji: '🌐', title: 'Multi-platform Dashboard', desc: 'Unified analytics across Twitch, YouTube, and Kick in one dashboard' }
            ].map((feature, i) => (
              <div key={i} style={{
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
                  fontWeight: '700',
                  margin: '0 auto 1rem'
                }}>
                  {feature.emoji}
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: 'white'
                }}>{feature.title}</h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  marginBottom: '1rem'
                }}>
                  {feature.desc}
                </p>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Coming Later
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: '700',
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
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(105, 50, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            Join Beta Program
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
