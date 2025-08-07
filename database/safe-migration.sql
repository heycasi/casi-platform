-- Safe migration that handles existing tables
-- Run this step by step to avoid conflicts

-- Step 1: Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stream_sessions', 'chat_messages', 'session_analytics', 'report_deliveries');

-- Step 2: Drop any existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage own stream sessions" ON stream_sessions;
DROP POLICY IF EXISTS "Users can access own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can access own analytics" ON session_analytics;
DROP POLICY IF EXISTS "Users can access own reports" ON report_deliveries;

-- Step 3: Drop existing tables if they exist (safer approach)
DROP TABLE IF EXISTS report_deliveries;
DROP TABLE IF EXISTS session_analytics;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS stream_sessions;

-- Step 4: Create fresh tables
CREATE TABLE stream_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_email TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  peak_viewer_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  unique_chatters INTEGER DEFAULT 0,
  report_generated BOOLEAN DEFAULT FALSE,
  report_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_sessions(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT,
  language_confidence FLOAT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score FLOAT,
  sentiment_reason TEXT,
  is_question BOOLEAN DEFAULT FALSE,
  question_type TEXT,
  engagement_level TEXT CHECK (engagement_level IN ('high', 'medium', 'low')),
  topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_sessions(id) ON DELETE CASCADE,
  total_messages INTEGER DEFAULT 0,
  questions_count INTEGER DEFAULT 0,
  positive_messages INTEGER DEFAULT 0,
  negative_messages INTEGER DEFAULT 0,
  neutral_messages INTEGER DEFAULT 0,
  avg_sentiment_score FLOAT DEFAULT 0,
  languages_detected JSONB,
  topics_discussed JSONB,
  engagement_peaks JSONB,
  high_engagement_messages INTEGER DEFAULT 0,
  most_active_chatters JSONB,
  motivational_insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_sessions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  delivery_timestamp TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX idx_stream_sessions_email ON stream_sessions(streamer_email);
CREATE INDEX idx_stream_sessions_channel ON stream_sessions(channel_name);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_session_analytics_session ON session_analytics(session_id);

-- Step 6: Enable RLS
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_deliveries ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies
CREATE POLICY "Users can manage own stream sessions" ON stream_sessions
  FOR ALL USING (streamer_email = auth.email());

CREATE POLICY "Users can access own chat messages" ON chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY "Users can access own analytics" ON session_analytics
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY "Users can access own reports" ON report_deliveries
  FOR ALL USING (email = auth.email());

-- Step 8: Verify tables were created
SELECT 
  table_name,
  'Created successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stream_sessions', 'chat_messages', 'session_analytics', 'report_deliveries')
ORDER BY table_name;