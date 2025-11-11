-- COMPREHENSIVE FIX FOR SUBSCRIPTIONS TABLE
-- This script handles ALL possible NOT NULL constraint issues for beta trials
-- Run this in Supabase SQL Editor

-- First, let's see what columns actually exist and their constraints
-- (Run this first to see the current state, then run the fixes below)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- FIX 1: Handle viewer_limit column (if it exists)
-- ========================================
-- Check if viewer_limit exists (not avg_viewer_limit)
DO $$
BEGIN
  -- If viewer_limit column exists, either drop it or make it nullable with default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'viewer_limit'
  ) THEN
    -- Option A: Make it nullable
    ALTER TABLE subscriptions ALTER COLUMN viewer_limit DROP NOT NULL;
    ALTER TABLE subscriptions ALTER COLUMN viewer_limit SET DEFAULT 50;
    RAISE NOTICE 'Made viewer_limit nullable with default 50';

    -- Option B: If you want to drop it in favor of avg_viewer_limit
    -- ALTER TABLE subscriptions DROP COLUMN viewer_limit;
    -- RAISE NOTICE 'Dropped viewer_limit column';
  END IF;
END $$;

-- ========================================
-- FIX 2: Ensure avg_viewer_limit has proper default
-- ========================================
ALTER TABLE subscriptions
ALTER COLUMN avg_viewer_limit SET DEFAULT 50;

-- ========================================
-- FIX 3: Make ALL Stripe columns nullable
-- ========================================
ALTER TABLE subscriptions
ALTER COLUMN stripe_customer_id DROP NOT NULL,
ALTER COLUMN stripe_subscription_id DROP NOT NULL,
ALTER COLUMN stripe_price_id DROP NOT NULL,
ALTER COLUMN billing_interval DROP NOT NULL;

-- ========================================
-- FIX 4: Make tier columns have proper defaults
-- ========================================
ALTER TABLE subscriptions
ALTER COLUMN tier_name SET DEFAULT 'Creator';

ALTER TABLE subscriptions
ALTER COLUMN tier_status SET DEFAULT 'within_limit';

-- ========================================
-- FIX 5: Handle any other columns that might be NOT NULL
-- ========================================

-- Make canceled_at nullable (should already be)
DO $$
BEGIN
  ALTER TABLE subscriptions ALTER COLUMN canceled_at DROP NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'canceled_at already nullable or does not exist';
END $$;

-- Make trial_start nullable (should already be)
DO $$
BEGIN
  ALTER TABLE subscriptions ALTER COLUMN trial_start DROP NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'trial_start already nullable or does not exist';
END $$;

-- Make trial_end nullable (should already be)
DO $$
BEGIN
  ALTER TABLE subscriptions ALTER COLUMN trial_end DROP NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'trial_end already nullable or does not exist';
END $$;

-- ========================================
-- FIX 6: Add comments for documentation
-- ========================================
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.billing_interval IS 'Billing interval (month/year) - NULL for beta trial subscriptions';

-- ========================================
-- VERIFY: Check the final state
-- ========================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE
    WHEN is_nullable = 'NO' THEN '⚠️ REQUIRED'
    ELSE '✓ Optional'
  END as requirement_status
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY
  CASE WHEN is_nullable = 'NO' THEN 0 ELSE 1 END,
  ordinal_position;
