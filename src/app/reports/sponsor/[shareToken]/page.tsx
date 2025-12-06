'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SponsorReport {
  id: string
  organization_id: string
  campaign_name: string
  date_range_start: string
  date_range_end: string
  notes: string | null
  share_token: string
  created_at: string
  generated_by: string
}

interface CreatorRow {
  name: string
  handle: string
  mentions: number
  shareOfVoice: number
  sentiment: number
  avgViewers: number
  reach: number
  status: 'GREEN' | 'AMBER'
}

export default function SponsorReportPage() {
  const params = useParams()
  const shareToken = params.shareToken as string

  const [report, setReport] = useState<SponsorReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- demo data (matches agency dashboard vibe) ---
  const mockOverview = {
    totalBrandMentions: 15,
    totalStreams: 150,
    totalMessages: 184_460,
    avgSentiment: 0.78,
    avgViewers: 9419,
    activeTalent: 5,
    benchmarkLabel: 'Top 25% of all campaigns this quarter',
    vsPreviousCampaign: '+15.4% mentions vs Monster Q3',
    vsIndustry: '+8.3% sentiment vs industry median',
  }

  const mockCreators: CreatorRow[] = [
    {
      name: 'StarStreamer',
      handle: '@StarStreamer',
      mentions: 3,
      shareOfVoice: 20,
      sentiment: 0.8,
      avgViewers: 17_500,
      reach: 60_300,
      status: 'GREEN',
    },
    {
      name: 'GrinderPro',
      handle: '@GrinderPro',
      mentions: 3,
      shareOfVoice: 20,
      sentiment: 0.73,
      avgViewers: 5_900,
      reach: 25_300,
      status: 'AMBER',
    },
    {
      name: 'RiskyBrand',
      handle: '@RiskyBrand',
      mentions: 3,
      shareOfVoice: 20,
      sentiment: 0.79,
      avgViewers: 5_200,
      reach: 28_500,
      status: 'GREEN',
    },
    {
      name: 'ChillVibes',
      handle: '@ChillVibes',
      mentions: 3,
      shareOfVoice: 20,
      sentiment: 0.73,
      avgViewers: 24_200,
      reach: 63_400,
      status: 'GREEN',
    },
    {
      name: 'SteadyMike',
      handle: '@SteadyMike',
      mentions: 3,
      shareOfVoice: 20,
      sentiment: 0.87,
      avgViewers: 5_100,
      reach: 47_600,
      status: 'GREEN',
    },
  ]

  const mockTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return {
      label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      mentions: 5 + Math.round(i * 0.7) + (i % 3), // gentle upward trend
    }
  })

  useEffect(() => {
    loadReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken])

  async function loadReport() {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sponsor_reports')
        .select('*')
        .eq('share_token', shareToken)
        .single()

      if (error || !data) {
        console.error('Report lookup failed:', error)
        setError('Report not found')
        setLoading(false)
        return
      }

      setReport(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0B0D14]">
        Loading report…
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600 text-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Report Not Found</h1>
          <p className="text-gray-600">Report not found or not publicly accessible</p>
        </div>
      </div>
    )
  }

  const campaignName = report.campaign_name || 'Campaign'

  return (
    <div className="min-h-screen bg-[#050711] text-white p-8 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header + meta */}
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold">{campaignName} – Sponsor Report</h1>
          <p className="text-sm text-gray-400">
            Powered by Casi • {new URL(window.location.href).hostname}
          </p>
        </header>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-3">
          <p>
            <span className="font-semibold">Campaign:</span> {campaignName}
          </p>
          <p>
            <span className="font-semibold">Date Range:</span> {report.date_range_start} →{' '}
            {report.date_range_end}
          </p>
          <p>
            <span className="font-semibold">Notes:</span> {report.notes || 'None'}
          </p>
          <p>
            <span className="font-semibold">Generated:</span>{' '}
            {new Date(report.created_at).toLocaleString('en-GB')}
          </p>
        </section>

        {/* Overview metrics */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Campaign Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs uppercase text-gray-400 mb-1">Total Brand Mentions</div>
              <div className="text-3xl font-bold text-pink-400">
                {mockOverview.totalBrandMentions}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Across {mockOverview.activeTalent} creators
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs uppercase text-gray-400 mb-1">Avg Sentiment</div>
              <div className="text-3xl font-bold text-emerald-400">
                {(mockOverview.avgSentiment * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">{mockOverview.vsIndustry}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs uppercase text-gray-400 mb-1">Avg Viewers</div>
              <div className="text-3xl font-bold text-teal-400">
                {(mockOverview.avgViewers / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-gray-500 mt-1">Live viewers across all streams</div>
            </div>
            <div className="bg-white/5 border border-amber-500/40 rounded-2xl p-4">
              <div className="text-xs uppercase text-amber-300 mb-1">Benchmark</div>
              <div className="text-sm font-semibold text-amber-200">
                {mockOverview.benchmarkLabel}
              </div>
              <div className="text-xs text-amber-200/70 mt-1">
                {mockOverview.vsPreviousCampaign}
              </div>
            </div>
          </div>
        </section>

        {/* Creator leaderboard */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Creator Performance</h2>
            <p className="text-xs text-gray-400">Ordered by brand mentions & share of voice</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Creator</th>
                  <th className="px-4 py-3 text-right">Mentions</th>
                  <th className="px-4 py-3 text-right">Share of Voice</th>
                  <th className="px-4 py-3 text-right">Sentiment</th>
                  <th className="px-4 py-3 text-right">Avg Viewers</th>
                  <th className="px-4 py-3 text-right">Estimated Reach</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockCreators.map((c, idx) => (
                  <tr key={c.name} className="border-t border-white/5">
                    <td className="px-4 py-3 text-gray-400">{idx === 0 ? '🏆' : `#${idx + 1}`}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-gray-400">{c.handle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{c.mentions}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.shareOfVoice.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {(c.sentiment * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {Math.round(c.avgViewers).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{c.reach.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ' +
                          (c.status === 'GREEN'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-amber-500/10 text-amber-300')
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mention trend */}
        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">Mention Trend (Last 14 Days)</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            {mockTrend.map((point) => (
              <div key={point.label} className="flex items-center gap-3 text-xs md:text-sm">
                <div className="w-16 text-gray-400">{point.label}</div>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${Math.min(point.mentions * 6, 100)}%` }}
                  />
                </div>
                <div className="w-10 text-right font-mono text-gray-300">{point.mentions}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Brand mentions are trending upward across the campaign period, with consistent coverage
            from the full roster.
          </p>
        </section>
      </div>
    </div>
  )
}
