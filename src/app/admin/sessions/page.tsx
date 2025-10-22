'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

const ADMIN_USERNAMES = ['conzooo_']

export default function AdminSessionsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

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
    if (isAdmin && twitchUser) fetchSessions()
  }, [isAdmin, twitchUser])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/sessions?adminUsername=${twitchUser.login}`)
      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (sessionId: string, action: 'delete' | 'regenerate_analytics') => {
    const messages = {
      delete: 'Delete this session and all related data? This cannot be undone!',
      regenerate_analytics: 'Regenerate analytics for this session?'
    }

    if (!confirm(messages[action])) return

    try {
      setActioningId(sessionId)
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: twitchUser.login,
          action,
          sessionId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchSessions()
      } else {
        alert(`❌ Failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Action error:', error)
      alert('❌ Failed to perform action')
    } finally {
      setActioningId(null)
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: 'white' }}>Loading...</div>
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
            🎮 Stream Sessions
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Monitor all streaming sessions and analytics
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(94, 234, 212, 0.1)',
              border: '1px solid rgba(94, 234, 212, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#5EEAD4' }}>{stats.total_sessions}</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Total Sessions</div>
            </div>
            <div style={{
              background: 'rgba(184, 238, 138, 0.1)',
              border: '1px solid rgba(184, 238, 138, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#B8EE8A' }}>{stats.reports_sent}</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Reports Sent</div>
            </div>
            <div style={{
              background: 'rgba(255, 159, 159, 0.1)',
              border: '1px solid rgba(255, 159, 159, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FF9F9F' }}>{stats.total_messages.toLocaleString()}</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Total Messages</div>
            </div>
            <div style={{
              background: 'rgba(147, 47, 254, 0.1)',
              border: '1px solid rgba(147, 47, 254, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#932FFE' }}>{Math.round(stats.avg_duration)} min</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>Avg Duration</div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(105, 50, 255, 0.2)',
                  borderBottom: '2px solid rgba(105, 50, 255, 0.3)'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Channel</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Start Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Messages</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Report</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session: any) => (
                  <tr key={session.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>@{session.channel_name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {new Date(session.session_start).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {Math.floor((session.duration_minutes || 0) / 60)}h {(session.duration_minutes || 0) % 60}m
                    </td>
                    <td style={{ padding: '1rem' }}>{(session.total_messages || 0).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: session.report_sent ? '#B8EE8A' : '#FF9F9F',
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {session.report_sent ? '✅ Sent' : '❌ Not Sent'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleAction(session.id, 'regenerate_analytics')}
                          disabled={actioningId === session.id}
                          style={{
                            background: 'rgba(94, 234, 212, 0.2)',
                            border: '1px solid rgba(94, 234, 212, 0.4)',
                            color: '#5EEAD4',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: actioningId === session.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            opacity: actioningId === session.id ? 0.5 : 1
                          }}
                        >
                          🔄 Regen
                        </button>
                        <button
                          onClick={() => handleAction(session.id, 'delete')}
                          disabled={actioningId === session.id}
                          style={{
                            background: 'rgba(255, 159, 159, 0.2)',
                            border: '1px solid rgba(255, 159, 159, 0.4)',
                            color: '#FF9F9F',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: actioningId === session.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            opacity: actioningId === session.id ? 0.5 : 1
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={fetchSessions}
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
            🔄 Refresh
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
