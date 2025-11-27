// API endpoint for saving chat messages to database
// POST /api/chat-messages - Save chat messages in batches

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 60 requests per minute for chat messages
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.general.check(clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      )
    }

    const { sessionId, messages } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate session exists
    const { data: session, error: sessionError } = await supabase
      .from('stream_report_sessions')
      .select('id, channel_name, streamer_email')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 404 })
    }

    // Prepare messages for insertion
    const messagesToInsert = messages.map((msg) => {
      // Map sentiment score to string (neutral by default if 0)
      let sentimentString: 'positive' | 'negative' | 'neutral' = 'neutral'
      if (msg.sentiment > 0) sentimentString = 'positive'
      else if (msg.sentiment < 0) sentimentString = 'negative'

      // Map engagement level to allowed values, default to 'medium' for 'normal'
      let engagementLevelString: 'high' | 'medium' | 'low' = 'medium'
      if (msg.engagementLevel === 'high') engagementLevelString = 'high'
      else if (msg.engagementLevel === 'low') engagementLevelString = 'low'

      return {
        session_id: sessionId,
        username: msg.username,
        message: msg.message,
        timestamp: new Date(msg.timestamp).toISOString(),
        sentiment: sentimentString,
        is_question: msg.isQuestion || false,
        language: msg.language || 'english',
        engagement_level: engagementLevelString,
      }
    })

    // Batch insert messages
    const { data, error } = await supabase
      .from('stream_chat_messages')
      .insert(messagesToInsert)
      .select('id')

    if (error) {
      console.error('Failed to insert chat messages:', error)
      return NextResponse.json(
        { error: 'Failed to save messages', details: error.message },
        { status: 500 }
      )
    }

    // Update session's total_messages count
    const messageCount = data?.length || 0
    if (messageCount > 0) {
      const { error: updateError } = await supabase.rpc('increment_session_messages', {
        p_session_id: sessionId,
        p_increment: messageCount,
      })

      if (updateError) {
        console.error('Failed to update total_messages:', updateError)
        // Don't fail the request - messages were saved successfully
      }
    }

    return NextResponse.json({
      success: true,
      saved: messageCount,
    })
  } catch (error: any) {
    console.error('Chat message save error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
