'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AddTalentModal from '@/components/agency/AddTalentModal'
import TalentTable from '@/components/agency/TalentTable'
import CampaignBenchmark from '@/components/agency/CampaignBenchmark'
import CreatorHealthDashboard from '@/components/agency/CreatorHealthDashboard'
import SponsorReportGenerator from '@/components/agency/SponsorReportGenerator'

interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
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

interface CampaignData {
  campaignName: string
  totalMentions: number
  breakdown: {
    userId: string
    channelName: string
    mentions: number
  }[]
}

export default function AgencyDashboard() {
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [talent, setTalent] = useState<TalentMember[]>([])
  const [stats, setStats] = useState({
    totalStreams: 0,
    totalMessages: 0,
    avgViewers: 0,
    activeTalent: 0,
  })
  const [showAddTalentModal, setShowAddTalentModal] = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [currentTier, setCurrentTier] = useState<'Starter' | 'Pro' | 'Agency'>('Starter')
  const [isOwner, setIsOwner] = useState(false)
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      // Verify agency access
      const response = await fetch('/api/agency/organization', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch organization')
      }

      const orgData = await response.json()

      if (!orgData.organization) {
        window.location.href = '/dashboard' // Not an agency user
        return
      }

      setOrganization(orgData.organization)
      setIsOwner(orgData.role === 'owner')

      // Fetch talent analytics (includes all talent data)
      await fetchTalentAnalytics(session.access_token, orgData.organization.id)

      // Fetch campaign analytics
      await fetchCampaignAnalytics(session.access_token, orgData.organization.id)
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

      if (data.stats) {
        setStats({
          totalStreams: data.stats.totalStreams,
          totalMessages: data.stats.totalMessages,
          avgViewers: data.stats.avgViewers,
          activeTalent: data.talentCount || 0,
        })
      }

      // Set talent list for the table
      if (data.talent && Array.isArray(data.talent)) {
        setTalent(data.talent)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  async function fetchCampaignAnalytics(token: string, organizationId: string) {
    try {
      const response = await fetch(
        `/api/agency/campaign-analytics?organizationId=${organizationId}&keyword=Red Bull`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (data.campaignName && data.totalMentions !== undefined) {
        setCampaignData(data)
      }
    } catch (error) {
      console.error('Error fetching campaign analytics:', error)
    }
  }

  async function handleAddTalent(email: string) {
    try {
      const {
        data: { session },
      } = await createClient().auth.getSession()
      if (!session) return

      const response = await fetch('/api/agency/invite-talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, organizationId: organization?.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to invite talent')
      }

      alert('Invitation sent successfully!')
      setShowAddTalentModal(false)
    } catch (error) {
      console.error('Error inviting talent:', error)
      alert('Failed to invite talent. Please try again.')
    }
  }

  async function handleRemoveTalent(userId: string) {
    if (!confirm('Are you sure you want to remove this talent from your agency?')) return

    try {
      const {
        data: { session },
      } = await createClient().auth.getSession()
      if (!session) return

      const response = await fetch('/api/agency/remove-talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, organizationId: organization?.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove talent')
      }

      // Refresh list
      checkAccess()
    } catch (error) {
      console.error('Error removing talent:', error)
      alert('Failed to remove talent')
    }
  }

  // Generate demo data for Campaign Benchmark
  const benchmarkData =
    campaignData && campaignData.totalMentions > 0
      ? {
          currentCampaign: {
            mentions: campaignData.totalMentions,
            sentiment: 0.78, // 78% positive
            avgViewers: stats.avgViewers,
          },
          comparison: {
            previousCampaign: {
              mentions: Math.round(campaignData.totalMentions * 0.85), // 15% growth
              sentiment: 0.72,
              avgViewers: Math.round(stats.avgViewers * 0.92),
              name: 'Monster Q3',
            },
            industryMedian: {
              mentions: Math.round(campaignData.totalMentions * 0.6),
              sentiment: 0.65,
              avgViewers: Math.round(stats.avgViewers * 0.7),
            },
          },
        }
      : null

  // Generate demo data for Creator Performance (enhanced with sentiment and reach)
  const creatorPerformance = campaignData
    ? campaignData.breakdown.map((creator) => ({
        userId: creator.userId,
        channelName: creator.channelName,
        mentions: creator.mentions,
        shareOfVoice: (creator.mentions / campaignData.totalMentions) * 100,
        avgSentiment: 0.7 + Math.random() * 0.25, // 70-95%
        avgViewers: Math.round(5000 + Math.random() * 25000),
        totalReach: Math.round(creator.mentions * (8000 + Math.random() * 15000)),
      }))
    : []

  // Generate demo trend data (last 14 days)
  const trendData = campaignData
    ? Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (13 - i))
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mentions: Math.round(5 + Math.random() * 15 + i * 0.5), // Trending up
        }
      })
    : []

  // Generate demo health data for creators
  const creatorHealthData = talent.map((t) => {
    // Vary health scores based on stats
    const hasGoodStats = t.stats.avgViewers > 5000 && t.stats.totalMessages > 10000
    const baseScore = hasGoodStats ? 75 : 55
    const score = baseScore + Math.round(Math.random() * 20)

    let category: 'green' | 'amber' | 'red'
    if (score >= 80) category = 'green'
    else if (score >= 50) category = 'amber'
    else category = 'red'

    const reasons = {
      green: 'Consistent streams, stable sentiment, growing audience',
      amber: 'Fewer streams this month, sentiment slightly down',
      red: 'Recent toxicity spikes, viewer drop detected',
    }

    const flags = {
      green: [] as string[],
      amber: ['reduced_frequency'],
      red: ['toxicity_spike', 'viewer_drop'],
    }

    return {
      userId: t.userId,
      channelName: t.channelName || '',
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
      healthScore: score,
      healthCategory: category,
      reasonSummary: reasons[category],
      flags: flags[category],
      lastUpdated: new Date().toISOString(),
    }
  })

  const handleCreatorClick = (userId: string) => {
    window.location.href = `/dashboard?userId=${userId}`
  }

  const handleGenerateReport = async (config: any) => {
    try {
      const {
        data: { session },
      } = await createClient().auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch('/api/agency/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organizationId: organization?.id,
          campaignName: config.campaignName,
          dateRangeStart: config.dateRangeStart,
          dateRangeEnd: config.dateRangeEnd,
          notes: config.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const data = await response.json()

      return {
        reportUrl: data.reportUrl,
        reportId: data.reportId,
      }
    } catch (error: any) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Command Center...</p>
        </div>
      </div>
    )
  }

  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Agency Command Center
            </h1>
            <p className="text-gray-400 mt-1">Portfolio Overview & Campaign Intelligence</p>
          </div>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-sm font-medium"
              onClick={() => (window.location.href = '/account')}
            >
              Settings
            </button>
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm font-bold flex items-center gap-2"
              onClick={() => setShowAddTalentModal(true)}
            >
              <span>+</span> Add Talent
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
              Total Streams
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.totalStreams}</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
              Total Messages
            </div>
            <div className="text-3xl font-bold text-pink-400">
              {(stats.totalMessages / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-500 mt-1">+12% vs last month</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
              Avg Viewers
            </div>
            <div className="text-3xl font-bold text-teal-400">
              {(stats.avgViewers / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-500 mt-1">Across all channels</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
              Active Talent
            </div>
            <div className="text-3xl font-bold text-white">{stats.activeTalent}</div>
            <div className="text-xs text-gray-500 mt-1">
              {currentTier === 'Agency' ? '5/5 Slots Used' : 'Unlimited Slots'}
            </div>
          </div>
        </div>

        {/* Campaign Intelligence Section with Benchmarking */}
        {benchmarkData && campaignData && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎯 {campaignData.campaignName} Campaign
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Active campaign performance and analytics
                </p>
              </div>
              <button
                onClick={() => setShowReportGenerator(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-white transition flex items-center gap-2"
              >
                <span>📄</span>
                <span>Generate Sponsor Report</span>
              </button>
            </div>

            <CampaignBenchmark
              campaignName={campaignData.campaignName}
              benchmarkData={benchmarkData}
              creatorPerformance={creatorPerformance}
              trendData={trendData}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        )}

        {/* Creator Health Dashboard */}
        {creatorHealthData.length > 0 && (
          <div className="mb-8">
            <CreatorHealthDashboard
              creators={creatorHealthData}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        )}

        {/* Talent Table */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <TalentTable talent={talent} onRemoveTalent={handleRemoveTalent} />
        </div>
      </div>

      {showAddTalentModal && (
        <AddTalentModal onClose={() => setShowAddTalentModal(false)} onInvite={handleAddTalent} />
      )}

      {showReportGenerator && campaignData && (
        <SponsorReportGenerator
          isOpen={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
          campaignName={campaignData.campaignName}
          defaultStartDate={todayIso}
          defaultEndDate={todayIso}
          onGenerate={handleGenerateReport}
        />
      )}
    </div>
  )
}
