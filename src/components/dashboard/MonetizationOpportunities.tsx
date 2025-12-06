'use client'

export default function MonetizationOpportunities() {
  // DEMO DATA: Hardcoded whales for the demo
  const whales = [
    { username: 'TechCEO_Gaming', value: '125k Bits', valueNum: 125000, type: 'Bits', emoji: '💎' },
    { username: 'CryptoKing', value: '$850 Gifted', valueNum: 850, type: 'Subs', emoji: '👑' },
    { username: 'OilBaron', value: '95k Bits', valueNum: 95000, type: 'Bits', emoji: '💰' },
  ]

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-400">💎 Community VIPs</h3>
        <div className="text-xs text-gray-500 bg-purple-500/10 px-2 py-1 rounded">HIGH VALUE</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {whales.map((whale, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{whale.emoji}</div>
                  <div>
                    <div className="font-bold text-white text-sm">@{whale.username}</div>
                    <div className="text-xs text-gray-400">{whale.type} Contributor</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {whale.value}
                  </div>
                  <div className="text-xs text-gray-500">Estimated Value</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-400 text-center">
          💡 <span className="text-purple-400 font-semibold">Pro Tip:</span> Recognize these VIPs
          during your stream for higher retention
        </div>
      </div>
    </div>
  )
}
