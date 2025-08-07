-- Stream Reports Migration - Uses unique table names to avoid conflicts
-- This works alongside your existing tables

-- Create stream reports specific tables with unique names
CREATE TABLE IF NOT EXISTS stream_report_sessions (
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

CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS stream_session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS stream_report_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  delivery_timestamp TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stream_report_sessions_email ON stream_report_sessions(streamer_email);
CREATE INDEX IF NOT EXISTS idx_stream_report_sessions_channel ON stream_report_sessions(channel_name);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_session ON stream_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_timestamp ON stream_chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_stream_session_analytics_session ON stream_session_analytics(session_id);

-- Enable Row Level Security
ALTER TABLE stream_report_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_report_deliveries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can manage own stream report sessions" ON stream_report_sessions
  FOR ALL USING (streamer_email = auth.email());

CREATE POLICY IF NOT EXISTS "Users can access own stream chat messages" ON stream_chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_report_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can access own stream session analytics" ON stream_session_analytics
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_report_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can access own stream report deliveries" ON stream_report_deliveries
  FOR ALL USING (email = auth.email());

-- Verify tables were created
SELECT 
  table_name,
  'Stream Reports table created successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stream_report_sessions', 'stream_chat_messages', 'stream_session_analytics', 'stream_report_deliveries')
ORDER BY table_name;