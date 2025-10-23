import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, reason } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Insert into unsubscribes table
    const { error: insertError } = await supabase
      .from('email_unsubscribes')
      .insert({
        email: email.toLowerCase(),
        reason: reason || null
      })

    if (insertError) {
      // If email already unsubscribed, that's okay
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json({
          success: true,
          message: 'You are already unsubscribed from our emails.'
        })
      }

      console.error('Failed to unsubscribe:', insertError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our emails.'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if email is unsubscribed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('email_unsubscribes')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Failed to check unsubscribe status:', error)
      return NextResponse.json(
        { error: 'Failed to check status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isUnsubscribed: !!data
    })

  } catch (error) {
    console.error('Check unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
