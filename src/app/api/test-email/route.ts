// Test email endpoint - send a test email with the new gradient background

import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Sending test email to:', email)
    const success = await EmailService.sendTestEmail(email)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
