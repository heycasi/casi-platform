'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/users', label: '👥 Users', icon: '👥' },
    { href: '/admin/billing', label: '💳 Billing', icon: '💳' },
    { href: '/admin/sessions', label: '🎮 Sessions', icon: '🎮' },
    { href: '/admin/reports', label: '📊 Reports', icon: '📊' },
    { href: '/admin/logs', label: '📝 Logs', icon: '📝' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Poppins, sans-serif',
      color: 'white'
    }}>
      {/* Top Header */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🛠️ Admin Dashboard
          </h1>
        </div>
        <Link
          href="/dashboard"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          ← Main Dashboard
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 2rem',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '1rem 1.5rem',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                borderBottom: isActive ? '3px solid #FFD700' : '3px solid transparent',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {children}
      </div>
    </div>
  )
}
