'use client'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import PricingTable from '../../components/PricingTable'
import BlurText from '../../components/BlurText'
import GradientText from '../../components/GradientText'

export default function PricingPage() {
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
            <BlurText text="Simple, " delay={0} style={{ display: 'inline' }} />
            <GradientText animate={true}>Transparent</GradientText>
            <BlurText text=" Pricing" delay={100} style={{ display: 'inline' }} />
          </h1>
          <BlurText
            text="Choose the plan that fits your streaming goals. Start free, upgrade when you're ready to scale."
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

      {/* Pricing Table */}
      <section
        style={{
          paddingTop: '3rem',
          paddingBottom: '5rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
      >
        <PricingTable />
      </section>

      {/* FAQ Section */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Everything you need to know about pricing
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              {
                q: 'Can I try HeyCasi for free?',
                a: 'Yes! Our Starter plan is completely free forever. No credit card required. You get instant sentiment detection, unlimited messages, and 24-hour history. Perfect for testing the platform before upgrading.',
              },
              {
                q: 'Can I change plans anytime?',
                a: "Absolutely. Upgrade or downgrade anytime. Changes take effect immediately, and we'll prorate the billing accordingly. No lock-in contracts.",
              },
              {
                q: 'Why is HeyCasi faster than other tools?',
                a: "We don't use GPT-4 or external AI APIs for sentiment analysis. Our custom gaming slang dictionary and rule-based engine delivers sub-millisecond analysis. Zero API delays. Zero training data. Pure speed.",
              },
              {
                q: 'Do you offer refunds?',
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund. No questions asked.",
              },
              {
                q: 'Which platforms are supported?',
                a: 'Currently: Twitch (full support) and Kick (Available on Pro+). YouTube support coming Q2 2025. All plans automatically get access to new platforms as they launch.',
              },
              {
                q: 'What about data privacy?',
                a: 'Your chat data is never used to train AI models. We process messages in real-time and discard them after analysis. OAuth secured. COPPA compliant. Your streams stay yours.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.75rem',
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
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
            <GradientText animate={true}>Ready to stop missing opportunities?</GradientText>
          </h2>
          <BlurText
            text="Start free. Upgrade when you're crushing it."
            delay={200}
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
              Start Free
            </Link>
            <Link
              href="/#features"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '9999px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease',
              }}
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
