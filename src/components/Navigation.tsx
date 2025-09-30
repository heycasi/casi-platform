'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/beta', label: 'Beta Program' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 2rem',
      fontFamily: 'Poppins, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo Section */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none'
        }}>
          <img
            src="/landing-logo.png"
            alt="Casi"
            style={{
              height: '50px',
              width: 'auto'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <img
            src="/landing-robot.png"
            alt="Casi Robot"
            style={{
              height: '45px',
              width: 'auto'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: pathname === link.href ? '#5EEAD4' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: pathname === link.href ? '600' : '500',
                transition: 'color 0.3s ease',
                position: 'relative',
                padding: '0.5rem 0'
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) {
                  e.currentTarget.style.color = '#5EEAD4'
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                }
              }}
            >
              {link.label}
              {pathname === link.href && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #5EEAD4, #932FFE)',
                  borderRadius: '2px'
                }} />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}