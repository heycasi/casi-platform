import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Check if exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('email', email)
      .single()
    if (existing) return NextResponse.json({ message: 'Subscription already exists' })

    // Verify user exists if userId is provided
    let validUserId = null
    if (userId) {
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
      if (!userError && user) {
        validUserId = userId
      }
    }

    // Create Starter subscription
    const { error } = await supabase.from('subscriptions').insert({
      email,
      user_id: validUserId,
      tier_name: 'Starter',
      plan_name: 'Starter',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
