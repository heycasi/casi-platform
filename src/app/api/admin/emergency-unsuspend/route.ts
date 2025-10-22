// Emergency endpoint to unsuspend an account
// This should be removed after use or protected with a secret key

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json()

    // Basic protection - you can set this in your env
    const EMERGENCY_SECRET = process.env.EMERGENCY_UNSUSPEND_SECRET || 'casi-emergency-2025'

    if (secret !== EMERGENCY_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user by email
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Unban the user
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      ban_duration: 'none'
    })

    if (error) {
      console.error('Failed to unsuspend user:', error)
      return NextResponse.json(
        { error: 'Failed to unsuspend user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been unsuspended successfully`,
      user_id: user.id
    })

  } catch (error) {
    console.error('[Emergency Unsuspend] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
