'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type Tab = 'profile' | 'integrations' | 'subscription' | 'security'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B0D14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/login-email'
    }
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B0D14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Redirecting to login...</div>
        <a href="/login-email" style={{ color: '#6932FF', textDecoration: 'underline' }}>
          Click here if not redirected
        </a>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0D14',
      color: 'white',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: '700' }}>
            My Account
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            Manage your profile, integrations, and subscription
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar Tabs */}
          <div style={{
            width: '240px',
            flexShrink: 0
          }}>
            <nav style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {[
                { id: 'profile' as Tab, label: 'Profile', icon: '👤' },
                { id: 'integrations' as Tab, label: 'Integrations', icon: '🔗' },
                { id: 'subscription' as Tab, label: 'Subscription & Billing', icon: '💳' },
                { id: 'security' as Tab, label: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    background: activeTab === tab.id
                      ? 'rgba(105, 50, 255, 0.2)'
                      : 'transparent',
                    border: activeTab === tab.id
                      ? '1px solid rgba(105, 50, 255, 0.5)'
                      : '1px solid transparent',
                    borderRadius: '8px',
                    color: activeTab === tab.id ? '#B8A3FF' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    marginBottom: '0.25rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '2rem'
            }}>
              {activeTab === 'profile' && <ProfileTab user={user} />}
              {activeTab === 'integrations' && <IntegrationsTab user={user} />}
              {activeTab === 'subscription' && <SubscriptionTab user={user} />}
              {activeTab === 'security' && <SecurityTab user={user} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }: { user: User }) {
  const [username, setUsername] = useState(user.user_metadata?.preferred_username || '')
  const [email, setEmail] = useState(user.email || '')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email,
        data: { preferred_username: username }
      })
      if (error) throw error
      alert('Profile updated successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    if (!confirm('Final warning: All your data will be permanently deleted. Continue?')) {
      return
    }

    // TODO: Implement account deletion API
    alert('Account deletion will be implemented with proper data cleanup')
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
        Profile Settings
      </h2>

      {/* Profile Picture */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Profile Picture
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              👤
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              {user.user_metadata?.avatar_url ? 'Profile picture from Twitch' : 'No profile picture'}
            </p>
          </div>
        </div>
      </div>

      {/* Username */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Timezone */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem'
          }}
        >
          {Intl.supportedValuesOf('timeZone').map((tz) => (
            <option key={tz} value={tz} style={{ background: '#1a1d2e' }}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div style={{
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Delete Account
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function IntegrationsTab({ user }: { user: User }) {
  const twitchConnected = !!user.app_metadata?.provider && user.app_metadata.provider === 'twitch'

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
        Integrations
      </h2>
      <p style={{ margin: '0 0 2rem 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', lineHeight: '1.6' }}>
        Casi connects securely with your Twitch and Discord. We never post on your behalf — integrations are used only for analytics and alerts.
      </p>

      {/* Twitch */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: '#9146FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📺
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Twitch</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: twitchConnected ? '#10b981' : 'rgba(255, 255, 255, 0.5)' }}>
                {twitchConnected ? '✓ Connected' : '○ Not Connected'}
              </p>
            </div>
          </div>
          {twitchConnected ? (
            <button
              onClick={() => alert('Disconnect functionality coming soon')}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/api/auth/twitch'}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#9146FF',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Connect Twitch
            </button>
          )}
        </div>
      </div>

      {/* Discord */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: '#5865F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💬
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Discord</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                ○ Not Connected
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Discord integration coming soon')}
            style={{
              padding: '0.625rem 1.25rem',
              background: '#5865F2',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Connect Discord
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        opacity: 0.6
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
          Coming Soon
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          YouTube, Kick, and more platforms
        </p>
      </div>
    </div>
  )
}

function SubscriptionTab({ user }: { user: User }) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [showInvoices, setShowInvoices] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'active')
        .single()

      setSubscription(data)
      setLoading(false)
    }
    fetchSubscription()
  }, [user.email])

  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url
      } else {
        alert(`Error: ${data.error || 'Failed to open customer portal'}`)
        setPortalLoading(false)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      setPortalLoading(false)
    }
  }

  const handleDownloadInvoices = async () => {
    setInvoicesLoading(true)
    setShowInvoices(true)
    try {
      const response = await fetch(`/api/invoices?email=${encodeURIComponent(user.email!)}`)
      const data = await response.json()

      if (response.ok && data.invoices) {
        setInvoices(data.invoices)
      } else {
        alert(`Error: ${data.error || 'Failed to fetch invoices'}`)
        setShowInvoices(false)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      setShowInvoices(false)
    } finally {
      setInvoicesLoading(false)
    }
  }

  if (loading) {
    return <div>Loading subscription...</div>
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
        Subscription & Billing
      </h2>

      {subscription ? (
        <>
          {/* Current Plan */}
          <div style={{
            background: 'rgba(105, 50, 255, 0.1)',
            border: '1px solid rgba(105, 50, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                  {subscription.plan_name} Plan
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div style={{
                background: '#10b981',
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Active
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: portalLoading ? 'not-allowed' : 'pointer',
                opacity: portalLoading ? 0.6 : 1
              }}
            >
              {portalLoading ? 'Opening Portal...' : 'Manage Subscription'}
            </button>
            <button
              onClick={handleDownloadInvoices}
              disabled={invoicesLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: invoicesLoading ? 'not-allowed' : 'pointer',
                opacity: invoicesLoading ? 0.6 : 1
              }}
            >
              {invoicesLoading ? 'Loading...' : 'Download Invoices'}
            </button>
          </div>
        </>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
            No Active Subscription
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            Upgrade to unlock advanced analytics and AI insights
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #6932FF, #932FFE)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View Plans
          </button>
        </div>
      )}

      {/* Feature Comparison */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
          Upgrade Benefits
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 1.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', lineHeight: '2' }}>
          <li>Advanced sentiment analysis</li>
          <li>Priority question alerts</li>
          <li>Export analytics reports</li>
          <li>Multi-platform dashboard</li>
          <li>Priority support</li>
        </ul>
      </div>

      {/* Invoice Modal */}
      {showInvoices && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowInvoices(false)}>
          <div style={{
            background: '#1a1d2e',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Your Invoices</h3>
              <button
                onClick={() => setShowInvoices(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {invoicesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Loading invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                No invoices found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {invoices.map((invoice) => (
                  <div key={invoice.id} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {invoice.description || 'Subscription Invoice'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {invoice.number ? `#${invoice.number}` : invoice.id}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                        {new Date(invoice.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                          {invoice.currency === 'gbp' ? '£' : invoice.currency === 'usd' ? '$' : '€'}
                          {invoice.amount_paid.toFixed(2)}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: invoice.status === 'paid' ? '#10b981' : '#f59e0b',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {invoice.status}
                        </div>
                      </div>
                      {invoice.pdf_url && (
                        <a
                          href={invoice.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0.625rem 1.25rem',
                            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SecurityTab({ user }: { user: User }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      alert('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
        Security
      </h2>

      {/* Password Reset */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
          Change Password
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button
          onClick={handlePasswordReset}
          disabled={updating || !newPassword || !confirmPassword}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: updating || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer',
            opacity: updating || !newPassword || !confirmPassword ? 0.6 : 1
          }}
        >
          {updating ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Two-Factor Auth (Coming Soon) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        opacity: 0.6
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
          Two-Factor Authentication
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          Coming soon - Add an extra layer of security to your account
        </p>
      </div>
    </div>
  )
}
