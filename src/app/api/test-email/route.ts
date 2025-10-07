// Test API endpoint for verifying email configuration

import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '../../../lib/email'
import { validateEmail, ValidationError } from '@/lib/validation'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.api.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Validate email using our validation library
    const validatedEmail = validateEmail(email)

    console.log('Sending test email to:', validatedEmail)
    const emailSent = await EmailService.sendTestEmail(validatedEmail)

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

    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

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