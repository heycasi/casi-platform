import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('generate-report: missing or invalid Authorization header')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '').trim()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      console.error('generate-report: failed to resolve user', userError)
      return NextResponse.json({ error: 'Unable to resolve user from token' }, { status: 401 })
    }

    // 2. Body
    const body = await req.json().catch(() => null)
    if (!body) {
      console.error('generate-report: invalid JSON body')
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { organizationId, campaignName, dateRangeStart, dateRangeEnd, notes } = body

    if (!organizationId || !campaignName || !dateRangeStart || !dateRangeEnd) {
      console.error('generate-report: missing fields in body', body)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Check org membership + role
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      console.error('generate-report: user not member or error loading membership', membershipError)
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      )
    }

    if (membership.role !== 'owner') {
      console.error('generate-report: user is member but not owner', membership)
      return NextResponse.json(
        { error: 'Only organization owners can generate reports' },
        { status: 403 }
      )
    }

    // 4. Insert sponsor report
    const shareToken = crypto.randomUUID().replace(/-/g, '')

    const { data: insertData, error: insertError } = await supabase
      .from('sponsor_reports')
      .insert({
        organization_id: organizationId,
        campaign_name: campaignName,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
        notes,
        share_token: shareToken,
        generated_by: user.id,
      })
      .select('id, share_token')
      .single()

    if (insertError || !insertData) {
      console.error('generate-report: failed to insert sponsor_report', insertError)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    // IMPORTANT: use current request origin (so localhost in dev)
    const origin = req.nextUrl.origin
    const reportUrl = `${origin}/reports/sponsor/${insertData.share_token}`

    console.log('generate-report: report created', insertData)

    return NextResponse.json(
      {
        reportId: insertData.id,
        reportUrl,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('generate-report: unexpected error', err)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
