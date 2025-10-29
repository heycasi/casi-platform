-- Fix function search path security warnings
-- Date: 2025-10-28
-- Purpose: Set immutable search_path on functions to prevent search path injection attacks

-- 1. Fix update_tier_status function
CREATE OR REPLACE FUNCTION update_tier_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- 2. Fix user_has_access function
CREATE OR REPLACE FUNCTION user_has_access(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  access_granted BOOLEAN;
BEGIN
  SELECT has_access INTO access_granted
  FROM active_user_access
  WHERE email = user_email
  LIMIT 1;

  RETURN COALESCE(access_granted, false);
END;
$$;

-- 3. Fix get_user_access_details function
CREATE OR REPLACE FUNCTION get_user_access_details(user_email TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  status TEXT,
  plan_name TEXT,
  is_trial BOOLEAN,
  trial_days_remaining INTEGER,
  trial_ends_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    aua.has_access,
    aua.status,
    aua.plan_name,
    aua.is_beta_trial,
    aua.trial_days_remaining,
    aua.trial_ends_at
  FROM active_user_access aua
  WHERE aua.email = user_email
  LIMIT 1;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All functions updated with immutable search_path';
  RAISE NOTICE 'Functions now protected against search path injection attacks';
END $$;
