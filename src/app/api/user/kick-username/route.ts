// API endpoint to get user's Kick username
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Fetch Kick username from subscriptions table
    const { data, error } = await supabase
      .from('subscriptions')
      .select('kick_username')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found - return empty
        return NextResponse.json({ kick_username: null })
      }
      throw error
    }

    return NextResponse.json({
      kick_username: data?.kick_username || null,
    })
  } catch (error: any) {
    console.error('[Kick Username API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Kick username' },
      { status: 500 }
    )
  }
}
