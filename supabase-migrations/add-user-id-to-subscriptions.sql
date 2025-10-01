-- Add email column to subscriptions table (if not exists)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add user_id column to subscriptions table to link with auth.users
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create an index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
