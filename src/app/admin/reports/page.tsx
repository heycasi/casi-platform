'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

// Admin usernames (must match dashboard and API)
const ADMIN_USERNAMES = ['conzooo_']

interface DeliveryRecord {
  id: string
  session_id: string
  email: string
  delivery_status: 'sent' | 'failed' | 'resent'
  delivery_timestamp: string
  error_message?: string
  resent_by_admin?: string
  session?: {
    channel_name: string
    session_start: string
    session_end: string
    duration_minutes: number
  }
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed' | 'resent'>('all')

  // Check authentication
  useEffect(() => {
    const twitchUserRaw = localStorage.getItem('twitch_user')
    if (twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        setTwitchUser(tu)
        setIsAuthenticated(true)

        // Check admin status
        const isAdminUser = ADMIN_USERNAMES.includes(tu.login?.toLowerCase())
        setIsAdmin(isAdminUser)

        if (!isAdminUser) {
          router.push('/dashboard')
        }
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router])

  // Fetch delivery records
  useEffect(() => {
    if (isAdmin && twitchUser) {
      fetchDeliveries()
    }
  }, [isAdmin, twitchUser])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/resend-report?adminUsername=${twitchUser.login}`)
      const data = await response.json()

      if (data.success) {
        setDeliveries(data.deliveries)
      } else {
        console.error('Failed to fetch deliveries:', data.error)
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (sessionId: string, email: string) => {
    if (!confirm(`Resend report for session ${sessionId.slice(0, 8)}... to ${email}?`)) {
      return
    }

    try {
      setResendingId(sessionId)
      const response = await fetch('/api/admin/resend-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          adminUsername: twitchUser.login
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Report successfully resent to ${data.email}`)
        fetchDeliveries() // Refresh the list
      } else {
        alert(`❌ Failed to resend: ${data.error}`)
      }
    } catch (error) {
      console.error('Resend error:', error)
      alert('❌ Failed to resend report')
    } finally {
      setResendingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#B8EE8A'
      case 'resent': return '#5EEAD4'
      case 'failed': return '#FF9F9F'
      default: return '#999'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'sent': return '✅'
      case 'resent': return '🔄'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const filteredDeliveries = filterStatus === 'all'
    ? deliveries
    : deliveries.filter(d => d.delivery_status === filterStatus)

  if (!isAuthenticated || !isAdmin) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: 'white' }}>Loading...</div>
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
            📊 Report Deliveries
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Monitor and resend stream reports
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {(['all', 'sent', 'failed', 'resent'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status
                  ? 'linear-gradient(135deg, #6932FF, #932FFE)'
                  : 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
            >
              {status} ({status === 'all'
                ? deliveries.length
                : deliveries.filter(d => d.delivery_status === status).length})
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(184, 238, 138, 0.1)',
            border: '1px solid rgba(184, 238, 138, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#B8EE8A' }}>
              {deliveries.filter(d => d.delivery_status === 'sent').length}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Sent Successfully
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 159, 159, 0.1)',
            border: '1px solid rgba(255, 159, 159, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FF9F9F' }}>
              {deliveries.filter(d => d.delivery_status === 'failed').length}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Failed Deliveries
            </div>
          </div>
          <div style={{
            background: 'rgba(94, 234, 212, 0.1)',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#5EEAD4' }}>
              {deliveries.filter(d => d.delivery_status === 'resent').length}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Resent by Admin
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Loading deliveries...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              No {filterStatus !== 'all' && filterStatus} deliveries found
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(105, 50, 255, 0.2)',
                  borderBottom: '2px solid rgba(105, 50, 255, 0.3)'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Channel</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: getStatusColor(delivery.delivery_status),
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {getStatusEmoji(delivery.delivery_status)} {delivery.delivery_status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>
                      @{delivery.session?.channel_name || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {delivery.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      {new Date(delivery.delivery_timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {delivery.session?.duration_minutes
                        ? `${Math.floor(delivery.session.duration_minutes / 60)}h ${delivery.session.duration_minutes % 60}m`
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleResend(delivery.session_id, delivery.email)}
                        disabled={resendingId === delivery.session_id}
                        style={{
                          background: resendingId === delivery.session_id
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'linear-gradient(135deg, #6932FF, #932FFE)',
                          border: 'none',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: resendingId === delivery.session_id ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          opacity: resendingId === delivery.session_id ? 0.5 : 1
                        }}
                      >
                        {resendingId === delivery.session_id ? '⏳ Resending...' : '🔄 Resend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refresh Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={fetchDeliveries}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Refresh List
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
