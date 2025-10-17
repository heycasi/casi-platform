'use client'
import { useState } from 'react'

export default function PricingTable() {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const tiers = [
    {
      name: 'Creator',
      monthlyPrice: 19,
      yearlyPrice: 190,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY || 'price_1Rlx2DEEgFiyIrnTAomiE2J3',
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY || 'price_1Rlx2DEEgFiyIrnTGQZSVs8q',
      description: 'Perfect for growing streamers',
      viewerLimit: '50 avg viewers',
      features: [
        'Up to 50 average viewers',
        'Real-time sentiment tracking',
        'Question detection & alerts',
        'Basic analytics dashboard',
        'Email support',
        'Up to 1,000 messages/hour'
      ],
      cta: 'Start Creator Plan',
      popular: false
    },
    {
      name: 'Pro',
      monthlyPrice: 37,
      yearlyPrice: 370,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1RlxA7EEgFiyIrnTVR20se38',
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1RlxA7EEgFiyIrnTSuiyywVq',
      description: 'For serious content creators',
      viewerLimit: '250 avg viewers',
      features: [
        'Up to 250 average viewers',
        'Everything in Creator',
        'Advanced sentiment analysis',
        'Priority question alerts',
        'Export analytics reports',
        'Priority support',
        'Up to 5,000 messages/hour',
        'Multi-platform dashboard'
      ],
      cta: 'Start Pro Plan',
      popular: true
    },
    {
      name: 'Streamer+',
      monthlyPrice: 75,
      yearlyPrice: 750,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY || 'price_1RlzDHEEgFiyIrnThpPdz7gV',
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY || 'price_1RlzDHEEgFiyIrnT45NkAklL',
      description: 'For top-tier streamers',
      viewerLimit: 'Unlimited',
      features: [
        'Unlimited average viewers',
        'Everything in Pro',
        'AI response suggestions',
        'OBS overlay integration',
        'Custom alerts & webhooks',
        'Dedicated account manager',
        'Unlimited messages',
        'White-label options',
        'API access'
      ],
      cta: 'Start Streamer+ Plan',
      popular: false
    }
  ]

  const handleCheckout = async (tier: typeof tiers[0]) => {
    try {
      setLoadingPlan(tier.name)
      const priceId = isYearly ? tier.yearlyPriceId : tier.monthlyPriceId

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
      {/* Billing Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'inline-flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setIsYearly(false)}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease',
              background: !isYearly ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: !isYearly ? '0 4px 15px rgba(105, 50, 255, 0.4)' : 'none'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease',
              background: isYearly ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: isYearly ? '0 4px 15px rgba(105, 50, 255, 0.4)' : 'none'
            }}
          >
            Yearly
            <span style={{
              fontSize: '0.75rem',
              background: '#10b981',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
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
              transition: 'transform 0.3s ease'
            }}
          >
            {tier.popular && (
              <div style={{
                position: 'absolute',
                top: '-1rem',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                <span style={{
                  background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Most Popular
                </span>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem'
              }}>{tier.name}</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '0.5rem'
              }}>{tier.description}</p>
              <div style={{
                background: tier.viewerLimit === 'Unlimited'
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'rgba(94, 234, 212, 0.2)',
                border: tier.viewerLimit === 'Unlimited'
                  ? '1px solid rgba(255, 215, 0, 0.4)'
                  : '1px solid rgba(94, 234, 212, 0.4)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                marginBottom: '1rem',
                display: 'inline-block'
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: tier.viewerLimit === 'Unlimited' ? '#000' : '#5EEAD4'
                }}>
                  {tier.viewerLimit === 'Unlimited' ? '♾️ ' : '👥 '}{tier.viewerLimit}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'white'
                }}>
                  £{isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  /{isYearly ? 'year' : 'month'}
                </span>
                {isYearly && (
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#10b981',
                    marginTop: '0.25rem'
                  }}>
                    Save £{(tier.monthlyPrice * 12) - tier.yearlyPrice} per year
                  </div>
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
                  opacity: loadingPlan !== null && loadingPlan !== tier.name ? 0.5 : 1
                }}
                data-event={`cta-pricing-${tier.name.toLowerCase()}`}
              >
                {loadingPlan === tier.name ? 'Loading...' : tier.cta}
              </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tier.features.map((feature, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{
                    color: '#10b981',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem',
                    marginTop: '0.125rem'
                  }}>✓</span>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.5'
                  }}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Beta Note */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(94, 234, 212, 0.1)',
          borderRadius: '0.75rem',
          padding: '2rem',
          border: '1px solid rgba(94, 234, 212, 0.3)'
        }}>
          <h4 style={{
            fontWeight: '700',
            color: '#5EEAD4',
            marginBottom: '0.5rem',
            fontSize: '1.2rem'
          }}>
            Beta Pricing
          </h4>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6'
          }}>
            🎉 Beta is free for your first 2 weeks — email signup only. No card required.
            <br />
            Lock in these launch prices during the beta period!
          </p>
        </div>
      </div>
    </div>
  )
}