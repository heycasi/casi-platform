// API endpoint to fetch interactive stream report data
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AnalyticsService } from '@/lib/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

function generateAchievements(session: any, analytics: any, events: any[]): Achievement[] {
  const achievements: Achievement[] = []

  // Stream duration achievements
  const durationHours = Math.floor((session.duration_minutes || 0) / 60)
  if (durationHours >= 1) {
    achievements.push({
      id: 'marathon_1h',
      title: 'Getting Started',
      description: 'Stream for 1+ hours',
      icon: '⏱️',
      unlocked: true,
      rarity: 'common',
    })
  }
  if (durationHours >= 3) {
    achievements.push({
      id: 'marathon_3h',
      title: 'Going Strong',
      description: 'Stream for 3+ hours',
      icon: '🔥',
      unlocked: true,
      rarity: 'rare',
    })
  }
  if (durationHours >= 5) {
    achievements.push({
      id: 'marathon_5h',
      title: 'Marathon Runner',
      description: 'Stream for 5+ hours',
      icon: '💪',
      unlocked: true,
      rarity: 'epic',
    })
  }

  // Message achievements
  if ((analytics?.total_messages || 0) >= 50) {
    achievements.push({
      id: 'chatty_50',
      title: 'Chatty Stream',
      description: '50+ messages',
      icon: '💬',
      unlocked: true,
      rarity: 'common',
    })
  }
  if ((analytics?.total_messages || 0) >= 200) {
    achievements.push({
      id: 'chatty_200',
      title: 'Super Chatty',
      description: '200+ messages',
      icon: '🗣️',
      unlocked: true,
      rarity: 'rare',
    })
  }
  if ((analytics?.total_messages || 0) >= 500) {
    achievements.push({
      id: 'chatty_500',
      title: 'Chat Champion',
      description: '500+ messages',
      icon: '👑',
      unlocked: true,
      rarity: 'epic',
    })
  }

  // Positivity achievements
  const positiveRate =
    analytics?.total_messages > 0
      ? (analytics?.positive_messages / analytics?.total_messages) * 100
      : 0
  if (positiveRate >= 70) {
    achievements.push({
      id: 'positive_vibes',
      title: 'Positive Vibes',
      description: '70%+ positive chat',
      icon: '✨',
      unlocked: true,
      rarity: 'rare',
    })
  }
  if (positiveRate >= 90) {
    achievements.push({
      id: 'wholesome',
      title: 'Wholesome King',
      description: '90%+ positive chat',
      icon: '😇',
      unlocked: true,
      rarity: 'legendary',
    })
  }

  // Event-based achievements
  const subscriptions = events.filter(
    (e) => e.event_type === 'subscription' || e.event_type === 'resub'
  )
  const giftSubs = events.filter((e) => e.event_type === 'gift_sub')
  const raids = events.filter((e) => e.event_type === 'raid')
  const follows = events.filter((e) => e.event_type === 'follow')

  if (subscriptions.length >= 1) {
    achievements.push({
      id: 'first_sub',
      title: 'First Sub',
      description: 'Got your first sub!',
      icon: '⭐',
      unlocked: true,
      rarity: 'rare',
    })
  }
  if (subscriptions.length >= 5) {
    achievements.push({
      id: 'sub_train',
      title: 'Sub Train',
      description: '5+ subs in one stream',
      icon: '🚂',
      unlocked: true,
      rarity: 'epic',
    })
  }

  if (giftSubs.length >= 1) {
    achievements.push({
      id: 'gift_received',
      title: 'Gift Giver',
      description: 'Someone gifted subs!',
      icon: '🎁',
      unlocked: true,
      rarity: 'rare',
    })
  }

  if (raids.length >= 1) {
    achievements.push({
      id: 'raided',
      title: 'Raided!',
      description: 'Got raided by another streamer',
      icon: '⚔️',
      unlocked: true,
      rarity: 'epic',
    })
  }

  if (follows.length >= 10) {
    achievements.push({
      id: 'popular',
      title: 'Growing Fast',
      description: '10+ new follows',
      icon: '📈',
      unlocked: true,
      rarity: 'rare',
    })
  }

  // Global achievements
  const languages = Object.keys(analytics?.languages_detected || {})
  if (languages.length >= 3) {
    achievements.push({
      id: 'multilingual',
      title: 'Global Reach',
      description: '3+ languages in chat',
      icon: '🌍',
      unlocked: true,
      rarity: 'epic',
    })
  }

  return achievements
}

function generateClipTimestamps(session: any, analytics: any, events: any[]) {
  const clipMoments: any[] = []

  // Add engagement peaks as clip moments
  if (analytics.engagement_peaks) {
    analytics.engagement_peaks.slice(0, 3).forEach((peak: any) => {
      const timestamp = new Date(peak.timestamp)
      const sessionStart = new Date(session.session_start)
      const minutesIn = Math.floor((timestamp.getTime() - sessionStart.getTime()) / 60000)

      clipMoments.push({
        timestamp: peak.timestamp,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'engagement_peak',
        icon: '🔥',
        title: 'Chat Explosion',
        description: `${peak.message_count} messages with high excitement`,
        intensity: peak.intensity,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    })
  }

  // Add major events as clip moments
  events.forEach((event: any) => {
    const eventTime = new Date(event.created_at)
    const sessionStart = new Date(session.session_start)
    const minutesIn = Math.floor((eventTime.getTime() - sessionStart.getTime()) / 60000)

    if (event.event_type === 'raid' && event.event_data?.viewers >= 10) {
      clipMoments.push({
        timestamp: event.created_at,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'raid',
        icon: '⚔️',
        title: `Raid from ${event.user_display_name}`,
        description: `${event.event_data.viewers} viewers joined`,
        intensity: 0.9,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    }

    if (event.event_type === 'gift_sub' && event.event_data?.total >= 5) {
      clipMoments.push({
        timestamp: event.created_at,
        relativeTime: `${Math.floor(minutesIn / 60)}:${String(minutesIn % 60).padStart(2, '0')}:00`,
        minutesIn,
        type: 'gift_sub',
        icon: '🎁',
        title: 'Sub Bomb!',
        description: `${event.user_display_name} gifted ${event.event_data.total} subs`,
        intensity: 0.85,
        clipUrl: `https://www.twitch.tv/${session.channel_name}/clip`,
      })
    }
  })

  // Sort by intensity and return top 5
  return clipMoments.sort((a, b) => b.intensity - a.intensity).slice(0, 5)
}

function calculateStreamRating(session: any, analytics: any, events: any[]) {
  let score = 0
  let maxScore = 0

  // Duration score (0-20 points)
  maxScore += 20
  const durationHours = (session.duration_minutes || 0) / 60
  if (durationHours >= 2 && durationHours <= 5) score += 20
  else if (durationHours >= 1) score += 15
  else if (durationHours >= 0.5) score += 10

  // Engagement score (0-30 points)
  maxScore += 30
  const messagesPerHour = analytics.total_messages / Math.max(durationHours, 0.5)
  if (messagesPerHour >= 100) score += 30
  else if (messagesPerHour >= 50) score += 25
  else if (messagesPerHour >= 25) score += 20
  else if (messagesPerHour >= 10) score += 15
  else score += 10

  // Positivity score (0-25 points)
  maxScore += 25
  const positiveRatio =
    analytics.total_messages > 0 ? analytics.positive_messages / analytics.total_messages : 0
  score += Math.round(positiveRatio * 25)

  // Event score (0-15 points)
  maxScore += 15
  const eventCount = events.length
  if (eventCount >= 10) score += 15
  else if (eventCount >= 5) score += 12
  else if (eventCount >= 3) score += 10
  else if (eventCount >= 1) score += 7

  // Viewer count score (0-10 points)
  maxScore += 10
  const peakViewers = session.peak_viewer_count || 0
  if (peakViewers >= 100) score += 10
  else if (peakViewers >= 50) score += 8
  else if (peakViewers >= 25) score += 6
  else if (peakViewers >= 10) score += 4
  else score += 2

  // Calculate percentage and grade
  const percentage = Math.round((score / maxScore) * 100)

  let grade = 'C'
  let color = '#9CA3AF'
  let emoji = '📊'

  if (percentage >= 95) {
    grade = 'S+'
    color = '#FFD700'
    emoji = '👑'
  } else if (percentage >= 90) {
    grade = 'A+'
    color = '#10B981'
    emoji = '⭐'
  } else if (percentage >= 85) {
    grade = 'A'
    color = '#10B981'
    emoji = '✨'
  } else if (percentage >= 80) {
    grade = 'A-'
    color = '#34D399'
    emoji = '💚'
  } else if (percentage >= 75) {
    grade = 'B+'
    color = '#60A5FA'
    emoji = '💙'
  } else if (percentage >= 70) {
    grade = 'B'
    color = '#60A5FA'
    emoji = '👍'
  } else if (percentage >= 65) {
    grade = 'B-'
    color = '#93C5FD'
    emoji = '🙂'
  } else if (percentage >= 60) {
    grade = 'C+'
    color = '#FCD34D'
    emoji = '📈'
  } else if (percentage >= 55) {
    grade = 'C'
    color = '#FCD34D'
    emoji = '📊'
  } else {
    grade = 'C-'
    color = '#F59E0B'
    emoji = '💪'
  }

  return {
    grade,
    percentage,
    score,
    maxScore,
    color,
    emoji,
    breakdown: {
      duration: `${Math.round(((durationHours >= 2 && durationHours <= 5 ? 20 : durationHours >= 1 ? 15 : 10) / 20) * 100)}%`,
      engagement: `${Math.round(((messagesPerHour >= 100 ? 30 : messagesPerHour >= 50 ? 25 : 20) / 30) * 100)}%`,
      positivity: `${Math.round(positiveRatio * 100)}%`,
      events: `${Math.round(((eventCount >= 10 ? 15 : eventCount >= 5 ? 12 : 10) / 15) * 100)}%`,
      viewers: `${Math.round(((peakViewers >= 100 ? 10 : peakViewers >= 50 ? 8 : 6) / 10) * 100)}%`,
    },
  }
}

async function getPreviousStreamComparison(session: any, analytics: any) {
  try {
    // Get previous session for this channel
    const { data: previousSession } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .eq('channel_name', session.channel_name)
      .lt('session_start', session.session_start)
      .order('session_start', { ascending: false })
      .limit(1)
      .single()

    if (!previousSession) {
      return null
    }

    // Generate analytics for previous session
    let previousAnalytics
    try {
      previousAnalytics = await AnalyticsService.generateSessionAnalytics(previousSession.id)
    } catch {
      return null
    }

    // Calculate differences
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      previousSession: {
        id: previousSession.id,
        date: previousSession.session_start,
        duration_minutes: previousSession.duration_minutes,
      },
      comparison: {
        messages: {
          current: analytics.total_messages,
          previous: previousAnalytics.total_messages,
          change: calculateChange(analytics.total_messages, previousAnalytics.total_messages),
        },
        viewers: {
          current: session.peak_viewer_count || 0,
          previous: previousSession.peak_viewer_count || 0,
          change: calculateChange(
            session.peak_viewer_count || 0,
            previousSession.peak_viewer_count || 0
          ),
        },
        positiveRate: {
          current: Math.round((analytics.positive_messages / analytics.total_messages) * 100),
          previous: Math.round(
            (previousAnalytics.positive_messages / previousAnalytics.total_messages) * 100
          ),
          change: calculateChange(
            (analytics.positive_messages / analytics.total_messages) * 100,
            (previousAnalytics.positive_messages / previousAnalytics.total_messages) * 100
          ),
        },
        questions: {
          current: analytics.questions_count,
          previous: previousAnalytics.questions_count,
          change: calculateChange(analytics.questions_count, previousAnalytics.questions_count),
        },
      },
    }
  } catch (error) {
    console.error('Error getting previous stream comparison:', error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('stream_report_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Generate analytics
    let analytics
    try {
      analytics = await AnalyticsService.generateSessionAnalytics(sessionId)
    } catch (error) {
      // If no messages, create empty analytics
      analytics = {
        total_messages: 0,
        questions_count: 0,
        positive_messages: 0,
        negative_messages: 0,
        neutral_messages: 0,
        languages_detected: {},
        motivational_insights: [],
      }
    }

    // Fetch activity feed events for this session
    const { data: events } = await supabase
      .from('stream_events')
      .select('*')
      .eq('channel_name', session.channel_name)
      .gte('created_at', session.session_start)
      .lte('created_at', session.session_end || new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    // Generate achievements
    const achievements = generateAchievements(session, analytics, events || [])

    // Generate clip timestamps
    const clipTimestamps = generateClipTimestamps(session, analytics, events || [])

    // Calculate stream rating
    const streamRating = calculateStreamRating(session, analytics, events || [])

    // Get comparison to previous stream
    const previousComparison = await getPreviousStreamComparison(session, analytics)

    return NextResponse.json({
      session,
      analytics,
      events: events || [],
      achievements,
      clipTimestamps,
      streamRating,
      previousComparison,
    })
  } catch (error: any) {
    console.error('Report API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
