import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get parameters
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const keyword = searchParams.get('keyword') || 'Red Bull'

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId parameter required' }, { status: 400 })
    }

    // Verify the user is an owner of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can view campaign analytics' },
        { status: 403 }
      )
    }

    // Get all talent members in this organization
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId)

    if (!members || members.length === 0) {
      return NextResponse.json({
        campaignName: keyword,
        totalMentions: 0,
        breakdown: [],
      })
    }

    const talentUserIds = members.map((m) => m.user_id)

    // Get user emails for all talent (needed to query sessions)
    const talentUserData: Record<string, { email: string; channelName: string }> = {}

    for (const userId of talentUserIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        if (userData?.user) {
          const displayName =
            userData.user.user_metadata?.preferred_username ||
            userData.user.user_metadata?.display_name ||
            userData.user.email?.split('@')[0] ||
            'Unknown'
          talentUserData[userId] = {
            email: userData.user.email || '',
            channelName: displayName,
          }
        }
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err)
      }
    }

    const talentEmails = Object.values(talentUserData)
      .map((d) => d.email)
      .filter(Boolean)

    if (talentEmails.length === 0) {
      return NextResponse.json({
        campaignName: keyword,
        totalMentions: 0,
        breakdown: [],
      })
    }

    // Get all sessions for these talent members
    const { data: sessions, error: sessionsError } = await supabase
      .from('stream_report_sessions')
      .select('id, streamer_email, channel_name')
      .in('streamer_email', talentEmails)

    if (sessionsError || !sessions || sessions.length === 0) {
      return NextResponse.json({
        campaignName: keyword,
        totalMentions: 0,
        breakdown: [],
      })
    }

    const sessionIds = sessions.map((s) => s.id)

    // Query campaign mentions from stream_chat_messages via session_id
    const { data: messages, error: messagesError } = await supabase
      .from('stream_chat_messages')
      .select('session_id, message, username')
      .in('session_id', sessionIds)
      .ilike('message', `%${keyword}%`)

    if (messagesError) {
      console.error('Error fetching campaign messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch campaign data' }, { status: 500 })
    }

    // Group mentions by streamer email (via session)
    const mentionsByEmail: Record<string, { count: number; channelName: string }> = {}

    for (const msg of messages || []) {
      // Find which session this message belongs to
      const session = sessions.find((s) => s.id === msg.session_id)
      if (!session) continue

      const email = session.streamer_email

      if (!mentionsByEmail[email]) {
        mentionsByEmail[email] = {
          count: 0,
          channelName: session.channel_name || 'Unknown',
        }
      }
      mentionsByEmail[email].count++
    }

    // Convert email-based data to userId-based data for the frontend
    const breakdown = Object.entries(mentionsByEmail).map(([email, data]) => {
      // Find the userId for this email
      const userId =
        Object.keys(talentUserData).find((uid) => talentUserData[uid].email === email) || email

      return {
        userId,
        channelName: data.channelName,
        mentions: data.count,
      }
    })

    const totalMentions = messages?.length || 0

    return NextResponse.json({
      campaignName: keyword,
      totalMentions,
      breakdown,
    })
  } catch (error: any) {
    console.error('Error in campaign analytics:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
