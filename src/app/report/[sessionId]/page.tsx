'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import StatCard from '@/components/StreamReport/StatCard'
import ActivityTimeline from '@/components/StreamReport/ActivityTimeline'
import AchievementBadge from '@/components/StreamReport/AchievementBadge'
import ClipMoments from '@/components/StreamReport/ClipMoments'
import StreamRatingCard from '@/components/StreamReport/StreamRatingCard'
import GrowthComparison from '@/components/StreamReport/GrowthComparison'
import { casiColors, casiShadows, casiFonts } from '@/lib/branding'

interface ReportData {
  session: any
  analytics: any
  events: any[]
  achievements: any[]
  clipTimestamps?: any[]
  streamRating?: any
  previousComparison?: any
}

export default function InteractiveReportPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareText, setShareText] = useState('')

  useEffect(() => {
    if (!sessionId) return

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${sessionId}`)
        const data = await response.json()
        setReport(data)

        // Generate share text
        const stats = data.analytics
        const text = `🎮 Just streamed for ${Math.floor((data.session.duration_minutes || 0) / 60)}h ${(data.session.duration_minutes || 0) % 60}m!\n\n📊 ${stats?.total_messages || 0} messages • ${stats?.questions_count || 0} questions • ${stats?.positive_messages || 0} positive vibes\n\nPowered by @HeyCasi 🤖`
        setShareText(text)
      } catch (error) {
        console.error('Failed to fetch report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  const handleShare = async (platform: 'twitter' | 'copy') => {
    if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`
      window.open(url, '_blank')
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('Copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: casiColors.bgDark,
          backgroundImage: casiColors.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: casiFonts.primary,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '48px' }}
        >
          🎮
        </motion.div>
      </div>
    )
  }

  if (!report) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: casiColors.bgDark,
          backgroundImage: casiColors.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: casiFonts.primary,
          color: 'white',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>😕</div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Report Not Found</h1>
          <p style={{ opacity: 0.7 }}>This stream report doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  const {
    session,
    analytics,
    events,
    achievements,
    clipTimestamps,
    streamRating,
    previousComparison,
  } = report

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        fontFamily: casiFonts.primary,
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Mesh Background */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(105, 50, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 47, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(94, 234, 212, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(105, 50, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(147, 47, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(94, 234, 212, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(105, 50, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 47, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(94, 234, 212, 0.2) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      {/* Background Robot Mascot - like homepage */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.img
          src="/landing-robot.png"
          alt=""
          animate={{
            opacity: [0.08, 0.12, 0.1, 0.12, 0.08],
            scale: [1, 1.02, 1.03, 1.02, 1],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '850px',
            height: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0.7)',
          }}
        />
      </div>

      {/* Floating Orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
          style={{
            position: 'absolute',
            width: `${100 + i * 30}px`,
            height: `${100 + i * 30}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i % 3 === 0 ? 'rgba(105, 50, 255, 0.15)' : i % 3 === 1 ? 'rgba(147, 47, 254, 0.15)' : 'rgba(94, 234, 212, 0.15)'}, transparent 70%)`,
            filter: 'blur(40px)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(105, 50, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '32px',
            padding: '60px 40px',
            marginBottom: '40px',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 8px 32px rgba(105, 50, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated shine effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.img
                src="/landing-logo.png"
                alt="Casi"
                width={450}
                height={112}
                style={{
                  filter: 'drop-shadow(0 4px 30px rgba(105, 50, 255, 0.6)) brightness(1.2)',
                  objectFit: 'contain',
                }}
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '56px',
                fontWeight: 900,
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffffff, #e0e0ff, #ffffff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(255,255,255,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              🎮 Stream Report
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '15px',
                color: '#5EEAD4',
                textShadow: '0 2px 20px rgba(94, 234, 212, 0.5)',
              }}
            >
              @{session.channel_name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: '16px',
                opacity: 0.8,
                marginBottom: '10px',
                color: '#e0e0ff',
              }}
            >
              {new Date(session.session_start).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={{
                display: 'inline-block',
                fontSize: '20px',
                fontWeight: 700,
                marginTop: '10px',
                padding: '12px 30px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(105, 50, 255, 0.3)',
              }}
            >
              ⏱️ {Math.floor((session.duration_minutes || 0) / 60)}h{' '}
              {(session.duration_minutes || 0) % 60}m streamed
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2
            style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            📊 Stream Statistics
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '50px',
            }}
          >
            <StatCard
              value={analytics?.total_messages || 0}
              label="Messages"
              icon="💬"
              color={casiColors.teal}
              delay={0.1}
            />
            <StatCard
              value={analytics?.questions_count || 0}
              label="Questions"
              icon="❓"
              color={casiColors.pink}
              delay={0.2}
            />
            <StatCard
              value={session.peak_viewer_count || 0}
              label="Peak Viewers"
              icon="👥"
              color={casiColors.teal}
              delay={0.3}
            />
            <StatCard
              value={analytics?.positive_messages || 0}
              label="Positive Vibes"
              icon="✨"
              color={casiColors.green}
              delay={0.4}
            />
            <StatCard
              value={
                analytics?.total_messages > 0
                  ? Math.round((analytics?.positive_messages / analytics?.total_messages) * 100)
                  : 0
              }
              label="Positive Rate"
              icon="🔥"
              color={casiColors.primary}
              delay={0.5}
              suffix="%"
            />
            <StatCard
              value={Object.keys(analytics?.languages_detected || {}).length}
              label="Languages"
              icon="🌍"
              color={casiColors.orange}
              delay={0.6}
            />
          </div>
        </motion.div>

        {/* Stream Rating Card */}
        {streamRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ marginBottom: '50px' }}
          >
            <StreamRatingCard rating={streamRating} />
          </motion.div>
        )}

        {/* Growth Comparison */}
        {previousComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '50px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2
              style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              📈 Growth Metrics
            </h2>
            <GrowthComparison comparison={previousComparison} />
          </motion.div>
        )}

        {/* Clip Moments */}
        {clipTimestamps && clipTimestamps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '50px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2
              style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              🎬 Clipable Moments
            </h2>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '16px',
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              Perfect timestamps for creating clips on Twitch!
            </p>
            <ClipMoments clips={clipTimestamps} />
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginBottom: '50px',
          }}
        >
          {/* Activity Feed with Glassmorphism */}
          {events && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '35px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <h3
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#5EEAD4',
                  marginBottom: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textShadow: '0 2px 10px rgba(94, 234, 212, 0.3)',
                }}
              >
                ⚡ Live Activity Feed
              </h3>
              <ActivityTimeline events={events} maxItems={8} />
            </motion.div>
          )}

          {/* Achievements with Glassmorphism */}
          {achievements && achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '35px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <h3
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#FFA500',
                  marginBottom: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textShadow: '0 2px 10px rgba(255, 165, 0, 0.3)',
                }}
              >
                🏆 Achievements Unlocked
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '15px',
                }}
              >
                {achievements.map((achievement, index) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Social Sharing with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          style={{
            background: 'rgba(105, 50, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid rgba(105, 50, 255, 0.5)',
            borderRadius: '28px',
            padding: '50px',
            textAlign: 'center',
            marginBottom: '40px',
            boxShadow: '0 8px 32px rgba(105, 50, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated glow effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(105, 50, 255, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3
              style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 900,
                marginBottom: '20px',
                textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
              }}
            >
              Share Your Success! 🚀
            </h3>
            <div
              style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('twitter')}
                style={{
                  background: '#1DA1F2',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: casiFonts.primary,
                  boxShadow: casiShadows.lg,
                }}
              >
                🐦 Share on Twitter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('copy')}
                style={{
                  background: casiColors.gradient,
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: casiFonts.primary,
                  boxShadow: casiShadows.lg,
                }}
              >
                📋 Copy Stats
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '30px', color: 'white', opacity: 0.7 }}>
          <p style={{ marginBottom: '10px' }}>Powered by Casi - Your stream's brainy co-pilot 🤖</p>
          <a
            href="https://heycasi.com"
            style={{ color: casiColors.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            heycasi.com
          </a>
        </div>
      </div>
    </div>
  )
}
