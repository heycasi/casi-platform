'use client'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import BlurText from '../../components/BlurText'
import GradientText from '../../components/GradientText'

export default function FeaturesPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section
        style={{
          paddingTop: '3rem',
          paddingBottom: '2rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '2rem',
            }}
          >
            <BlurText text="What " delay={0} style={{ display: 'inline' }} />
            <GradientText animate={true}>Casi</GradientText>
            <BlurText text=" Does For You" delay={100} style={{ display: 'inline' }} />
          </h1>
          <BlurText
            text="Turn your stream chat into actionable insights with AI-powered analytics"
            delay={300}
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          />
        </div>
      </section>

      {/* Feature 1: Room Tone Monitor */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
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
                marginBottom: '1.5rem',
              }}
            >
              📈
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white',
              }}
            >
              <GradientText animate={false}>Room Tone Monitor</GradientText>
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              You can't read every message during a boss fight. Casi watches the emotional
              temperature of the room and alerts you if the vibe shifts, so you can adjust content
              before viewers leave.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Real-time emotional temperature check',
                'Instant vibe shift alerts',
                'Historical mood tracking',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <span
                    style={{
                      color: '#10b981',
                      marginRight: '0.75rem',
                      fontSize: '1.2rem',
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/images/feature-chat.jpg"
              alt="Room Tone Monitor"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Feature 2: Interaction Engine */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div style={{ order: 2 }}>
            <div
              style={{
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
                marginBottom: '1.5rem',
              }}
            >
              ❓
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white',
              }}
            >
              Interaction Engine
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              Turn chaotic chat into a structured Q&A. We filter out the noise and queue up genuine
              questions, turning your stream into a conversation, not just a broadcast.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Smart question filtering',
                'Priority queue for subscribers',
                'Conversation starter prompts',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <span
                    style={{
                      color: '#10b981',
                      marginRight: '0.75rem',
                      fontSize: '1.2rem',
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ order: 1 }}>
            <img
              src="/missedquestions-topchatters.png"
              alt="Interaction Engine"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Feature 3: Community CRM */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
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
                marginBottom: '1.5rem',
              }}
            >
              💬
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white',
              }}
            >
              Community CRM
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              Twitch highlights who pays (Subs). Casi highlights who engages (Super Fans). Identify
              the behavioral VIPs driving your chat so you can recognize them before they churn.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Behavioral VIP tracking',
                'Churn risk detection',
                'Engagement history per viewer',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <span
                    style={{
                      color: '#10b981',
                      marginRight: '0.75rem',
                      fontSize: '1.2rem',
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/livechatfeed.png"
              alt="Community CRM"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>
      </section>

      {/* The Data Safety Net Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
            >
              🏆
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1.5rem',
              }}
            >
              The Data Safety Net
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.8',
                marginBottom: '2rem',
              }}
            >
              Twitch deletes chat logs after 60 days. We store your history securely for the life of
              your account, allowing you to track year-over-year growth. 100% Your Data.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                color: '#5EEAD4',
                fontSize: '1.1rem',
              }}
            >
              <li style={{ marginBottom: '0.8rem' }}>✓ Lifetime chat history storage</li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Year-over-year growth tracking</li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Secure, exportable data</li>
            </ul>
          </div>
          <div>
            <img
              src="/images/feature-vip.jpg"
              alt="The Data Safety Net"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Chat Activity Timeline Section (Removed/Replaced) */}

      {/* Chat Highlights Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
            >
              💬
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1.5rem',
              }}
            >
              Chat Highlights
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.8',
                marginBottom: '2rem',
              }}
            >
              Discover memorable messages from your community - the funniest, most thoughtful,
              supportive, and hype moments.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                color: '#5EEAD4',
                fontSize: '1.1rem',
              }}
            >
              <li style={{ marginBottom: '0.8rem' }}>
                🤣 Funniest moments with high positive sentiment
              </li>
              <li style={{ marginBottom: '0.8rem' }}>💡 Most thoughtful questions from viewers</li>
              <li style={{ marginBottom: '0.8rem' }}>
                💜 Most supportive and encouraging messages
              </li>
              <li style={{ marginBottom: '0.8rem' }}>🔥 Peak hype moments during high activity</li>
            </ul>
          </div>
          <div>
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Get actionable community insights. Respond to specific messages, create content from
                highlights, and celebrate your most engaged viewers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
              }}
            >
              Coming Soon
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Features in development for future releases
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                emoji: '🎥',
                title: 'OBS Overlay',
                desc: 'Real-time sentiment and question alerts directly in your stream overlay',
              },
              {
                emoji: '🤖',
                title: 'AI Suggested Responses',
                desc: 'Smart response suggestions to help you engage better with your community',
              },
              {
                emoji: '🌐',
                title: 'Multi-platform Dashboard',
                desc: 'Unified analytics across Twitch and Kick (Available Now). YouTube coming soon.',
                status: 'Available Now',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  opacity: '0.8',
                }}
              >
                <div
                  style={{
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
                    margin: '0 auto 1rem',
                  }}
                >
                  {feature.emoji}
                </div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    color: 'white',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    marginBottom: '1rem',
                  }}
                >
                  {feature.desc}
                </p>
                <span
                  style={{
                    background:
                      feature.status === 'Available Now'
                        ? 'rgba(184, 238, 138, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                    color:
                      feature.status === 'Available Now' ? '#B8EE8A' : 'rgba(255, 255, 255, 0.8)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  {feature.status || 'Coming Later'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            Ready to upgrade your stream intelligence?
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          >
            Stop guessing what your chat wants. Start knowing.
          </p>

          <Link
            href="/signup"
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
              transition: 'all 0.3s ease',
            }}
          >
            Start Free Now
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
