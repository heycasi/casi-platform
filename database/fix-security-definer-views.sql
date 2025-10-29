-- Fix SECURITY DEFINER views - drop and recreate with security_invoker
-- COMPLETED: 2025-10-28
-- Purpose: Fix Supabase security linter warnings for SECURITY DEFINER views

-- 1. Drop existing views
DROP VIEW IF EXISTS active_user_access CASCADE;
DROP VIEW IF EXISTS vw_messages_by_platform CASCADE;
DROP VIEW IF EXISTS subscription_tier_compliance CASCADE;

-- 2. Recreate active_user_access view (respects subscriptions RLS)
CREATE VIEW active_user_access
WITH (security_invoker=true) AS
SELECT
  s.email,
  s.user_id,
  s.status,
  s.plan_name,
  s.is_beta_trial,
  s.trial_ends_at,
  s.beta_code,
  CASE
    WHEN s.status = 'active' AND s.is_beta_trial = false THEN true
    WHEN s.is_beta_trial = true AND s.trial_ends_at > NOW() THEN true
    ELSE false
  END AS has_access,
  CASE
    WHEN s.is_beta_trial = true AND s.trial_ends_at > NOW() THEN
      EXTRACT(DAY FROM (s.trial_ends_at - NOW()))::INTEGER
    ELSE 0
  END AS trial_days_remaining
FROM subscriptions s;

-- 3. Recreate vw_messages_by_platform view (respects chat messages RLS)
CREATE VIEW vw_messages_by_platform
WITH (security_invoker=true) AS
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
  MIN(timestamp) as first_message_at,
  MAX(timestamp) as last_message_at
FROM stream_chat_messages
GROUP BY session_id, platform;

-- 4. Recreate subscription_tier_compliance view (respects subscriptions RLS)
CREATE VIEW subscription_tier_compliance
WITH (security_invoker=true) AS
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

-- RESULT: All security definer warnings resolved ✅
-- Views now use security_invoker=true and respect RLS policies
