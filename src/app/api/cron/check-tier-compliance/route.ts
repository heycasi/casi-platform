import { NextRequest, NextResponse } from 'next/server'
import { getAllTierStatuses, checkAndUpdateTierStatus, getUsersNeedingNudges, markNudgeSent } from '@/lib/tierTracking'
import { sendUpgradeNudgeEmail } from '@/lib/emailTemplates/upgradeNudge'

/**
 * Cron job to check tier compliance for all active subscriptions
 * This should run daily via Vercel Cron or similar
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-tier-compliance",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting tier compliance check...')

    // Get all active subscriptions
    const tierStatuses = await getAllTierStatuses()
    console.log(`📊 Found ${tierStatuses.length} active subscriptions`)

    // Update tier status for each subscription
    const updates: Promise<any>[] = []
    for (const status of tierStatuses) {
      updates.push(
        checkAndUpdateTierStatus(status.email, status.stripe_subscription_id)
      )
    }

    await Promise.all(updates)
    console.log('✅ Updated tier statuses')

    // Find users who need upgrade nudges
    const usersNeedingNudges = await getUsersNeedingNudges()
    console.log(`📧 Found ${usersNeedingNudges.length} users needing upgrade nudges`)

    // Send nudge emails
    const emailsSent: string[] = []
    const emailsFailed: string[] = []

    for (const subscription of usersNeedingNudges) {
      try {
        await sendUpgradeNudgeEmail({
          email: subscription.email,
          userName: subscription.email.split('@')[0], // Use email prefix as fallback
          currentTier: subscription.tier_name,
          avgViewers: subscription.avg_viewers_30d,
          viewerLimit: subscription.avg_viewer_limit
        })

        await markNudgeSent(subscription.id)
        emailsSent.push(subscription.email)
        console.log(`✅ Sent nudge to ${subscription.email}`)
      } catch (error) {
        console.error(`❌ Failed to send nudge to ${subscription.email}:`, error)
        emailsFailed.push(subscription.email)
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      subscriptionsChecked: tierStatuses.length,
      nudgesSent: emailsSent.length,
      nudgesFailed: emailsFailed.length,
      details: {
        emailsSent,
        emailsFailed
      }
    }

    console.log('✅ Tier compliance check completed:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Tier compliance check failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggers
export async function POST(req: NextRequest) {
  return GET(req)
}
