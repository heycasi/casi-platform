'use client'

interface CreatorHealth {
  userId: string
  channelName: string
  displayName?: string
  avatarUrl?: string
  healthScore: number
  healthCategory: 'green' | 'amber' | 'red'
  reasonSummary: string
  flags: string[]
  lastUpdated: string
}

interface CreatorHealthDashboardProps {
  creators: CreatorHealth[]
  onCreatorClick?: (userId: string) => void
}

export default function CreatorHealthDashboard({
  creators,
  onCreatorClick,
}: CreatorHealthDashboardProps) {
  const getCategoryColor = (category: 'green' | 'amber' | 'red') => {
    switch (category) {
      case 'green':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/40',
          text: 'text-green-400',
          ring: 'from-green-500 to-emerald-400',
        }
      case 'amber':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/40',
          text: 'text-yellow-400',
          ring: 'from-yellow-500 to-orange-400',
        }
      case 'red':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/40',
          text: 'text-red-400',
          ring: 'from-red-500 to-rose-400',
        }
    }
  }

  const getStatusIcon = (category: 'green' | 'amber' | 'red') => {
    switch (category) {
      case 'green':
        return '✅'
      case 'amber':
        return '⚠️'
      case 'red':
        return '🚨'
    }
  }

  // Sort by category (red first for urgency)
  const sortedCreators = [...creators].sort((a, b) => {
    const order = { red: 0, amber: 1, green: 2 }
    return order[a.healthCategory] - order[b.healthCategory]
  })

  const summary = {
    green: creators.filter((c) => c.healthCategory === 'green').length,
    amber: creators.filter((c) => c.healthCategory === 'amber').length,
    red: creators.filter((c) => c.healthCategory === 'red').length,
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🏥 Creator Health Monitor
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Track performance, sentiment, and risk factors across your roster
          </p>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-bold text-green-400">{summary.green}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs font-bold text-yellow-400">{summary.amber}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs font-bold text-red-400">{summary.red}</span>
          </div>
        </div>
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCreators.map((creator) => {
          const colors = getCategoryColor(creator.healthCategory)

          return (
            <div
              key={creator.userId}
              className={`${colors.bg} ${colors.border} border rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => onCreatorClick?.(creator.userId)}
            >
              {/* Header with Avatar and Score */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      backgroundImage: creator.avatarUrl ? `url(${creator.avatarUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!creator.avatarUrl &&
                      (creator.displayName?.[0] || creator.channelName[0]).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="font-bold text-white text-sm">
                      {creator.displayName || creator.channelName}
                    </div>
                    <div className="text-xs text-gray-400">@{creator.channelName}</div>
                  </div>
                </div>

                {/* Health Score Ring */}
                <div className="relative">
                  <svg className="w-14 h-14 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="4"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke={`url(#gradient-${creator.userId})`}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(creator.healthScore / 100) * 150.8} 150.8`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id={`gradient-${creator.userId}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          className={colors.ring.split(' ')[0].replace('from-', 'stop-')}
                        />
                        <stop
                          offset="100%"
                          className={colors.ring.split(' ')[1].replace('to-', 'stop-')}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {creator.healthScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getStatusIcon(creator.healthCategory)}</span>
                <span className={`text-xs font-bold uppercase ${colors.text}`}>
                  {creator.healthCategory}
                </span>
              </div>

              {/* Reason Summary */}
              <p className="text-xs text-gray-300 mb-3 line-clamp-2">{creator.reasonSummary}</p>

              {/* Flags */}
              {creator.flags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {creator.flags.slice(0, 2).map((flag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400"
                    >
                      {flag}
                    </span>
                  ))}
                  {creator.flags.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">
                      +{creator.flags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          💡 Health scores update daily based on sentiment, stream frequency, toxicity, and viewer
          trends
        </p>
      </div>
    </div>
  )
}
