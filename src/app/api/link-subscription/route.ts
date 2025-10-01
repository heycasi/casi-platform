import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }

    // Check if there's an existing subscription with this email
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.error('Error fetching subscription:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check subscription' },
        { status: 500 }
      )
    }

    if (subscription) {
      // Link the subscription to the user
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ user_id: userId })
        .eq('id', subscription.id)

      if (updateError) {
        console.error('Error linking subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to link subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        linked: true,
        subscription: {
          plan_name: subscription.plan_name,
          status: subscription.status
        }
      })
    }

    return NextResponse.json({ linked: false })
  } catch (error: any) {
    console.error('Link subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
