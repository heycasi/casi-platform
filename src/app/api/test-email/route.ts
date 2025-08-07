// Test API endpoint for verifying email configuration

import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log('Sending test email to:', email)
    const emailSent = await EmailService.sendTestEmail(email)

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!' 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email. Check your RESEND_API_KEY configuration.' },
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

export async function GET() {
  return NextResponse.json({
    message: 'Test email endpoint is working!',
    usage: 'POST with { "email": "your@email.com" }',
    env_check: {
      resend_configured: !!process.env.RESEND_API_KEY,
      supabase_configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  })
}