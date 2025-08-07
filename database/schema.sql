-- Supabase Database Schema for Casi Platform Stream Analytics

-- Stream sessions table
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

-- Chat messages table for detailed analytics
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
  topics TEXT[], -- Array of detected topics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session analytics summary table
CREATE TABLE IF NOT EXISTS stream_session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  total_messages INTEGER DEFAULT 0,
  questions_count INTEGER DEFAULT 0,
  positive_messages INTEGER DEFAULT 0,
  negative_messages INTEGER DEFAULT 0,
  neutral_messages INTEGER DEFAULT 0,
  avg_sentiment_score FLOAT DEFAULT 0,
  languages_detected JSONB, -- {"english": 45, "spanish": 12, "french": 3}
  topics_discussed JSONB, -- {"gaming": 23, "technical": 8, "personal": 5}
  engagement_peaks JSONB, -- [{"timestamp": "...", "intensity": 0.8}, ...]
  high_engagement_messages INTEGER DEFAULT 0,
  most_active_chatters JSONB, -- [{"username": "user1", "count": 15}, ...]
  motivational_insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report delivery log
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stream_report_sessions_email ON stream_report_sessions(streamer_email);
CREATE INDEX IF NOT EXISTS idx_stream_report_sessions_channel ON stream_report_sessions(channel_name);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_session ON stream_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_timestamp ON stream_chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_stream_session_analytics_session ON stream_session_analytics(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE stream_report_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_report_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own stream data
CREATE POLICY "Users can manage own stream sessions" ON stream_report_sessions
  FOR ALL USING (streamer_email = auth.email());

CREATE POLICY "Users can access own chat messages" ON stream_chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_report_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY "Users can access own analytics" ON stream_session_analytics
  FOR ALL USING (
    session_id IN (
      SELECT id FROM stream_report_sessions WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY "Users can access own reports" ON stream_report_deliveries
  FOR ALL USING (email = auth.email());