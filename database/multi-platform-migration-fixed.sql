-- Multi-Platform Support Migration (FIXED)
-- Adds platform columns to support Twitch, Kick, and future platforms
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. ADD PLATFORM COLUMN TO stream_chat_messages
-- ============================================================================

-- Add platform column (defaults to 'twitch' for backward compatibility)
ALTER TABLE stream_chat_messages
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add platform_message_id for deduplication
ALTER TABLE stream_chat_messages
ADD COLUMN IF NOT EXISTS platform_message_id VARCHAR(255);

-- Add index for efficient platform filtering
CREATE INDEX IF NOT EXISTS idx_messages_platform
ON stream_chat_messages(platform, session_id);

-- Add index for platform message ID lookups
CREATE INDEX IF NOT EXISTS idx_messages_platform_id
ON stream_chat_messages(platform_message_id)
WHERE platform_message_id IS NOT NULL;

COMMENT ON COLUMN stream_chat_messages.platform IS 'Chat platform: twitch, kick, etc.';
COMMENT ON COLUMN stream_chat_messages.platform_message_id IS 'Platform-specific message ID for deduplication';

-- ============================================================================
-- 2. ADD PLATFORM COLUMN TO stream_report_sessions
-- ============================================================================

-- Add platform column
ALTER TABLE stream_report_sessions
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add index for platform filtering
CREATE INDEX IF NOT EXISTS idx_sessions_platform
ON stream_report_sessions(platform, streamer_email);

COMMENT ON COLUMN stream_report_sessions.platform IS 'Primary streaming platform for this session';

-- ============================================================================
-- 3. ADD KICK USERNAME TO SUBSCRIPTIONS TABLE
-- ============================================================================

-- Note: Using subscriptions table instead of users table
-- Add Kick username field
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS kick_username VARCHAR(255);

-- Add unique constraint (usernames should be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_kick_username
ON subscriptions(kick_username)
WHERE kick_username IS NOT NULL;

COMMENT ON COLUMN subscriptions.kick_username IS 'Optional Kick.com username for multi-platform streaming';

-- ============================================================================
-- 4. ADD PLATFORM COLUMN TO stream_events
-- ============================================================================

-- Add platform column to stream events (subs, follows, raids, etc.)
ALTER TABLE stream_events
ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add index (using channel_email instead of session_id)
CREATE INDEX IF NOT EXISTS idx_events_platform
ON stream_events(platform, channel_email);

COMMENT ON COLUMN stream_events.platform IS 'Platform where the event occurred';

-- ============================================================================
-- 5. UPDATE EXISTING RLS POLICIES (if needed)
-- ============================================================================

-- stream_chat_messages policies already exist and should work fine
-- No changes needed as platform is just another column

-- ============================================================================
-- 6. CREATE VIEW FOR MULTI-PLATFORM ANALYTICS
-- ============================================================================

-- Useful view for analyzing messages across platforms
CREATE OR REPLACE VIEW vw_messages_by_platform AS
SELECT
  session_id,
  platform,
  COUNT(*) as message_count,
  COUNT(DISTINCT username) as unique_chatters,
  COUNT(CASE WHEN is_question THEN 1 END) as questions_count,
  COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
  COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
  COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
  AVG(sentiment_score) as avg_sentiment_score,
  COUNT(CASE WHEN engagement_level = 'high' THEN 1 END) as high_engagement_count
FROM stream_chat_messages
GROUP BY session_id, platform;

COMMENT ON VIEW vw_messages_by_platform IS 'Analytics breakdown by platform for each session';

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Verify platform column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stream_chat_messages'
    AND column_name = 'platform'
  ) THEN
    RAISE NOTICE '✅ platform column added to stream_chat_messages';
  ELSE
    RAISE EXCEPTION '❌ platform column NOT added to stream_chat_messages';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stream_report_sessions'
    AND column_name = 'platform'
  ) THEN
    RAISE NOTICE '✅ platform column added to stream_report_sessions';
  ELSE
    RAISE EXCEPTION '❌ platform column NOT added to stream_report_sessions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions'
    AND column_name = 'kick_username'
  ) THEN
    RAISE NOTICE '✅ kick_username column added to subscriptions';
  ELSE
    RAISE EXCEPTION '❌ kick_username column NOT added to subscriptions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stream_events'
    AND column_name = 'platform'
  ) THEN
    RAISE NOTICE '✅ platform column added to stream_events';
  ELSE
    RAISE EXCEPTION '❌ platform column NOT added to stream_events';
  END IF;

  RAISE NOTICE '✅ Multi-platform migration completed successfully!';
END $$;

-- ============================================================================
-- 8. SAMPLE QUERIES TO TEST
-- ============================================================================

/*
-- Get platform breakdown for a session
SELECT
  platform,
  COUNT(*) as messages,
  COUNT(DISTINCT username) as chatters
FROM stream_chat_messages
WHERE session_id = 'your-session-id'
GROUP BY platform;

-- Get all sessions with multi-platform data
SELECT * FROM vw_messages_by_platform
WHERE session_id IN (
  SELECT session_id
  FROM stream_chat_messages
  GROUP BY session_id
  HAVING COUNT(DISTINCT platform) > 1
);

-- Get user's Kick username
SELECT kick_username
FROM subscriptions
WHERE email = 'user@example.com';
*/
