'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PageLayout from '../../../components/PageLayout'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setError('No session ID found')
      setLoading(false)
      return
    }

    // Verify the session with Stripe
    fetch(`/api/verify-checkout-session?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setCustomerEmail(data.customer_email)
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to verify payment')
        setLoading(false)
      })
  }, [searchParams])

  return (
    <PageLayout>
      <section style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '1rem',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {loading ? (
            <>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                borderTop: '4px solid #6932FF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 2rem'
              }} />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Verifying your payment...
              </h1>
            </>
          ) : error ? (
            <>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>⚠️</div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Payment Verification Failed
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                {error}
              </p>
              <Link
                href="/pricing"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease'
                }}
              >
                Back to Pricing
              </Link>
            </>
          ) : (
            <>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>🎉</div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Payment Successful!
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Thank you for subscribing to Casi!
                {customerEmail && (
                  <><br />A confirmation email has been sent to <strong>{customerEmail}</strong></>
                )}
              </p>

              <div style={{
                background: 'rgba(94, 234, 212, 0.1)',
                border: '1px solid rgba(94, 234, 212, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#5EEAD4',
                  marginBottom: '1rem'
                }}>
                  Next Steps:
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '2'
                }}>
                  <li>✓ Connect your Twitch account</li>
                  <li>✓ Set up your dashboard preferences</li>
                  <li>✓ Start tracking your stream chat</li>
                </ul>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/"
                  style={{
                    display: 'inline-block',
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '0.5rem',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </PageLayout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
        </div>
      </PageLayout>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
