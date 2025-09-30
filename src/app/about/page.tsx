'use client'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'

export default function AboutPage() {
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
            About <span style={{
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Casi</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            We're building the future of streaming analytics to help creators connect better with their communities.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
        padding: '5rem 2rem',
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
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '2rem',
              color: 'white'
            }}>
              Our Mission
            </h2>
            <div style={{
              background: 'rgba(105, 50, 255, 0.1)',
              padding: '2rem',
              borderRadius: '12px',
              borderLeft: '4px solid #6932FF',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "Transform how streamers connect with their communities through data-driven insights and AI-powered engagement optimization."
              </p>
            </div>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6'
            }}>
              We believe every streamer deserves to understand their audience better. By providing real-time insights into chat sentiment and highlighting important questions, we help creators build stronger, more engaged communities.
            </p>
          </div>
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white'
              }}>Why We Built Casi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { emoji: '💬', title: 'Chat moves too fast', desc: 'Important questions and feedback get lost in busy streams' },
                  { emoji: '📊', title: 'No real-time feedback', desc: 'Streamers can\'t tell how their audience is reacting moment by moment' },
                  { emoji: '🎯', title: 'Limited insights', desc: 'Current tools don\'t provide actionable data about audience engagement' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      {item.emoji}
                    </div>
                    <div>
                      <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>{item.title}</strong>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Product Roadmap
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>Our journey from analytics to automation</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                emoji: '✓',
                title: 'Now',
                subtitle: 'Available in Beta',
                color: '#10b981',
                features: ['Real-time sentiment tracking', 'Question detection & alerts', 'Basic analytics dashboard']
              },
              {
                emoji: '🚀',
                title: 'Next',
                subtitle: 'Coming Soon',
                color: '#3b82f6',
                features: ['Multi-platform dashboard', 'Advanced trend analysis', 'Export & reporting tools']
              },
              {
                emoji: '🔮',
                title: 'Later',
                subtitle: 'Future Vision',
                color: '#932FFE',
                features: ['OBS overlay integration', 'AI response suggestions', 'Automated engagement tools']
              }
            ].map((phase, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '2rem',
                border: `2px solid ${phase.color}40`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: phase.color,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginRight: '1rem'
                  }}>
                    {phase.emoji}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>{phase.title}</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: phase.color
                    }}>{phase.subtitle}</p>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {phase.features.map((feature, j) => (
                    <li key={j} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      <span style={{
                        color: phase.color,
                        marginRight: '0.75rem',
                        fontSize: '1.2rem'
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Our Values
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>What drives us every day</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { emoji: '🎯', title: 'Creator-First', desc: 'Every feature we build starts with understanding what streamers actually need, not what sounds cool.' },
              { emoji: '🔒', title: 'Privacy-Focused', desc: 'We analyze data to provide insights, but never store personal conversations or compromise user privacy.' },
              { emoji: '⚡', title: 'Real-Time Performance', desc: 'Streaming is live, so our analytics are too. No delays, no lag, just instant insights when you need them.' }
            ].map((value, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: '0 auto 1rem'
                }}>
                  {value.emoji}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: 'white'
                }}>{value.title}</h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            Join us on this journey
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Help us build the future of streaming analytics by joining our beta program.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
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
            <Link
              href="/features"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '9999px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease'
              }}
            >
              See Features
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
