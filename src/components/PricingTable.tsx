'use client'
import { useState } from 'react'

export default function PricingTable() {
  const [currency, setCurrency] = useState<'USD' | 'GBP'>('USD')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const PRICING_CONFIG = {
    USD: {
      symbol: '$',
      pro: {
        price: '11.99',
        priceId: 'price_1SXiU8EEgFiyIrnTCRvQSSbj',
      },
      agency: {
        price: '49.99',
        priceId: 'price_1SXiWlEEgFiyIrnTxdUtTCZN',
      },
    },
    GBP: {
      symbol: '£',
      pro: {
        price: '9.99',
        priceId: 'price_1SXiU8EEgFiyIrnT7IaBAdsW',
      },
      agency: {
        price: '39.99',
        priceId: 'price_1SXiWlEEgFiyIrnTGeLeMEPT',
      },
    },
  }

  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      priceId: null,
      description: 'The Safety Net',
      features: [
        'Unlimited Messages',
        'Instant Sentiment Detection',
        '24-Hour History',
        'Twitch Only',
      ],
      cta: 'Start Free',
      popular: false,
      ctaLink: '/signup',
    },
    {
      name: 'Pro',
      price: PRICING_CONFIG[currency].pro.price,
      priceId: PRICING_CONFIG[currency].pro.priceId,
      description: 'The Co-Pilot',
      features: [
        'Everything in Free',
        'Unlimited History',
        'VIP Tracking',
        'Gaming Slang Dictionary',
        'Multi-Platform (Kick Beta)',
      ],
      cta: 'Get Pro',
      popular: true,
      ctaLink: null,
    },
    {
      name: 'Agency',
      price: PRICING_CONFIG[currency].agency.price,
      priceId: PRICING_CONFIG[currency].agency.priceId,
      description: 'Mission Control',
      features: ['Manage 5 Channels', 'White Label Reports', 'API Access', 'Priority Support'],
      cta: 'Get Agency',
      popular: false,
      ctaLink: null,
    },
  ]

  const handleCheckout = async (tier: (typeof tiers)[0]) => {
    // If it's the free tier, redirect to signup
    if (tier.ctaLink) {
      window.location.href = tier.ctaLink
      return
    }

    try {
      setLoadingPlan(tier.name)
      const priceId = tier.priceId

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(`Failed to start checkout: ${error.message}`)
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      {/* Currency Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'inline-flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => setCurrency('USD')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease',
              background:
                currency === 'USD' ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: currency === 'USD' ? '0 4px 15px rgba(105, 50, 255, 0.4)' : 'none',
            }}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('GBP')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease',
              background:
                currency === 'GBP' ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: currency === 'GBP' ? '0 4px 15px rgba(105, 50, 255, 0.4)' : 'none',
            }}
          >
            GBP (£)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              border: tier.popular ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '2rem',
              transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            {tier.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Most Popular
                </span>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.5rem',
                }}
              >
                {tier.name}
              </h3>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem',
                }}
              >
                {tier.description}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                {tier.price === 'Free' ? (
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: 'white',
                    }}
                  >
                    Free
                  </span>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'white',
                      }}
                    >
                      {PRICING_CONFIG[currency].symbol}
                      {tier.price.split('.')[0]}
                    </span>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      .{tier.price.split('.')[1]}
                    </span>
                    <span
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.95rem',
                      }}
                    >
                      /month
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => handleCheckout(tier)}
                disabled={loadingPlan !== null}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  transition: 'opacity 0.3s ease',
                  marginBottom: '1.5rem',
                  background: tier.popular
                    ? 'linear-gradient(45deg, #8b5cf6, #ec4899)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: tier.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: loadingPlan !== null ? 'not-allowed' : 'pointer',
                  opacity: loadingPlan !== null && loadingPlan !== tier.name ? 0.5 : 1,
                }}
                data-event={`cta-pricing-${tier.name.toLowerCase()}`}
              >
                {loadingPlan === tier.name ? 'Loading...' : tier.cta}
              </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tier.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      color: '#10b981',
                      marginRight: '0.75rem',
                      fontSize: '1.2rem',
                      marginTop: '0.125rem',
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.5',
                    }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div
          style={{
            background: 'rgba(94, 234, 212, 0.1)',
            borderRadius: '0.75rem',
            padding: '2rem',
            border: '1px solid rgba(94, 234, 212, 0.3)',
          }}
        >
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.8',
              fontSize: '1rem',
            }}
          >
            All paid plans include real-time chat analysis, 13+ language support, and secure
            authentication.
            <br />
            <span
              style={{
                color: '#5EEAD4',
                fontWeight: '600',
                marginTop: '0.5rem',
                display: 'inline-block',
              }}
            >
              No credit card required for free tier • Cancel anytime
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
