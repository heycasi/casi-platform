-- Analytics Enhancements Migration
-- Adds stream title tracking, top chatters, and chat activity timeline features

-- ========================================
-- 1. ADD STREAM TITLE TRACKING
-- ========================================
-- Add stream metadata columns to stream_report_sessions
ALTER TABLE stream_report_sessions
ADD COLUMN IF NOT EXISTS stream_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS stream_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS stream_tags TEXT[],
ADD COLUMN IF NOT EXISTS avg_viewer_count INTEGER DEFAULT 0;

-- Create index for title searches and performance analysis
CREATE INDEX IF NOT EXISTS idx_stream_sessions_title ON stream_report_sessions(stream_title);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_category ON stream_report_sessions(stream_category);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_avg_viewers ON stream_report_sessions(avg_viewer_count);

COMMENT ON COLUMN stream_report_sessions.stream_title IS 'Stream title from Twitch/Kick for performance tracking';
COMMENT ON COLUMN stream_report_sessions.stream_category IS 'Game/category being streamed';
COMMENT ON COLUMN stream_report_sessions.stream_tags IS 'Stream tags for categorization';
COMMENT ON COLUMN stream_report_sessions.avg_viewer_count IS 'Average concurrent viewers for this stream';

-- ========================================
-- 2. TOP CHATTERS TABLE
-- ========================================
-- Stores detailed chatter statistics per stream session
CREATE TABLE IF NOT EXISTS stream_top_chatters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  message_count INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  avg_sentiment_score FLOAT DEFAULT 0,
  high_engagement_count INTEGER DEFAULT 0,
  first_message_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT false, -- Has chatted in previous streams
  platform VARCHAR(20) DEFAULT 'twitch',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, username)
);

-- Indexes for top chatters
CREATE INDEX IF NOT EXISTS idx_top_chatters_session ON stream_top_chatters(session_id);
CREATE INDEX IF NOT EXISTS idx_top_chatters_username ON stream_top_chatters(username);
CREATE INDEX IF NOT EXISTS idx_top_chatters_message_count ON stream_top_chatters(message_count DESC);
CREATE INDEX IF NOT EXISTS idx_top_chatters_recurring ON stream_top_chatters(is_recurring) WHERE is_recurring = true;

COMMENT ON TABLE stream_top_chatters IS 'Tracks most active chatters per stream session for community insights';
COMMENT ON COLUMN stream_top_chatters.is_recurring IS 'True if this user has chatted in previous streams (helps identify loyal community members)';

-- ========================================
-- 3. CHAT ACTIVITY TIMELINE TABLE
-- ========================================
-- Stores time-bucketed chat activity for timeline graphs
CREATE TABLE IF NOT EXISTS stream_chat_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL, -- 2-minute time buckets
  minute_offset INTEGER NOT NULL, -- Minutes from stream start (for easier graphing)
  message_count INTEGER DEFAULT 0,
  unique_chatters INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  avg_sentiment_score FLOAT,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  high_engagement_count INTEGER DEFAULT 0,
  activity_intensity VARCHAR(20) CHECK (activity_intensity IN ('low', 'medium', 'high', 'peak')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, time_bucket)
);

-- Indexes for chat timeline
CREATE INDEX IF NOT EXISTS idx_timeline_session ON stream_chat_timeline(session_id);
CREATE INDEX IF NOT EXISTS idx_timeline_bucket ON stream_chat_timeline(session_id, time_bucket);
CREATE INDEX IF NOT EXISTS idx_timeline_minute ON stream_chat_timeline(session_id, minute_offset);

COMMENT ON TABLE stream_chat_timeline IS 'Time-series chat activity data for visualizing engagement over stream duration';
COMMENT ON COLUMN stream_chat_timeline.minute_offset IS 'Minutes elapsed from stream start (0, 2, 4, 6...) for easier graphing';
COMMENT ON COLUMN stream_chat_timeline.activity_intensity IS 'Calculated intensity: low (<5 msg/min), medium (5-15), high (15-30), peak (30+)';

-- ========================================
-- 4. HELPER FUNCTIONS
-- ========================================

-- Function to calculate activity intensity based on message count
CREATE OR REPLACE FUNCTION calculate_activity_intensity(msg_count INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
  -- Assumes 2-minute buckets, so divide by 2 for messages per minute
  IF msg_count < 10 THEN RETURN 'low';
  ELSIF msg_count < 30 THEN RETURN 'medium';
  ELSIF msg_count < 60 THEN RETURN 'high';
  ELSE RETURN 'peak';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_activity_intensity IS 'Calculates activity intensity level based on message count in 2-minute bucket';

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS on new tables
ALTER TABLE stream_top_chatters ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat_timeline ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own top chatters" ON stream_top_chatters;
DROP POLICY IF EXISTS "Users can view their own chat timeline" ON stream_chat_timeline;
DROP POLICY IF EXISTS "Service role can manage top chatters" ON stream_top_chatters;
DROP POLICY IF EXISTS "Service role can manage chat timeline" ON stream_chat_timeline;

-- Users can only access their own stream data
CREATE POLICY "Users can view their own top chatters" ON stream_top_chatters
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM stream_report_sessions
      WHERE streamer_email = auth.email()
    )
  );

CREATE POLICY "Users can view their own chat timeline" ON stream_chat_timeline
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM stream_report_sessions
      WHERE streamer_email = auth.email()
    )
  );

-- Service role can manage everything
CREATE POLICY "Service role can manage top chatters" ON stream_top_chatters
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage chat timeline" ON stream_chat_timeline
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ========================================
-- 6. VERIFICATION QUERY
-- ========================================
-- Run this to verify the migration succeeded
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE table_name IN ('stream_report_sessions', 'stream_top_chatters', 'stream_chat_timeline')
ORDER BY table_name;

-- Verify new columns in stream_report_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stream_report_sessions'
  AND column_name IN ('stream_title', 'stream_category', 'stream_tags', 'avg_viewer_count')
ORDER BY column_name;
