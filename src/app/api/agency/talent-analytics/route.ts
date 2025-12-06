import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/agency/talent-analytics?organizationId={id}
 * Get aggregated analytics for all talent in an organization (God View)
 * Only accessible by organization owners
 */
export async function GET(req: NextRequest) {
  try {
    // Get the requesting user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 [Talent Analytics] Request from user:', user.email, user.id)

    // Get organizationId from query params
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    console.log('📋 [Talent Analytics] Organization ID:', organizationId)

    // FIX #2: Verify ownership via organization_members (not owner_id column)
    const { data: ownerCheck, error: ownerError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    console.log('👤 [Talent Analytics] Owner check:', { ownerCheck, ownerError })

    if (ownerError || !ownerCheck || ownerCheck.role !== 'owner') {
      console.error('❌ [Talent Analytics] Not an owner or org not found')
      return NextResponse.json(
        { error: 'Organization not found or you do not have permission' },
        { status: 403 }
      )
    }

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    console.log('🏢 [Talent Analytics] Organization:', organization?.name)

    // FIX #1: Remove role filter - get ALL members, not just role='talent'
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('organization_id', organizationId)

    console.log('👥 [Talent Analytics] Raw members from DB:', {
      count: members?.length || 0,
      members: members?.map((m) => ({ user_id: m.user_id, role: m.role })),
      error: membersError,
    })

    if (membersError) {
      console.error('❌ [Talent Analytics] Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    if (!members || members.length === 0) {
      console.warn('⚠️ [Talent Analytics] No members found in organization')
      return NextResponse.json({
        organization,
        talentCount: 0,
        talent: [],
        stats: {
          totalStreams: 0,
          totalMessages: 0,
          avgViewers: 0,
        },
        organizationTotals: {
          totalSessions: 0,
          totalMessages: 0,
          avgViewersAcrossAllTalent: 0,
          activeTalent: 0,
        },
      })
    }

    // Filter out the owner (exclude yourself from talent list)
    const talentMembers = members.filter((m) => m.role !== 'owner')
    console.log('🎯 [Talent Analytics] Talent members (excluding owner):', talentMembers.length)

    const talentUserIds = talentMembers.map((m) => m.user_id)

    // Fetch analytics for each talent member
    const talentAnalytics = await Promise.all(
      talentUserIds.map(async (userId) => {
        console.log(`📊 [Talent Analytics] Processing user: ${userId}`)

        // Get user details
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        console.log(`   ├─ User email: ${userData?.user?.email}`)

        const userEmail = userData?.user?.email

        // FIX #3: Query sessions by streamer_email (not user_id)
        const { data: sessions, error: sessionsError } = await supabase
          .from('stream_report_sessions')
          .select('*')
          .eq('streamer_email', userEmail)
          .order('session_start', { ascending: false })

        if (sessionsError) {
          console.error(`   ├─ ❌ Error fetching sessions:`, sessionsError)
        } else {
          console.log(`   ├─ ✅ Sessions found: ${sessions?.length || 0}`)
        }

        // Calculate aggregated stats
        const totalSessions = sessions?.length || 0
        const totalMessages = sessions?.reduce((sum, s) => sum + (s.total_messages || 0), 0) || 0
        const totalViewers = sessions?.reduce((sum, s) => sum + (s.peak_viewer_count || 0), 0) || 0
        const avgViewers = totalSessions > 0 ? Math.round(totalViewers / totalSessions) : 0

        console.log(
          `   └─ Stats: ${totalSessions} sessions, ${totalMessages} messages, ${avgViewers} avg viewers`
        )

        // Get latest session
        const latestSession = sessions?.[0] || null

        // Get session with most messages (best stream)
        const bestStream = sessions?.reduce((best, current) => {
          if (!best) return current
          return (current.total_messages || 0) > (best.total_messages || 0) ? current : best
        }, null as any)

        return {
          userId,
          email: userData?.user?.email,
          displayName:
            userData?.user?.user_metadata?.display_name ||
            userData?.user?.user_metadata?.preferred_username,
          avatarUrl: userData?.user?.user_metadata?.avatar_url,
          channelName: latestSession?.channel_name,
          stats: {
            totalSessions,
            totalMessages,
            avgViewers,
            lastStreamDate: latestSession?.session_start || null,
            lastStreamDuration: latestSession?.duration_minutes || 0,
            bestStreamMessages: bestStream?.total_messages || 0,
            bestStreamDate: bestStream?.session_start || null,
          },
          recentSessions: sessions?.slice(0, 5) || [], // Last 5 sessions
        }
      })
    )

    // Calculate organization-wide totals
    const orgTotals = {
      totalSessions: talentAnalytics.reduce((sum, t) => sum + t.stats.totalSessions, 0),
      totalMessages: talentAnalytics.reduce((sum, t) => sum + t.stats.totalMessages, 0),
      avgViewersAcrossAllTalent: Math.round(
        talentAnalytics.reduce((sum, t) => sum + t.stats.avgViewers, 0) /
          (talentAnalytics.length || 1)
      ),
      activeTalent: talentAnalytics.length, // CHANGED: Show ALL talent, not just those with sessions
    }

    console.log('📈 [Talent Analytics] Organization Totals:', orgTotals)

    return NextResponse.json({
      organization,
      talentCount: talentAnalytics.length,
      talent: talentAnalytics,
      stats: {
        totalStreams: orgTotals.totalSessions,
        totalMessages: orgTotals.totalMessages,
        avgViewers: orgTotals.avgViewersAcrossAllTalent,
      },
      organizationTotals: orgTotals,
    })
  } catch (error: any) {
    console.error('❌ [Talent Analytics] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
