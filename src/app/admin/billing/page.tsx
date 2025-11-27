'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

const ADMIN_USERNAMES = ['conzooo_']

export default function AdminBillingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [eventLogs, setEventLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const twitchUserRaw = localStorage.getItem('twitch_user')
    if (twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        setTwitchUser(tu)
        setIsAuthenticated(true)
        const isAdminUser = ADMIN_USERNAMES.includes(tu.login?.toLowerCase())
        setIsAdmin(isAdminUser)
        if (!isAdminUser) router.push('/dashboard')
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    if (isAdmin && twitchUser) fetchBilling()
  }, [isAdmin, twitchUser])

  const fetchBilling = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/billing?adminUsername=${twitchUser.login}`)
      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
        setEventLogs(data.eventLogs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching billing:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPortalLink = async (customerId: string) => {
    try {
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: twitchUser.login,
          action: 'get_portal_link',
          customerId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Portal link error:', error)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: 'white',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
            💳 Subscription & Billing
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Monitor subscriptions and revenue
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: 'rgba(184, 238, 138, 0.1)',
                border: '1px solid rgba(184, 238, 138, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#B8EE8A' }}>
                {stats.active}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Active</div>
            </div>
            <div
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFD700' }}>
                ${stats.total_mrr}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                MRR (USD)
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 159, 159, 0.1)',
                border: '1px solid rgba(255, 159, 159, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FF9F9F' }}>
                {stats.canceled}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Canceled</div>
            </div>
            <div
              style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFA500' }}>
                {stats.past_due}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Past Due</div>
            </div>
          </div>
        )}

        {/* Subscriptions Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'auto',
              marginBottom: '2rem',
            }}
          >
            <h3
              style={{
                padding: '1rem',
                margin: 0,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Recent Subscriptions
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr
                  style={{
                    background: 'rgba(105, 50, 255, 0.2)',
                    borderBottom: '2px solid rgba(105, 50, 255, 0.3)',
                  }}
                >
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Tier</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Renewal</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 20).map((sub: any) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '1rem' }}>{sub.user_email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          background: '#B8A0FF',
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {sub.tier}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          background: sub.status === 'active' ? '#B8EE8A' : '#FF9F9F',
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {sub.stripe_status || sub.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {sub.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {sub.stripe_customer_id && (
                        <button
                          onClick={() => getPortalLink(sub.stripe_customer_id)}
                          style={{
                            background: 'linear-gradient(135deg, #6932FF, #932FFE)',
                            border: 'none',
                            color: 'white',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          💳 Stripe Portal
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Event Logs */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'auto',
          }}
        >
          <h3
            style={{
              padding: '1rem',
              margin: 0,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Recent Events
          </h3>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {eventLogs.slice(0, 30).map((log: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
                >
                  <div>
                    <span style={{ fontWeight: '600', color: 'white' }}>{log.event_type}</span>
                    {log.user_email && (
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginLeft: '0.5rem' }}>
                        • {log.user_email}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={fetchBilling}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
