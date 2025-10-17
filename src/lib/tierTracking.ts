import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const TIER_LIMITS = {
  'Creator': { viewers: 50, messages: 1000 },
  'Pro': { viewers: 250, messages: 5000 },
  'Streamer+': { viewers: Infinity, messages: Infinity }
} as const

export type TierName = keyof typeof TIER_LIMITS

export interface TierStatus {
  avgViewers: number
  limit: number
  isOverLimit: boolean
  daysOverLimit: number
  shouldNudge: boolean
  suggestedTier?: TierName
  percentOver: number
}

/**
 * Calculate 30-day rolling average viewers for a user
 */
export async function calculate30DayAvgViewers(userEmail: string): Promise<number> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('stream_report_sessions')
    .select('peak_viewer_count, stream_started_at')
    .eq('streamer_email', userEmail)
    .gte('stream_started_at', thirtyDaysAgo.toISOString())
    .order('stream_started_at', { ascending: false })

  if (error) {
    console.error('Error fetching stream sessions:', error)
    return 0
  }

  if (!data || data.length === 0) return 0

  // Calculate average peak viewers across all sessions
  const totalViewers = data.reduce((sum, session) => {
    return sum + (session.peak_viewer_count || 0)
  }, 0)

  const avgViewers = Math.round(totalViewers / data.length)
  return avgViewers
}

/**
 * Check and update tier status for a specific user
 */
export async function checkAndUpdateTierStatus(
  userEmail: string,
  subscriptionId?: string
): Promise<TierStatus | null> {
  // Get current subscription
  const query = supabase
    .from('subscriptions')
    .select('*')
    .eq('email', userEmail)
    .eq('status', 'active')

  if (subscriptionId) {
    query.eq('stripe_subscription_id', subscriptionId)
  }

  const { data: sub, error } = await query.single()

  if (error || !sub) {
    console.error('Error fetching subscription:', error)
    return null
  }

  // Calculate 30-day average
  const avgViewers = await calculate30DayAvgViewers(userEmail)
  const limit = TIER_LIMITS[sub.tier_name as TierName]?.viewers || 50

  const isOverLimit = avgViewers > limit
  const newDaysOverLimit = isOverLimit ? (sub.days_over_limit || 0) + 1 : 0

  // Determine tier status
  let tierStatus: 'within_limit' | 'approaching_limit' | 'over_limit' = 'within_limit'
  if (avgViewers > limit) {
    tierStatus = 'over_limit'
  } else if (avgViewers > limit * 0.8) {
    tierStatus = 'approaching_limit'
  }

  // Update subscription record
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      avg_viewers_30d: avgViewers,
      days_over_limit: newDaysOverLimit,
      tier_status: tierStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', sub.id)

  if (updateError) {
    console.error('Error updating subscription:', updateError)
  }

  // Determine suggested tier
  let suggestedTier: TierName | undefined
  if (sub.tier_name === 'Creator' && avgViewers > 50) {
    suggestedTier = 'Pro'
  } else if (sub.tier_name === 'Pro' && avgViewers > 250) {
    suggestedTier = 'Streamer+'
  }

  const percentOver = limit > 0 ? Math.round(((avgViewers - limit) / limit) * 100) : 0

  return {
    avgViewers,
    limit,
    isOverLimit,
    daysOverLimit: newDaysOverLimit,
    shouldNudge: newDaysOverLimit >= 7, // Nudge after 7 days over limit
    suggestedTier,
    percentOver
  }
}

/**
 * Get tier status for all active subscriptions
 */
export async function getAllTierStatuses() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, email, stripe_subscription_id, tier_name, plan_name, status, avg_viewer_limit, avg_viewers_30d, days_over_limit, tier_status, last_nudge_sent_at')
    .eq('status', 'active')
    .order('days_over_limit', { ascending: false })

  if (error) {
    console.error('Error fetching tier compliance:', error)
    return []
  }

  return data || []
}

/**
 * Get users who need upgrade nudges
 */
export async function getUsersNeedingNudges() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('tier_status', 'over_limit')
    .gte('days_over_limit', 7)
    .order('days_over_limit', { ascending: false })

  if (error) {
    console.error('Error fetching users needing nudges:', error)
    return []
  }

  // Filter to only those who haven't been nudged in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return (data || []).filter(sub => {
    if (!sub.last_nudge_sent_at) return true
    const lastNudge = new Date(sub.last_nudge_sent_at)
    return lastNudge < sevenDaysAgo
  })
}

/**
 * Mark nudge as sent for a user
 */
export async function markNudgeSent(subscriptionId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      last_nudge_sent_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)

  if (error) {
    console.error('Error marking nudge sent:', error)
  }
}

/**
 * Get tier status for a specific user (for dashboard display)
 */
export async function getUserTierStatus(userEmail: string): Promise<TierStatus | null> {
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('email', userEmail)
    .eq('status', 'active')
    .single()

  if (error || !sub) {
    return null
  }

  const limit = TIER_LIMITS[sub.tier_name as TierName]?.viewers || 50
  const avgViewers = sub.avg_viewers_30d || 0
  const isOverLimit = avgViewers > limit

  let suggestedTier: TierName | undefined
  if (sub.tier_name === 'Creator' && avgViewers > 50) {
    suggestedTier = 'Pro'
  } else if (sub.tier_name === 'Pro' && avgViewers > 250) {
    suggestedTier = 'Streamer+'
  }

  const percentOver = limit > 0 ? Math.round(((avgViewers - limit) / limit) * 100) : 0

  return {
    avgViewers,
    limit,
    isOverLimit,
    daysOverLimit: sub.days_over_limit || 0,
    shouldNudge: (sub.days_over_limit || 0) >= 7,
    suggestedTier,
    percentOver
  }
}
