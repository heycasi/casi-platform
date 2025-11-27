'use client'
import PageLayout from '../../components/PageLayout'

export default function PrivacyPage() {
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
            Privacy{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Policy
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
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We collect information you provide directly to us, including when you create an account,
            connect your Twitch account, or contact us for support. This may include your email
            address, Twitch username, and stream analytics data.
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
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We use the information we collect to provide, maintain, and improve our services,
            including to process your streaming analytics, generate insights, and communicate with
            you about our services.
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
            3. Data Security
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet is 100% secure, and we
            cannot guarantee absolute security.
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
            4. Data Sharing
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell your personal information. We may share your information with service
            providers who assist us in operating our platform, processing payments, or analyzing
            data.
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
            5. Your Rights
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You have the right to access, correct, or delete your personal information. You may also
            object to or restrict certain processing of your data. To exercise these rights, please
            contact us at casi@heycasi.com.
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
            6. Cookies and Tracking
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We use cookies and similar tracking technologies to track activity on our service and
            store certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
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
            7. Changes to This Privacy Policy
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last updated" date.
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
            8. Contact Us
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
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
