'use client'
import { useState } from 'react'

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

interface TalentTableProps {
  talent: TalentMember[]
  onRemoveTalent: (userId: string) => void
}

export default function TalentTable({ talent, onRemoveTalent }: TalentTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  function calculateWeeklyScore(member: TalentMember): number {
    // Simple scoring: (messages / 100) + (avgViewers / 10) + (sessions * 5)
    // Capped at 100
    const messageScore = Math.min(member.stats.totalMessages / 100, 30)
    const viewerScore = Math.min(member.stats.avgViewers / 10, 40)
    const sessionScore = Math.min(member.stats.totalSessions * 5, 30)
    return Math.min(Math.round(messageScore + viewerScore + sessionScore), 100)
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return '#10B981' // Green
    if (score >= 60) return '#F59E0B' // Yellow
    if (score >= 40) return '#EF4444' // Red
    return '#6B7280' // Gray
  }

  function isLive(member: TalentMember): boolean {
    // Check if last stream was within the last 6 hours
    if (!member.stats.lastStreamDate) return false
    const lastStream = new Date(member.stats.lastStreamDate)
    const now = new Date()
    const diffHours = (now.getTime() - lastStream.getTime()) / (1000 * 60 * 60)
    return diffHours < 6
  }

  if (talent.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          No Talent Added Yet
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
          Add streamers to your organization to start tracking their analytics
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 100px 120px 120px 150px',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <div>Streamer</div>
        <div style={{ textAlign: 'center' }}>Status</div>
        <div style={{ textAlign: 'center' }}>Score</div>
        <div style={{ textAlign: 'center' }}>Avg Viewers</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {/* Table Rows */}
      {talent.map((member) => {
        const score = calculateWeeklyScore(member)
        const live = isLive(member)
        const isExpanded = expandedRow === member.userId

        return (
          <div key={member.userId}>
            {/* Main Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 100px 120px 120px 150px',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onClick={() => setExpandedRow(isExpanded ? null : member.userId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {/* Streamer Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: member.avatarUrl
                      ? `url(${member.avatarUrl})`
                      : 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {!member.avatarUrl && (member.displayName?.[0] || member.email[0]).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                    {member.displayName || member.channelName || member.email.split('@')[0]}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                    {member.email}
                  </div>
                  {member.channelName && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem' }}>
                      @{member.channelName}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: live ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                    color: live ? '#EF4444' : '#6B7280',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: live ? '#EF4444' : '#6B7280',
                    }}
                  />
                  {live ? 'LIVE' : 'Offline'}
                </span>
              </div>

              {/* Weekly Score */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: '4px',
                      borderRadius: '50%',
                      background: '#1A1A2E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                      {score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Avg Viewers */}
              <div
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                }}
              >
                {member.stats.avgViewers}
              </div>

              {/* Actions */}
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // View dashboard for this talent
                    window.location.href = `/dashboard?userId=${member.userId}`
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(105, 50, 255, 0.2)',
                    border: '1px solid rgba(105, 50, 255, 0.3)',
                    color: '#6932FF',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(105, 50, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(105, 50, 255, 0.2)'
                  }}
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveTalent(member.userId)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Total Streams
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                      {member.stats.totalSessions}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Total Messages
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5EEAD4' }}>
                      {member.stats.totalMessages.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Last Streamed
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                      {formatDate(member.stats.lastStreamDate)}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Best Stream
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>
                      {member.stats.bestStreamMessages.toLocaleString()} msgs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
