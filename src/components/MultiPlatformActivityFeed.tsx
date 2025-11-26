'use client'

import { useState } from 'react'
import ActivityFeed from './ActivityFeed'

interface MultiPlatformActivityFeedProps {
  twitchChannelName: string
  kickChannelName?: string | null
  userTier: 'Starter' | 'Pro' | 'Agency'
  kickConnected: boolean
  maxHeight?: string
}

export default function MultiPlatformActivityFeed({
  twitchChannelName,
  kickChannelName,
  userTier,
  kickConnected,
  maxHeight = '500px',
}: MultiPlatformActivityFeedProps) {
  const [activeTab, setActiveTab] = useState<'twitch' | 'kick'>('twitch')

  // Show tabs only if Pro/Agency AND Kick is connected
  const showKickTab =
    (userTier === 'Pro' || userTier === 'Agency') && kickConnected && kickChannelName

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: maxHeight,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      {/* Header with Tabs */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📊 Activity Feed</h3>
        </div>

        {/* Tab Buttons */}
        {showKickTab ? (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.25rem',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setActiveTab('twitch')}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: activeTab === 'twitch' ? 'rgba(100, 65, 165, 0.3)' : 'transparent',
                color: activeTab === 'twitch' ? '#9147FF' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🟣</span>
              <span>Twitch</span>
            </button>
            <button
              onClick={() => setActiveTab('kick')}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: activeTab === 'kick' ? 'rgba(83, 252, 24, 0.2)' : 'transparent',
                color: activeTab === 'kick' ? '#53FC18' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🟢</span>
              <span>Kick</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontStyle: 'italic',
            }}
          >
            Twitch Activity Only
          </div>
        )}
      </div>

      {/* Activity Feed Content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'twitch' ? (
          <ActivityFeed channelName={twitchChannelName} maxHeight="100%" />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '2rem',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🟢</div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#53FC18', fontSize: '1.1rem' }}>
              Kick Activity Feed
            </h4>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Coming soon! Kick event tracking is currently in development.
            </p>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.8rem',
              }}
            >
              For now, you can see Kick chat messages in the main chat feed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
