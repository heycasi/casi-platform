-- Tier Tracking Migration for Casi Platform
-- Adds viewer-based tier compliance tracking to subscriptions table

-- Add new columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS tier_name TEXT CHECK (tier_name IN ('Creator', 'Pro', 'Streamer+')),
ADD COLUMN IF NOT EXISTS avg_viewer_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS avg_viewers_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS days_over_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_nudge_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tier_status TEXT DEFAULT 'within_limit' CHECK (tier_status IN ('within_limit', 'approaching_limit', 'over_limit'));

-- Update existing subscriptions with tier_name from plan_name
UPDATE subscriptions
SET tier_name = plan_name
WHERE tier_name IS NULL;

-- Update avg_viewer_limit based on tier_name
UPDATE subscriptions
SET avg_viewer_limit = CASE
  WHEN tier_name = 'Creator' THEN 50
  WHEN tier_name = 'Pro' THEN 250
  WHEN tier_name = 'Streamer+' THEN 999999
  ELSE 50
END
WHERE avg_viewer_limit = 50; -- Only update default values

-- Create index for tier status queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier_status ON subscriptions(tier_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_days_over_limit ON subscriptions(days_over_limit);

-- Create view for easy tier compliance checking
CREATE OR REPLACE VIEW subscription_tier_compliance AS
SELECT
  s.id,
  s.email,
  s.stripe_customer_id,
  s.tier_name,
  s.plan_name,
  s.status,
  s.avg_viewer_limit,
  s.avg_viewers_30d,
  s.days_over_limit,
  s.last_nudge_sent_at,
  CASE
    WHEN s.avg_viewers_30d > s.avg_viewer_limit THEN 'over_limit'
    WHEN s.avg_viewers_30d > (s.avg_viewer_limit * 0.8) THEN 'approaching_limit'
    ELSE 'within_limit'
  END as calculated_tier_status,
  CASE
    WHEN s.tier_name = 'Creator' AND s.avg_viewers_30d > 50 THEN 'Pro'
    WHEN s.tier_name = 'Pro' AND s.avg_viewers_30d > 250 THEN 'Streamer+'
    ELSE NULL
  END as suggested_upgrade,
  ROUND(((s.avg_viewers_30d::FLOAT / s.avg_viewer_limit::FLOAT - 1) * 100)::numeric, 0) as percent_over_limit
FROM subscriptions s
WHERE s.status = 'active';

-- Create function to update tier status
CREATE OR REPLACE FUNCTION update_tier_status()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET tier_status = CASE
    WHEN avg_viewers_30d > avg_viewer_limit THEN 'over_limit'
    WHEN avg_viewers_30d > (avg_viewer_limit * 0.8) THEN 'approaching_limit'
    ELSE 'within_limit'
  END,
  days_over_limit = CASE
    WHEN avg_viewers_30d > avg_viewer_limit THEN days_over_limit + 1
    ELSE 0
  END
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.avg_viewer_limit IS 'Maximum average viewers allowed for this tier (Creator: 50, Pro: 250, Streamer+: unlimited)';
COMMENT ON COLUMN subscriptions.avg_viewers_30d IS 'Rolling 30-day average viewer count calculated from stream_report_sessions';
COMMENT ON COLUMN subscriptions.days_over_limit IS 'Consecutive days the user has been over their tier limit';
COMMENT ON COLUMN subscriptions.tier_status IS 'Current tier compliance status: within_limit, approaching_limit, or over_limit';
COMMENT ON VIEW subscription_tier_compliance IS 'View for monitoring tier compliance and identifying users who should upgrade';
