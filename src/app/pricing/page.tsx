'use client'
import Link from 'next/link'
import PricingTable from '../../components/PricingTable'

export default function PricingPage() {
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
            Simple, <span style={{
              background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
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
        paddingTop: '5rem',
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
              fontWeight: 'bold',
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
            <div style={{
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
                How does the beta pricing work?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                The beta is completely free for your first 2 weeks. No credit card required, just email signup.
                You can test all MVP features and help shape the product roadmap. After beta, you can choose
                any paid plan to continue.
              </p>
            </div>

            <div style={{
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
                Can I change plans anytime?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we'll prorate the billing accordingly.
              </p>
            </div>

            <div style={{
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
                What happens if I exceed my message limits?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                We'll notify you when you're approaching your limit. If you exceed it, we'll continue
                processing but may suggest upgrading to a higher tier for consistent performance.
              </p>
            </div>

            <div style={{
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
                Do you offer refunds?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied,
                contact us for a full refund.
              </p>
            </div>

            <div style={{
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
                Which platforms are supported?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                Currently, we support Twitch with YouTube and Kick coming during the beta period.
                All plans include access to new platforms as they're added.
              </p>
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
            Ready to start your free beta?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join thousands of streamers who are already improving their audience engagement.
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
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'opacity 0.3s ease'
              }}
              data-event="cta-pricing-join-beta"
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
              data-event="cta-pricing-view-features"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}