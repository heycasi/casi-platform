-- Make Stripe Columns Nullable for Beta Trials
-- Beta trial subscriptions don't have Stripe data, so these columns should be nullable

-- Make Stripe columns nullable
ALTER TABLE subscriptions
ALTER COLUMN stripe_customer_id DROP NOT NULL,
ALTER COLUMN stripe_subscription_id DROP NOT NULL,
ALTER COLUMN stripe_price_id DROP NOT NULL,
ALTER COLUMN billing_interval DROP NOT NULL;

-- If there's a 'tier' column (not tier_name), drop it since we use tier_name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'subscriptions' AND column_name = 'tier') THEN
    ALTER TABLE subscriptions DROP COLUMN tier;
  END IF;
END $$;

-- Ensure tier_name has a default for beta trials
ALTER TABLE subscriptions
ALTER COLUMN tier_name SET DEFAULT 'Creator';

-- Add comment for clarity
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price ID - NULL for beta trial subscriptions';
COMMENT ON COLUMN subscriptions.billing_interval IS 'Billing interval (month/year) - NULL for beta trial subscriptions';
