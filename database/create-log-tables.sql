-- Create Log Tables for Admin Logs Page
-- This migration creates subscription_logs and api_logs tables for monitoring system events

-- ========================================
-- 1. SUBSCRIPTION_LOGS TABLE
-- ========================================
-- Stores Stripe webhook events for subscription monitoring
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('success', 'warning', 'error')),
  message TEXT,
  user_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscription_logs
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON subscription_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_event_type ON subscription_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_level ON subscription_logs(level);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_email ON subscription_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_stripe_customer ON subscription_logs(stripe_customer_id);

-- ========================================
-- 2. API_LOGS TABLE
-- ========================================
-- Stores general API errors and events for debugging
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL, -- e.g., 'Twitch', 'Resend', 'Supabase', 'API'
  event_type TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('success', 'warning', 'error')),
  message TEXT,
  user_email TEXT,
  user_id UUID,
  endpoint TEXT, -- API endpoint that generated the log
  status_code INTEGER, -- HTTP status code
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for api_logs
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_service ON api_logs(service);
CREATE INDEX IF NOT EXISTS idx_api_logs_event_type ON api_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_email ON api_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);

-- ========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS (logs should only be accessible via service role)
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage subscription_logs" ON subscription_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage api_logs" ON api_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ========================================
-- 4. HELPER FUNCTION TO AUTO-CLEAN OLD LOGS
-- ========================================
-- Function to delete logs older than 30 days (keeps database size manageable)
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete subscription logs older than 30 days
  DELETE FROM subscription_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete API logs older than 30 days
  DELETE FROM api_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  RAISE NOTICE 'Cleaned up logs older than 30 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE subscription_logs IS 'Stores Stripe webhook events for subscription monitoring and debugging';
COMMENT ON TABLE api_logs IS 'Stores general API errors and events across all services';
COMMENT ON COLUMN subscription_logs.event_id IS 'Unique Stripe event ID to prevent duplicate processing';
COMMENT ON COLUMN subscription_logs.level IS 'Log severity: success (normal operation), warning (attention needed), error (failed operation)';
COMMENT ON COLUMN api_logs.service IS 'Service that generated the log (Twitch, Resend, Supabase, etc.)';
COMMENT ON COLUMN api_logs.endpoint IS 'API endpoint that generated this log entry';
COMMENT ON FUNCTION clean_old_logs IS 'Deletes logs older than 30 days to keep database size manageable. Run this as a cron job.';

-- ========================================
-- 6. VERIFICATION QUERY
-- ========================================
-- Run this to verify the tables were created correctly
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE table_name IN ('subscription_logs', 'api_logs')
ORDER BY table_name;
