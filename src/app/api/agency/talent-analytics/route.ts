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

    // Get organizationId from query params
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Verify that the requesting user owns this organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or you do not have permission' },
        { status: 403 }
      )
    }

    // Get all talent members of this organization
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('role', 'talent')

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        organization,
        talentCount: 0,
        talent: [],
        totalSessions: 0,
        totalMessages: 0,
        totalViewers: 0,
      })
    }

    const talentUserIds = members.map((m) => m.user_id)

    // Fetch analytics for each talent member
    const talentAnalytics = await Promise.all(
      talentUserIds.map(async (userId) => {
        // Get user details
        const { data: userData } = await supabase.auth.admin.getUserById(userId)

        // Get stream sessions for this user
        const { data: sessions, error: sessionsError } = await supabase
          .from('stream_report_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('session_start', { ascending: false })

        if (sessionsError) {
          console.error(`Error fetching sessions for user ${userId}:`, sessionsError)
        }

        // Calculate aggregated stats
        const totalSessions = sessions?.length || 0
        const totalMessages = sessions?.reduce((sum, s) => sum + (s.total_messages || 0), 0) || 0
        const totalViewers = sessions?.reduce((sum, s) => sum + (s.peak_viewer_count || 0), 0) || 0
        const avgViewers = totalSessions > 0 ? Math.round(totalViewers / totalSessions) : 0

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
      activeTalent: talentAnalytics.filter((t) => t.stats.totalSessions > 0).length,
    }

    return NextResponse.json({
      organization,
      talentCount: talentAnalytics.length,
      talent: talentAnalytics,
      organizationTotals: orgTotals,
    })
  } catch (error: any) {
    console.error('Talent analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
