'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

const ADMIN_USERNAMES = ['conzooo_']

interface User {
  id: string
  email: string
  twitch_username: string
  display_name: string
  avatar_url: string | null
  created_at: string
  last_sign_in_at: string
  subscription_tier: string
  subscription_status: string
  stripe_customer_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [twitchUser, setTwitchUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [stats, setStats] = useState<any>(null)
  const [actioningUserId, setActioningUserId] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    const twitchUserRaw = localStorage.getItem('twitch_user')
    if (twitchUserRaw) {
      try {
        const tu = JSON.parse(twitchUserRaw)
        setTwitchUser(tu)
        setIsAuthenticated(true)

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

  // Fetch users
  useEffect(() => {
    if (isAdmin && twitchUser) {
      fetchUsers()
    }
  }, [isAdmin, twitchUser, filterPlan])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/users?adminUsername=${twitchUser.login}&plan=${filterPlan}`
      )
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setStats(data.stats)
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (
    userId: string,
    email: string,
    action: 'suspend' | 'unsuspend' | 'delete'
  ) => {
    const confirmMessages = {
      suspend: `Suspend user ${email}? They will no longer be able to log in.`,
      unsuspend: `Unsuspend user ${email}? They will regain access.`,
      delete: `PERMANENTLY DELETE user ${email}? This cannot be undone!`,
    }

    if (!confirm(confirmMessages[action])) {
      return
    }

    try {
      setActioningUserId(userId)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: twitchUser.login,
          action,
          userId,
          email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchUsers() // Refresh the list
      } else {
        alert(`❌ Failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Action error:', error)
      alert('❌ Failed to perform action')
    } finally {
      setActioningUserId(null)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'creator':
        return '#B8A0FF'
      case 'pro':
        return '#FF9FD4'
      case 'streamer+':
        return '#FFD700'
      default:
        return '#999'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#B8EE8A'
      case 'canceled':
        return '#FF9F9F'
      case 'past_due':
        return '#FFA500'
      case 'trialing':
        return '#5EEAD4'
      default:
        return '#999'
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
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
            👥 User Management
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Manage all registered users and their subscriptions
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#5EEAD4' }}>
                {stats.total}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                Total Users
              </div>
            </div>
            <div
              style={{
                background: 'rgba(184, 160, 255, 0.1)',
                border: '1px solid rgba(184, 160, 255, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#B8A0FF' }}>
                {stats.starter}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                Starter
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 159, 212, 0.1)',
                border: '1px solid rgba(255, 159, 212, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FF9FD4' }}>
                {stats.pro}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                Pro
              </div>
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
                {stats.agency}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                Agency
              </div>
            </div>
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
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                Active Subs
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap',
          }}
        >
          {['all', 'Starter', 'Pro', 'Agency', 'None'].map((plan) => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              style={{
                background:
                  filterPlan === plan ? 'linear-gradient(135deg, #6932FF, #932FFE)' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease',
              }}
            >
              {plan === 'all' ? 'All Users' : plan}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No users found</div>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(105, 50, 255, 0.2)',
                    borderBottom: '2px solid rgba(105, 50, 255, 0.3)',
                  }}
                >
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Twitch</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Tier</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {user.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: '2px solid rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: 'white' }}>
                            {user.display_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      @{user.twitch_username}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          background: getTierColor(user.subscription_tier),
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'inline-block',
                        }}
                      >
                        {user.subscription_tier}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          background: getStatusColor(user.subscription_status),
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'inline-block',
                        }}
                      >
                        {user.subscription_status}
                      </span>
                      {user.cancel_at_period_end && (
                        <div style={{ fontSize: '0.7rem', color: '#FFA500', marginTop: '0.25rem' }}>
                          Cancels {new Date(user.current_period_end!).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleUserAction(user.id, user.email, 'suspend')}
                          disabled={actioningUserId === user.id}
                          style={{
                            background: 'rgba(255, 165, 0, 0.2)',
                            border: '1px solid rgba(255, 165, 0, 0.4)',
                            color: '#FFA500',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: actioningUserId === user.id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            opacity: actioningUserId === user.id ? 0.5 : 1,
                          }}
                        >
                          🚫 Suspend
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, user.email, 'delete')}
                          disabled={actioningUserId === user.id}
                          style={{
                            background: 'rgba(255, 159, 159, 0.2)',
                            border: '1px solid rgba(255, 159, 159, 0.4)',
                            color: '#FF9F9F',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: actioningUserId === user.id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            opacity: actioningUserId === user.id ? 0.5 : 1,
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
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
            onClick={fetchUsers}
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
            🔄 Refresh List
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
