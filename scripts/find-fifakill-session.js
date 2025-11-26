const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findFifakillSession() {
  console.log('🔍 Searching for fifakillvizualz session...\n')

  const { data: sessions } = await supabase
    .from('stream_report_sessions')
    .select('id, channel_name, session_start, session_end, streamer_email')
    .ilike('channel_name', '%fifakill%')
    .not('session_end', 'is', null)
    .order('session_start', { ascending: false })
    .limit(5)

  for (const session of sessions) {
    const { count } = await supabase
      .from('stream_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    console.log(`✅ Found session:`)
    console.log(`   Session ID: ${session.id}`)
    console.log(`   Channel: ${session.channel_name}`)
    console.log(`   Email: ${session.streamer_email}`)
    console.log(`   Messages: ${count}`)
    console.log(`   Date: ${new Date(session.session_start).toLocaleString()}\n`)
  }
}

findFifakillSession()
