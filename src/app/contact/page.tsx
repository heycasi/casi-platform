'use client'
import { useState } from 'react'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitMessage('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitMessage("Thank you for your message! We'll get back to you within 24 hours.")
      setIsSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitMessage('Something went wrong. Please try again or email us directly.')
    }

    setIsSubmitting(false)
  }

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
            Get in{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Touch
            </span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Have questions about Casi? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section
        style={{
          padding: '5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '3rem',
          }}
        >
          {/* Contact Form */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Send us a message
            </h2>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting
                    ? 'rgba(105, 50, 255, 0.5)'
                    : 'linear-gradient(135deg, #6932FF, #932FFE)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '700',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {submitMessage && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isSuccess ? '#10B981' : '#EF4444',
                    border: isSuccess
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '2rem',
                color: 'white',
              }}
            >
              Other ways to reach us
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}
                >
                  ✉️
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Email
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '0.5rem',
                      lineHeight: '1.6',
                    }}
                  >
                    For general inquiries, partnerships, or support
                  </p>
                  <a
                    href="mailto:casi@heycasi.com"
                    style={{
                      color: '#932FFE',
                      fontWeight: '600',
                      textDecoration: 'none',
                    }}
                  >
                    casi@heycasi.com
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '1rem',
                  }}
                >
                  Response Times
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {['Email: Within 24 hours', 'Contact form: Within 24 hours'].map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <span
                        style={{
                          color: '#10b981',
                          marginRight: '0.5rem',
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

              {/* Social Links */}
              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '1rem',
                  }}
                >
                  Follow our updates
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href="https://twitter.com/HeyCasi_"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: '#1DA1F2',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    𝕏
                  </a>
                  <a
                    href="https://linkedin.com/company/heycasi"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: '#0A66C2',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Quick Answers
            </h2>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Common questions before you reach out
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                q: 'How fast do you respond to support requests?',
                a: 'We respond to emails and contact forms within 24 hours.',
              },
              {
                q: 'Do you offer custom integrations for large streamers?',
                a: 'Yes! We work with larger creators on custom solutions. Reach out via email with details about your needs and audience size.',
              },
              {
                q: 'Can I get a demo before signing up for beta?',
                a: 'Absolutely! Check out our dashboard preview or email us to schedule a personalized demo.',
              },
              {
                q: 'How do I report a bug or suggest a feature?',
                a: 'Use this contact form for detailed feedback or bug reports.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
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
                    color: 'rgba(255, 255, 255, 0.7)',
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
            Ready to get started instead?
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          >
            Start analyzing your stream in seconds. Zero-latency insights, real-time analytics, no
            guessing.
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
