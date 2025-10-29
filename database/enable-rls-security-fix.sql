-- Enable RLS on tables that are missing it
-- COMPLETED: 2025-10-28
-- Purpose: Fix Supabase security linter warnings

-- 1. Enable RLS on subscriptions table
-- This table already has policies defined in stripe-subscriptions-schema.sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on beta_codes table
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active beta codes (needed for signup validation)
CREATE POLICY "Anyone can view active beta codes" ON beta_codes
  FOR SELECT
  USING (active = true);

-- Policy: Only service role can manage beta codes
CREATE POLICY "Service role can manage beta codes" ON beta_codes
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 3. Enable RLS on beta_signups table
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own signup
CREATE POLICY "Users can view own beta signup" ON beta_signups
  FOR SELECT
  USING (auth.email() = email);

-- Policy: Service role can manage all signups
CREATE POLICY "Service role can manage beta signups" ON beta_signups
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Anyone can insert (for public signup form)
CREATE POLICY "Anyone can sign up for beta" ON beta_signups
  FOR INSERT
  WITH CHECK (true);

-- RESULT: All security warnings resolved ✅
-- - subscriptions: RLS enabled
-- - beta_codes: RLS enabled
-- - beta_signups: RLS enabled
