'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import FeatureGate from '@/components/FeatureGate'
import AddTalentModal from '@/components/agency/AddTalentModal'
import TalentTable from '@/components/agency/TalentTable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Organization {
  id: string
  name: string
  logo_url?: string
  created_at: string
}

interface TalentMember {
  userId: string
  email: string
  displayName?: string
  avatarUrl?: string
  channelName?: string
  stats: {
    totalSessions: number
    totalMessages: number
    avgViewers: number
    lastStreamDate: string | null
    lastStreamDuration: number
    bestStreamMessages: number
    bestStreamDate: string | null
  }
  recentSessions: any[]
}

interface OrganizationTotals {
  totalSessions: number
  totalMessages: number
  avgViewersAcrossAllTalent: number
  activeTalent: number
}

export default function AgencyDashboard() {
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [talent, setTalent] = useState<TalentMember[]>([])
  const [orgTotals, setOrgTotals] = useState<OrganizationTotals | null>(null)
  const [showAddTalentModal, setShowAddTalentModal] = useState(false)
  const [currentTier, setCurrentTier] = useState<'Starter' | 'Pro' | 'Agency'>('Starter')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      // Fetch organization details
      const orgResponse = await fetch('/api/agency/organization', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const orgData = await orgResponse.json()

      if (!orgData.organization) {
        // No organization - redirect to main dashboard
        window.location.href = '/dashboard'
        return
      }

      if (orgData.role !== 'owner') {
        // Not an owner - redirect to main dashboard
        window.location.href = '/dashboard'
        return
      }

      setOrganization(orgData.organization)
      setIsOwner(true)
      setCurrentTier('Agency')

      // Fetch talent analytics
      await fetchTalentAnalytics(session.access_token, orgData.organization.id)
    } catch (error) {
      console.error('Error checking access:', error)
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  async function fetchTalentAnalytics(token: string, organizationId: string) {
    try {
      const response = await fetch(
        `/api/agency/talent-analytics?organizationId=${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (data.talent) {
        setTalent(data.talent)
      }

      if (data.organizationTotals) {
        setOrgTotals(data.organizationTotals)
      }
    } catch (error) {
      console.error('Error fetching talent analytics:', error)
    }
  }

  async function handleAddTalent(email: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !organization) return

      const response = await fetch('/api/agency/invite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: organization.id,
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh talent list
        await fetchTalentAnalytics(session.access_token, organization.id)
        setShowAddTalentModal(false)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.error || data.message || 'Failed to add talent' }
      }
    } catch (error: any) {
      console.error('Error adding talent:', error)
      return { success: false, message: error.message || 'An error occurred' }
    }
  }

  async function handleRemoveTalent(userId: string) {
    if (!confirm('Are you sure you want to remove this talent from your organization?')) {
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !organization) return

      const response = await fetch('/api/agency/invite', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: organization.id,
          userId,
        }),
      })

      if (response.ok) {
        // Refresh talent list
        await fetchTalentAnalytics(session.access_token, organization.id)
      } else {
        const data = await response.json()
        alert(`Failed to remove talent: ${data.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error removing talent:', error)
      alert(`An error occurred: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0B0D14 0%, #1A1A2E 100%)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(105, 50, 255, 0.3)',
              borderTopColor: '#6932FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontSize: '18px', fontWeight: 600 }}>Loading Agency Dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <FeatureGate
      requiredTier="Agency"
      currentTier={currentTier}
      featureName="Agency Portfolio Dashboard"
      featureDescription="Manage multiple streamers and view aggregated analytics across your entire talent roster."
    >
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0B0D14 0%, #1A1A2E 100%)',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem',
                }}
              >
                {organization?.name || 'Organization Overview'}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
                Managing {talent.length} {talent.length === 1 ? 'streamer' : 'streamers'}
              </p>
            </div>

            <button
              onClick={() => setShowAddTalentModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(105, 50, 255, 0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(105, 50, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(105, 50, 255, 0.4)'
              }}
            >
              <span>➕</span>
              <span>Add Talent</span>
            </button>
          </div>

          {/* Organization Stats */}
          {orgTotals && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(105, 50, 255, 0.1)',
                  border: '1px solid rgba(105, 50, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Total Streams
                </div>
                <div
                  style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '0.5rem' }}
                >
                  {orgTotals.totalSessions.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(94, 234, 212, 0.1)',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Total Messages
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#5EEAD4',
                    marginTop: '0.5rem',
                  }}
                >
                  {orgTotals.totalMessages.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(147, 51, 234, 0.1)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Avg Viewers
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#9333EA',
                    marginTop: '0.5rem',
                  }}
                >
                  {orgTotals.avgViewersAcrossAllTalent}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Active Talent
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#10B981',
                    marginTop: '0.5rem',
                  }}
                >
                  {orgTotals.activeTalent}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Talent Table */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <TalentTable talent={talent} onRemoveTalent={handleRemoveTalent} />
        </div>

        {/* Add Talent Modal */}
        {showAddTalentModal && (
          <AddTalentModal
            onClose={() => setShowAddTalentModal(false)}
            onAddTalent={handleAddTalent}
          />
        )}
      </div>
    </FeatureGate>
  )
}
