/**
 * Test script to generate analytics data for existing session and send report
 * This will populate the new top_chatters and chat_timeline tables
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SESSION_ID = 'ebdac93a-c14f-4596-b25c-c2e176fc07b4' // fifakillvizualz session with 4442 messages
const CHANNEL_NAME = 'fifakillvizualz'

async function generateTopChattersData(sessionId, channelName) {
  console.log('📊 Generating top chatters data...')

  const { data: messages } = await supabase
    .from('stream_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })

  console.log(`   Found ${messages.length} messages`)

  // Calculate detailed stats per chatter
  const chatterStats = {}

  messages.forEach((msg) => {
    if (!chatterStats[msg.username]) {
      chatterStats[msg.username] = {
        messageCount: 0,
        questionCount: 0,
        sentimentSum: 0,
        sentimentCount: 0,
        highEngagementCount: 0,
        firstMessageAt: msg.timestamp,
        lastMessageAt: msg.timestamp,
        platform: msg.platform || 'twitch',
      }
    }

    const stats = chatterStats[msg.username]
    stats.messageCount++
    stats.lastMessageAt = msg.timestamp

    if (msg.is_question) stats.questionCount++
    if (msg.sentiment_score !== null) {
      stats.sentimentSum += msg.sentiment_score
      stats.sentimentCount++
    }
    if (msg.engagement_level === 'high') stats.highEngagementCount++
  })

  // Check for recurring users (chatted in last 10 streams)
  const { data: previousSessions } = await supabase
    .from('stream_report_sessions')
    .select('id')
    .eq('channel_name', channelName.toLowerCase())
    .neq('id', sessionId)
    .order('session_start', { ascending: false })
    .limit(10)

  const previousSessionIds = previousSessions?.map((s) => s.id) || []
  let recurringUsers = new Set()

  if (previousSessionIds.length > 0) {
    const { data: previousMessages } = await supabase
      .from('stream_chat_messages')
      .select('username')
      .in('session_id', previousSessionIds)

    if (previousMessages) {
      previousMessages.forEach((msg) => recurringUsers.add(msg.username))
    }
  }

  console.log(`   Found ${recurringUsers.size} recurring users`)

  // Prepare and insert data
  const topChattersData = Object.entries(chatterStats).map(([username, stats]) => ({
    session_id: sessionId,
    username,
    message_count: stats.messageCount,
    question_count: stats.questionCount,
    avg_sentiment_score: stats.sentimentCount > 0 ? stats.sentimentSum / stats.sentimentCount : 0,
    high_engagement_count: stats.highEngagementCount,
    first_message_at: stats.firstMessageAt,
    last_message_at: stats.lastMessageAt,
    is_recurring: recurringUsers.has(username),
    platform: stats.platform,
  }))

  const { error } = await supabase.from('stream_top_chatters').upsert(topChattersData, {
    onConflict: 'session_id,username',
    ignoreDuplicates: false,
  })

  if (error) throw error

  console.log(`✅ Inserted ${topChattersData.length} top chatters`)
  return topChattersData.length
}

async function generateChatTimeline(sessionId) {
  console.log('📈 Generating chat timeline...')

  const { data: messages } = await supabase
    .from('stream_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })

  const { data: session } = await supabase
    .from('stream_report_sessions')
    .select('session_start')
    .eq('id', sessionId)
    .single()

  const sessionStart = new Date(session.session_start).getTime()
  const lastMessageTime = new Date(messages[messages.length - 1].timestamp).getTime()
  const bucketSize = 2 * 60 * 1000 // 2 minutes

  const timelineBuckets = []

  for (let bucketStart = sessionStart; bucketStart <= lastMessageTime; bucketStart += bucketSize) {
    const bucketEnd = bucketStart + bucketSize
    const minuteOffset = Math.floor((bucketStart - sessionStart) / 60000)

    const bucketMessages = messages.filter((msg) => {
      const msgTime = new Date(msg.timestamp).getTime()
      return msgTime >= bucketStart && msgTime < bucketEnd
    })

    const uniqueChatters = new Set(bucketMessages.map((m) => m.username)).size
    const questionCount = bucketMessages.filter((m) => m.is_question).length
    const highEngagementCount = bucketMessages.filter((m) => m.engagement_level === 'high').length

    const sentimentScores = bucketMessages
      .filter((m) => m.sentiment_score !== null)
      .map((m) => m.sentiment_score)

    const avgSentimentScore =
      sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : null

    const messageCount = bucketMessages.length
    let activityIntensity
    if (messageCount < 10) activityIntensity = 'low'
    else if (messageCount < 30) activityIntensity = 'medium'
    else if (messageCount < 60) activityIntensity = 'high'
    else activityIntensity = 'peak'

    timelineBuckets.push({
      session_id: sessionId,
      time_bucket: new Date(bucketStart).toISOString(),
      minute_offset: minuteOffset,
      message_count: messageCount,
      unique_chatters: uniqueChatters,
      question_count: questionCount,
      avg_sentiment_score: avgSentimentScore,
      positive_count: bucketMessages.filter((m) => m.sentiment === 'positive').length,
      negative_count: bucketMessages.filter((m) => m.sentiment === 'negative').length,
      neutral_count: bucketMessages.filter((m) => m.sentiment === 'neutral').length,
      high_engagement_count: highEngagementCount,
      activity_intensity: activityIntensity,
    })
  }

  const { error } = await supabase.from('stream_chat_timeline').upsert(timelineBuckets, {
    onConflict: 'session_id,time_bucket',
    ignoreDuplicates: false,
  })

  if (error) throw error

  console.log(`✅ Inserted ${timelineBuckets.length} timeline buckets`)
  return timelineBuckets.length
}

async function sendReport(sessionId, email) {
  console.log('📧 Generating and sending report...')

  const response = await fetch('http://localhost:3000/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, email }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to generate report: ${error}`)
  }

  const data = await response.json()
  console.log('✅ Report sent successfully!')
  return data
}

async function main() {
  try {
    console.log('🚀 Testing new analytics features\n')
    console.log(`📺 Session: ${SESSION_ID}`)
    console.log(`👤 Channel: ${CHANNEL_NAME}\n`)

    // Generate analytics data
    await generateTopChattersData(SESSION_ID, CHANNEL_NAME)
    await generateChatTimeline(SESSION_ID)

    console.log('\n✅ Analytics data generated!')
    console.log('\n📧 Now sending test report...\n')

    // Send report via API
    await sendReport(SESSION_ID, 'connordahl@hotmail.com')

    console.log('\n🎉 Test complete! Check your email for the report with new features.')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
