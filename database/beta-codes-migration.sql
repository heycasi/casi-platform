-- Beta Codes and Trial System Migration
-- Created: $(date)
-- Purpose: Implement beta code system with 14-day trials and dashboard access control

-- 1. Create beta_codes table
CREATE TABLE IF NOT EXISTS beta_codes (
  code VARCHAR(50) PRIMARY KEY,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  trial_days INTEGER DEFAULT 14,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  active BOOLEAN DEFAULT TRUE,
  description TEXT
);

-- 2. Add beta trial columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS beta_code VARCHAR(50) REFERENCES beta_codes(code),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_beta_trial BOOLEAN DEFAULT FALSE;

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_status ON subscriptions(is_beta_trial, trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_beta_codes_active ON beta_codes(active);

-- 4. Insert the CASIBETA25 code (unlimited uses, 14-day trial)
INSERT INTO beta_codes (code, max_uses, current_uses, trial_days, active, description)
VALUES ('CASIBETA25', 999999, 0, 14, true, 'Launch beta code for early testers - 14 day free trial')
ON CONFLICT (code) DO NOTHING;

-- 5. Create a view for active subscriptions (including trials)
CREATE OR REPLACE VIEW active_user_access AS
SELECT
  s.email,
  s.user_id,
  s.status,
  s.plan_name,
  s.is_beta_trial,
  s.trial_ends_at,
  s.beta_code,
  CASE
    -- Active paid subscription
    WHEN s.status = 'active' AND s.is_beta_trial = false THEN true
    -- Active trial that hasn't expired
    WHEN s.is_beta_trial = true AND s.trial_ends_at > NOW() THEN true
    -- Everything else is no access
    ELSE false
  END AS has_access,
  CASE
    WHEN s.is_beta_trial = true AND s.trial_ends_at > NOW() THEN
      EXTRACT(DAY FROM (s.trial_ends_at - NOW()))::INTEGER
    ELSE 0
  END AS trial_days_remaining
FROM subscriptions s;

COMMENT ON VIEW active_user_access IS 'Shows which users have active access (paid or trial)';

-- 6. Function to check if user has access
CREATE OR REPLACE FUNCTION user_has_access(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  access_granted BOOLEAN;
BEGIN
  SELECT has_access INTO access_granted
  FROM active_user_access
  WHERE email = user_email
  LIMIT 1;

  RETURN COALESCE(access_granted, false);
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get user access details
CREATE OR REPLACE FUNCTION get_user_access_details(user_email TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  status TEXT,
  plan_name TEXT,
  is_trial BOOLEAN,
  trial_days_remaining INTEGER,
  trial_ends_at TIMESTAMP
) AS $$
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
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Beta codes migration completed successfully!';
  RAISE NOTICE 'Beta code CASIBETA25 has been created with unlimited uses.';
  RAISE NOTICE 'Use get_user_access_details(email) to check user access status.';
END $$;
