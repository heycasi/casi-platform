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

      {/* Feature 1: Sentiment Tracking */}
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
              <GradientText animate={false}>Real-time Sentiment Tracking</GradientText>
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              Watch your audience's mood change in real-time as you stream. Our AI analyzes every
              chat message to provide instant sentiment feedback.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Live sentiment analysis',
                'Positive/neutral/negative breakdown',
                'Historical trends & patterns',
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
              alt="Sentiment Analysis"
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

      {/* Feature 2: Question Detection */}
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
              Question Detection & Alerts
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              Never miss important questions from your viewers. Smart AI identifies and prioritizes
              questions that need your attention.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Automatic question detection',
                'Priority-based alerts',
                'Queue management system',
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
              alt="Question Detection"
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

      {/* Feature 3: Live Chat Feed */}
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
              Live Chat Feed
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              See your entire chat stream with sentiment indicators in real-time. Filter, search,
              and track top chatters all in one place.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Real-time chat monitoring',
                'Sentiment indicators per message',
                'Top chatters tracking',
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
              alt="Live Chat Feed"
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

      {/* Community MVPs Section */}
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
              Community MVPs
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.8',
                marginBottom: '2rem',
              }}
            >
              Discover your most active and loyal community members with detailed engagement
              analytics.
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
                ✓ Top chatters with message counts and stats
              </li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Recurring user detection across streams</li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Question and sentiment analysis per user</li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Medal rankings and achievement badges</li>
            </ul>
          </div>
          <div>
            <img
              src="/images/feature-vip.jpg"
              alt="Community MVPs"
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

      {/* Chat Activity Timeline Section */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
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
          <div style={{ order: 2 }}>
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                See exactly when your chat was most active. Perfect for finding the best moments to
                clip and understanding viewer engagement patterns.
              </p>
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
            >
              📊
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1.5rem',
              }}
            >
              Chat Activity Timeline
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.8',
                marginBottom: '2rem',
              }}
            >
              Visualize engagement patterns throughout your entire stream with smart highlights
              showing peak moments.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                color: '#5EEAD4',
                fontSize: '1.1rem',
              }}
            >
              <li style={{ marginBottom: '0.8rem' }}>✓ 2-minute activity buckets</li>
              <li style={{ marginBottom: '0.8rem' }}>
                ✓ Peak, high, medium, and low activity detection
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                ✓ Smart highlights showing key moments only
              </li>
              <li style={{ marginBottom: '0.8rem' }}>✓ Actual timestamps for easy VOD review</li>
            </ul>
          </div>
        </div>
      </section>

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
                desc: 'Unified analytics across Twitch, YouTube, and Kick in one dashboard',
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
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  Coming Later
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
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          >
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
              transition: 'all 0.3s ease',
            }}
          >
            Join Beta Program
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
