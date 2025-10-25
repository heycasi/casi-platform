#!/usr/bin/env node
// Script to check post-stream report status for debugging

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkReportStatus(channelName = 'millzaatv') {
  console.log(`\n🔍 Checking report status for channel: ${channelName}\n`);

  // Check for sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('stream_report_sessions')
    .select('*')
    .eq('channel_name', channelName.toLowerCase())
    .order('session_start', { ascending: false })
    .limit(10);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
    return;
  }

  console.log(`📊 Found ${sessions?.length || 0} sessions for ${channelName}:\n`);

  if (!sessions || sessions.length === 0) {
    console.log('   No sessions found. This could mean:');
    console.log('   1. User never connected to the dashboard');
    console.log('   2. Session creation failed');
    console.log('   3. Channel name mismatch\n');
    return;
  }

  sessions.forEach((session, index) => {
    console.log(`   ${index + 1}. Session ID: ${session.id}`);
    console.log(`      Start: ${session.session_start}`);
    console.log(`      End: ${session.session_end || 'Still active or not ended properly'}`);
    console.log(`      Duration: ${session.duration_minutes || 0} minutes`);
    console.log(`      Peak Viewers: ${session.peak_viewer_count || 0}`);
    console.log(`      Report Generated: ${session.report_generated ? '✅ Yes' : '❌ No'}`);
    console.log(`      Report Sent: ${session.report_sent ? '✅ Yes' : '❌ No'}`);
    console.log('');
  });

  // Check for report deliveries
  const sessionIds = sessions.map(s => s.id);
  const { data: deliveries } = await supabase
    .from('stream_report_deliveries')
    .select('*')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false });

  console.log(`📧 Report Deliveries: ${deliveries?.length || 0}\n`);

  if (deliveries && deliveries.length > 0) {
    deliveries.forEach((delivery, index) => {
      console.log(`   ${index + 1}. Delivery to: ${delivery.email}`);
      console.log(`      Status: ${delivery.delivery_status}`);
      console.log(`      Timestamp: ${delivery.delivery_timestamp || delivery.created_at}`);
      if (delivery.error_message) {
        console.log(`      Error: ${delivery.error_message}`);
      }
      console.log('');
    });
  } else {
    console.log('   No delivery records found.\n');
  }

  // Check for chat messages in latest session
  if (sessions && sessions.length > 0) {
    const latestSession = sessions[0];
    const { data: messages, count } = await supabase
      .from('stream_chat_messages')
      .select('*', { count: 'exact', head: false })
      .eq('session_id', latestSession.id)
      .limit(5);

    console.log(`💬 Chat Messages in Latest Session (${latestSession.id}):\n`);
    console.log(`   Total: ${count || 0} messages`);

    if (messages && messages.length > 0) {
      console.log(`   Sample messages:`);
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`      ${index + 1}. @${msg.username}: ${msg.message?.substring(0, 50)}${msg.message?.length > 50 ? '...' : ''}`);
      });
    }
    console.log('');
  }

  // Diagnose issues
  console.log('🔧 DIAGNOSIS:\n');

  const latestSession = sessions[0];
  const hasMessages = await supabase
    .from('stream_chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', latestSession.id);

  if (!latestSession.session_end) {
    console.log('   ⚠️  Session was never properly ended');
    console.log('   → User may have closed browser without disconnecting');
    console.log('   → endSession() was never called\n');
  }

  if (latestSession.session_end && !latestSession.report_generated) {
    console.log('   ⚠️  Session ended but report was never generated');
    console.log('   → Check if generateReport() was called');
    console.log('   → Check browser console for errors');
    console.log('   → Verify email address is set in user state\n');
  }

  if (latestSession.report_generated && !latestSession.report_sent) {
    console.log('   ⚠️  Report generated but email failed to send');
    console.log('   → Check RESEND_API_KEY environment variable');
    console.log('   → Check Resend domain verification');
    console.log('   → Check delivery_status in stream_report_deliveries\n');
  }

  if (hasMessages.count === 0) {
    console.log('   ⚠️  No chat messages were captured');
    console.log('   → WebSocket connection may have failed');
    console.log('   → Check if channel was live');
    console.log('   → Check if chat had any activity\n');
  }

  if (latestSession.report_generated && latestSession.report_sent) {
    console.log('   ✅ Everything looks good! Report was generated and sent.');
    console.log(`   → Check email inbox for ${sessions[0].streamer_email}\n`);
  }
}

// Run the check
const channelName = process.argv[2] || 'millzaatv';
checkReportStatus(channelName)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
