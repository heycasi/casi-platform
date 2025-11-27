'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import AnimatedBackground from './AnimatedBackground'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
        color: '#F7F7F7',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Background Robot Mascot */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/landing-robot.png"
          alt=""
          style={{
            width: '800px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.08,
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.08;
            transform: scale(1);
          }
          50% {
            opacity: 0.12;
            transform: scale(1.02);
          }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(11, 13, 20, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem 1.5rem',
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (min-width: 768px) {
            header { padding: 1rem 3rem !important; }
          }
          @media (max-width: 767px) {
            .desktop-nav { display: none !important; }
            .mobile-logo { width: 120px !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-logo { width: 180px !important; }
            .mobile-menu-btn { display: none !important; }
          }
        `,
          }}
        />
        <div
          style={{
            maxWidth: '1800px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Centered Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              zIndex: 10,
            }}
          >
            <Image
              src="/landing-logo.svg"
              alt="Casi Logo"
              width={180}
              height={72}
              className="mobile-logo"
              style={{ height: 'auto', width: '180px' }}
              priority
            />
          </Link>

          {/* Right-aligned Navigation - Desktop Only */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              position: 'absolute',
              right: 0,
            }}
          >
            <Link
              href="/features"
              style={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              style={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Pricing
            </Link>
            <Link
              href="/login-email"
              style={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '0.65rem 1.5rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                borderRadius: '50px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Sign Up
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              position: 'absolute',
              right: 0,
              width: '2.5rem',
              height: '2.5rem',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1001,
            }}
            aria-label="Toggle mobile menu"
          >
            <div
              style={{
                width: '1.5rem',
                height: '2px',
                background: 'white',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'rotate(0)',
                marginBottom: '4px',
              }}
            />
            <div
              style={{
                width: '1.5rem',
                height: '2px',
                background: 'white',
                transition: 'all 0.3s ease',
                opacity: isMobileMenuOpen ? 0 : 1,
                marginBottom: '4px',
              }}
            />
            <div
              style={{
                width: '1.5rem',
                height: '2px',
                background: 'white',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'rotate(0)',
              }}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          style={{
            display: isMobileMenuOpen ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(26, 26, 26, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Link
            href="/features"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem',
            }}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem',
            }}
          >
            Pricing
          </Link>
          <Link
            href="/login-email"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.75rem',
            }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              borderRadius: '50px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(105, 50, 255, 0.4)',
              textAlign: 'center',
            }}
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '3rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(11, 13, 20, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <Image
                src="/landing-logo.svg"
                alt="Casi Logo"
                width={120}
                height={48}
                style={{ height: 'auto', width: '120px' }}
              />
            </div>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.6',
              }}
            >
              Your stream's brainy co-pilot. AI-powered chat analysis for better audience
              engagement.
            </p>
          </div>
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/features"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Pricing
              </Link>
              <Link
                href="/beta"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Beta
              </Link>
              <Link
                href="/dashboard"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/about"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                About
              </Link>
              <Link
                href="/contact"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Contact
              </Link>
              <a
                href="mailto:casi@heycasi.com"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                casi@heycasi.com
              </a>
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href="#"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
          }}
        >
          © 2024 Casi. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
