'use client'

import { useState } from 'react'

interface BenchmarkData {
  currentCampaign: {
    mentions: number
    sentiment: number
    avgViewers: number
  }
  comparison: {
    previousCampaign?: {
      mentions: number
      sentiment: number
      avgViewers: number
      name: string
    }
    industryMedian: {
      mentions: number
      sentiment: number
      avgViewers: number
    }
  }
}

interface CreatorPerformance {
  userId: string
  channelName: string
  mentions: number
  shareOfVoice: number
  avgSentiment: number
  avgViewers: number
  totalReach: number
}

interface TrendDataPoint {
  date: string
  mentions: number
}

interface CampaignBenchmarkProps {
  campaignName: string
  benchmarkData: BenchmarkData
  creatorPerformance: CreatorPerformance[]
  trendData: TrendDataPoint[]
  onCreatorClick?: (userId: string) => void
}

type SortField = 'mentions' | 'shareOfVoice' | 'avgSentiment' | 'avgViewers' | 'totalReach'
type SortDirection = 'asc' | 'desc'

export default function CampaignBenchmark({
  campaignName,
  benchmarkData,
  creatorPerformance,
  trendData,
  onCreatorClick,
}: CampaignBenchmarkProps) {
  const [sortField, setSortField] = useState<SortField>('mentions')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Calculate deltas
  const prev = benchmarkData.comparison.previousCampaign
  const mentionDelta = prev
    ? ((benchmarkData.currentCampaign.mentions - prev.mentions) / prev.mentions) * 100
    : null

  const sentimentDelta = prev
    ? ((benchmarkData.currentCampaign.sentiment - prev.sentiment) / Math.abs(prev.sentiment || 1)) *
      100
    : null

  // Sort creators
  const sortedCreators = [...creatorPerformance].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatDelta = (delta: number | null) => {
    if (delta === null) return null
    const sign = delta > 0 ? '+' : ''
    return `${sign}${delta.toFixed(1)}%`
  }

  const getDeltaColor = (delta: number | null) => {
    if (delta === null) return 'text-gray-400'
    return delta > 0 ? 'text-green-400' : 'text-red-400'
  }

  // Simple trend chart using canvas-like divs
  const maxMentions = Math.max(...trendData.map((d) => d.mentions), 1)

  return (
    <div className="space-y-6">
      {/* Benchmark Panel */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📊 Campaign Benchmarks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mentions Benchmark */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Brand Mentions</div>
            <div className="text-2xl font-bold text-white mb-1">
              {benchmarkData.currentCampaign.mentions.toLocaleString()}
            </div>
            {mentionDelta !== null && (
              <div className={`text-sm font-semibold ${getDeltaColor(mentionDelta)}`}>
                {formatDelta(mentionDelta)} vs {prev?.name}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Industry median: {benchmarkData.comparison.industryMedian.mentions.toLocaleString()}
            </div>
          </div>

          {/* Sentiment Benchmark */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Avg Sentiment</div>
            <div className="text-2xl font-bold text-white mb-1">
              {(benchmarkData.currentCampaign.sentiment * 100).toFixed(1)}%
            </div>
            {sentimentDelta !== null && (
              <div className={`text-sm font-semibold ${getDeltaColor(sentimentDelta)}`}>
                {formatDelta(sentimentDelta)} vs {prev?.name}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Industry median:{' '}
              {(benchmarkData.comparison.industryMedian.sentiment * 100).toFixed(1)}%
            </div>
          </div>

          {/* Viewers Benchmark */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Avg Viewers</div>
            <div className="text-2xl font-bold text-white mb-1">
              {(benchmarkData.currentCampaign.avgViewers / 1000).toFixed(1)}k
            </div>
            {prev && (
              <div
                className={`text-sm font-semibold ${getDeltaColor(
                  ((benchmarkData.currentCampaign.avgViewers - prev.avgViewers) / prev.avgViewers) *
                    100
                )}`}
              >
                {formatDelta(
                  ((benchmarkData.currentCampaign.avgViewers - prev.avgViewers) / prev.avgViewers) *
                    100
                )}{' '}
                vs {prev.name}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Industry median:{' '}
              {(benchmarkData.comparison.industryMedian.avgViewers / 1000).toFixed(1)}k
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        {mentionDelta !== null && mentionDelta > 10 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
            <span className="text-green-400 font-bold text-sm">
              🏆 Top 25% of all campaigns this quarter
            </span>
          </div>
        )}
      </div>

      {/* Trend Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📈 Mention Trend</h3>

        <div className="flex items-end justify-between h-32 gap-1">
          {trendData.map((point, index) => {
            const heightPercent = (point.mentions / maxMentions) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  title={`${point.date}: ${point.mentions} mentions`}
                />
                <div className="text-xs text-gray-500 text-center whitespace-nowrap transform rotate-45 origin-top-left mt-4">
                  {point.date}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Creator Leaderboard */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-white">🏆 Creator Leaderboard</h3>
          <p className="text-sm text-gray-400 mt-1">Click column headers to sort</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">
                  Rank
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">
                  Creator
                </th>
                <th
                  className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('mentions')}
                >
                  Mentions {sortField === 'mentions' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('shareOfVoice')}
                >
                  Share of Voice{' '}
                  {sortField === 'shareOfVoice' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('avgSentiment')}
                >
                  Sentiment {sortField === 'avgSentiment' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('avgViewers')}
                >
                  Avg Viewers {sortField === 'avgViewers' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-center px-6 py-3 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('totalReach')}
                >
                  Total Reach {sortField === 'totalReach' && (sortDirection === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCreators.map((creator, index) => {
                const isTopPerformer = index === 0
                return (
                  <tr
                    key={creator.userId}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition"
                    onClick={() => onCreatorClick?.(creator.userId)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-400">
                        {isTopPerformer ? '👑' : `#${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{creator.channelName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-purple-400">{creator.mentions}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                            style={{ width: `${creator.shareOfVoice}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {creator.shareOfVoice.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className={`font-semibold ${
                          creator.avgSentiment > 0.7
                            ? 'text-green-400'
                            : creator.avgSentiment > 0.4
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {(creator.avgSentiment * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-teal-400">
                        {(creator.avgViewers / 1000).toFixed(1)}k
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-pink-400">
                        {(creator.totalReach / 1000).toFixed(1)}k
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
