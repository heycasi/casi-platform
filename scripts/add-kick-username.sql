-- Add/Update Kick username to admin account
-- Run this in Supabase SQL Editor

-- Find and update the subscription for the admin user
-- Replace with your actual email if needed
UPDATE subscriptions
SET kick_username = 'SSGGRUNT'
WHERE email = (
  SELECT email
  FROM subscriptions
  WHERE email ILIKE '%conzo%'
  OR email IN (
    SELECT DISTINCT streamer_email
    FROM stream_report_sessions
    WHERE channel_name = 'conzooo_'
  )
  LIMIT 1
);

-- Verify it was added
SELECT email, kick_username
FROM subscriptions
WHERE kick_username = 'SSGGRUNT';
