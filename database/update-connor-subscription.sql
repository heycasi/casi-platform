-- Update Connor's Pro subscription with tier tracking fields
-- Run this in Supabase SQL Editor

-- First, update the subscription with tier tracking fields
UPDATE subscriptions
SET
  tier_name = plan_name,
  avg_viewer_limit = CASE
    WHEN plan_name = 'Creator' THEN 50
    WHEN plan_name = 'Pro' THEN 250
    WHEN plan_name = 'Streamer+' THEN 999999
    ELSE 50
  END,
  avg_viewers_30d = 0,
  days_over_limit = 0,
  tier_status = 'within_limit',
  last_nudge_sent_at = NULL
WHERE email = 'connordahl@hotmail.com';

-- Verify the update worked
SELECT
  id,
  email,
  plan_name,
  tier_name,
  avg_viewer_limit,
  avg_viewers_30d,
  days_over_limit,
  tier_status,
  status,
  current_period_end
FROM subscriptions
WHERE email = 'connordahl@hotmail.com';

-- Optional: Simulate being over limit to test cron job
-- Uncomment the lines below if you want to test the upgrade nudge email

/*
UPDATE subscriptions
SET
  avg_viewers_30d = 300,  -- Over the Pro limit of 250
  tier_status = 'over_limit',
  days_over_limit = 8  -- Over for 8 days (will trigger email since >7)
WHERE email = 'connordahl@hotmail.com'
AND plan_name = 'Pro';

-- Verify the test data
SELECT
  email,
  tier_name,
  avg_viewer_limit,
  avg_viewers_30d,
  tier_status,
  days_over_limit,
  CASE
    WHEN avg_viewers_30d > avg_viewer_limit THEN 'Should send nudge email!'
    ELSE 'Within limit'
  END as nudge_status
FROM subscriptions
WHERE email = 'connordahl@hotmail.com';
*/
