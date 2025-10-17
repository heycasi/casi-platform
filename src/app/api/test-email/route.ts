import { NextRequest, NextResponse } from 'next/server'
import { sendUpgradeNudgeEmail } from '@/lib/emailTemplates/upgradeNudge'

/**
 * Test endpoint to send upgrade nudge email
 * POST /api/test-email
 * Body: { "email": "test@example.com" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    await sendUpgradeNudgeEmail({
      email,
      userName: email.split('@')[0],
      currentTier: 'Pro',
      avgViewers: 300,
      viewerLimit: 250
    })

    return NextResponse.json({
      success: true,
      message: `Test upgrade nudge email sent to ${email}`
    })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
