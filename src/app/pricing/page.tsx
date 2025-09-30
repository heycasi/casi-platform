'use client'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import PricingTable from '../../components/PricingTable'

export default function PricingPage() {
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
            Simple, <span style={{
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Transparent</span> Pricing
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Choose the plan that fits your streaming goals. Start with our free beta.
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section style={{
        paddingTop: '3rem',
        paddingBottom: '5rem',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <PricingTable />
      </section>

      {/* FAQ Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>Everything you need to know about pricing</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              {
                q: 'How does the beta pricing work?',
                a: 'The beta is completely free for your first 2 weeks. No credit card required, just email signup. You can test all MVP features and help shape the product roadmap. After beta, you can choose any paid plan to continue.'
              },
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the billing accordingly.'
              },
              {
                q: 'What happens if I exceed my message limits?',
                a: 'We\'ll notify you when you\'re approaching your limit. If you exceed it, we\'ll continue processing but may suggest upgrading to a higher tier for consistent performance.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.'
              },
              {
                q: 'Which platforms are supported?',
                a: 'Currently, we support Twitch with YouTube and Kick coming during the beta period. All plans include access to new platforms as they\'re added.'
              }
            ].map((faq, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.75rem'
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.6'
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            Ready to start your free beta?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join streamers who are already improving their audience engagement.
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
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease'
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
