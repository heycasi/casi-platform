-- Manually insert Connor's Pro subscription for testing
-- Run this in Supabase SQL Editor

INSERT INTO subscriptions (
  email,
  stripe_customer_id,
  stripe_subscription_id,
  plan_name,
  tier_name,
  avg_viewer_limit,
  avg_viewers_30d,
  days_over_limit,
  tier_status,
  status,
  billing_interval,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  'connordahl@hotmail.com',
  'cus_manual_test',  -- Placeholder customer ID
  'sub_manual_test',  -- Placeholder subscription ID
  'Pro',
  'Pro',
  250,  -- Pro tier viewer limit
  0,    -- Start at 0 average viewers
  0,    -- Start at 0 days over limit
  'within_limit',
  'active',
  'month',
  NOW(),
  NOW() + INTERVAL '1 month',
  NOW(),
  NOW()
);

-- Verify it was created
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
  created_at
FROM subscriptions
WHERE email = 'connordahl@hotmail.com';
