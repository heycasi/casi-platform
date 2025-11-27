'use client'
import PageLayout from '../../components/PageLayout'

export default function TermsPage() {
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
            Terms of{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Service
            </span>
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.6',
            }}
          >
            Last updated: November 27, 2024
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section
        style={{
          paddingTop: '2rem',
          paddingBottom: '4rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.8',
          }}
        >
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            By accessing and using Casi's services, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to these terms, please do not use
            our services.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            2. Description of Service
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Casi provides streaming analytics and chat analysis tools for content creators. Our
            service includes real-time sentiment analysis, viewer engagement metrics, and AI-powered
            insights to help streamers better understand and engage with their audience.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            3. User Accounts
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You agree to immediately notify us of
            any unauthorized use of your account.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            4. Subscription and Payment
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Some features of our service require a paid subscription. By subscribing, you agree to
            pay the fees associated with your chosen plan. Subscription fees are billed in advance
            on a monthly or annual basis and are non-refundable.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            5. Acceptable Use
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You agree not to use our service for any unlawful purpose or in any way that could
            damage, disable, overburden, or impair our servers or networks. You may not attempt to
            gain unauthorized access to any part of our service.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            6. Intellectual Property
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            All content, features, and functionality of our service are owned by Casi and are
            protected by international copyright, trademark, and other intellectual property laws.
            You may not copy, modify, distribute, or create derivative works from our service.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            7. Limitation of Liability
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Casi shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages resulting from your use of or inability to use the service. Our total
            liability shall not exceed the amount paid by you for the service in the past 12 months.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            8. Termination
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right to terminate or suspend your account at any time for any reason,
            including if we believe you have violated these Terms of Service. Upon termination, your
            right to use the service will immediately cease.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            9. Changes to Terms
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right to modify these terms at any time. We will notify you of any
            changes by posting the new Terms of Service on this page. Your continued use of the
            service after such modifications constitutes your acceptance of the updated terms.
          </p>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            10. Contact Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a
              href="mailto:casi@heycasi.com"
              style={{ color: '#6932FF', textDecoration: 'underline' }}
            >
              casi@heycasi.com
            </a>
            .
          </p>
        </div>
      </section>
    </PageLayout>
  )
}
