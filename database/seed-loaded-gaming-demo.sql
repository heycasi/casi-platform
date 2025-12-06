-- ============================================================================
-- SEED SCRIPT FOR LOADED GAMING AGENCY DEMO
-- Creates demo@loaded.gg agency admin and 5 demo streamers with realistic data
-- ============================================================================

-- IMPORTANT: Run the following migrations FIRST:
-- 1. agency-organizations-migration.sql
-- 2. agency-features-migration.sql
-- 3. role-system-and-sponsor-reports.sql

-- ============================================================================
-- STEP 1: Create demo users via Supabase Auth
-- ============================================================================

-- NOTE: These users MUST be created via Supabase Dashboard or Auth API first:
--
-- 1. demo@loaded.gg (password: LoadedDemo2025!)
-- 2. starstreamer@demo.com (password: Demo2025!)
-- 3. grinderpro@demo.com (password: Demo2025!)
-- 4. nightowl@demo.com (password: Demo2025!)
-- 5. rushgamer@demo.com (password: Demo2025!)
-- 6. chillvibes@demo.com (password: Demo2025!)
--
-- After creating users in Supabase Auth Dashboard, get their UUIDs and replace below:

\set demo_admin_id 'YOUR_DEMO_ADMIN_UUID_HERE'
\set streamer1_id 'YOUR_STREAMER1_UUID_HERE'
\set streamer2_id 'YOUR_STREAMER2_UUID_HERE'
\set streamer3_id 'YOUR_STREAMER3_UUID_HERE'
\set streamer4_id 'YOUR_STREAMER4_UUID_HERE'
\set streamer5_id 'YOUR_STREAMER5_UUID_HERE'

-- ============================================================================
-- STEP 2: Create user profiles with roles
-- ============================================================================

-- Agency Admin
INSERT INTO user_profiles (id, email, role, display_name, twitch_username)
VALUES
  (:demo_admin_id, 'demo@loaded.gg', 'AGENCY_ADMIN', 'Loaded Gaming Admin', 'loaded_admin')
ON CONFLICT (id) DO UPDATE SET
  role = 'AGENCY_ADMIN',
  display_name = 'Loaded Gaming Admin',
  twitch_username = 'loaded_admin';

-- Streamers
INSERT INTO user_profiles (id, email, role, display_name, twitch_username, twitch_id)
VALUES
  (:streamer1_id, 'starstreamer@demo.com', 'STREAMER', 'StarStreamer', 'starstreamer', 'star123'),
  (:streamer2_id, 'grinderpro@demo.com', 'STREAMER', 'GrinderPro', 'grinderpro', 'grinder456'),
  (:streamer3_id, 'nightowl@demo.com', 'STREAMER', 'NightOwl', 'nightowl', 'night789'),
  (:streamer4_id, 'rushgamer@demo.com', 'STREAMER', 'RushGamer', 'rushgamer', 'rush321'),
  (:streamer5_id, 'chillvibes@demo.com', 'STREAMER', 'ChillVibes', 'chillvibes', 'chill654')
ON CONFLICT (id) DO UPDATE SET
  role = 'STREAMER',
  display_name = EXCLUDED.display_name,
  twitch_username = EXCLUDED.twitch_username,
  twitch_id = EXCLUDED.twitch_id;

-- ============================================================================
-- STEP 3: Create Loaded Gaming Agency organization
-- ============================================================================

INSERT INTO organizations (id, owner_id, name, logo_url)
VALUES (
  gen_random_uuid(),
  :demo_admin_id,
  'Loaded Gaming Agency',
  'https://pbs.twimg.com/profile_images/1234567890/loaded_logo.png'
)
ON CONFLICT (owner_id) DO UPDATE SET
  name = 'Loaded Gaming Agency';

-- Get the organization ID (for reference)
\set org_id (SELECT id FROM organizations WHERE owner_id = :demo_admin_id LIMIT 1)

-- ============================================================================
-- STEP 4: Add organization members
-- ============================================================================

-- Add admin as owner
INSERT INTO organization_members (organization_id, user_id, role)
SELECT :org_id, :demo_admin_id, 'owner'
WHERE NOT EXISTS (
  SELECT 1 FROM organization_members
  WHERE organization_id = :org_id AND user_id = :demo_admin_id
);

-- Add streamers as talent
INSERT INTO organization_members (organization_id, user_id, role)
SELECT :org_id, unnest(ARRAY[
  :streamer1_id::uuid,
  :streamer2_id::uuid,
  :streamer3_id::uuid,
  :streamer4_id::uuid,
  :streamer5_id::uuid
]), 'talent'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Update user_profiles to link streamers to organization (for AGENCY_ADMIN)
UPDATE user_profiles
SET organization_id = :org_id
WHERE id = :demo_admin_id;

-- ============================================================================
-- STEP 5: Create demo stream sessions for each streamer
-- ============================================================================

-- StarStreamer: High performer, lots of sessions
INSERT INTO stream_report_sessions (
  id, user_id, streamer_email, channel_name,
  session_start, session_end, duration_minutes,
  peak_viewer_count, total_messages, unique_chatters
)
VALUES
  (gen_random_uuid(), :streamer1_id, 'starstreamer@demo.com', 'StarStreamer', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '4 hours', 240, 8500, 12000, 3200),
  (gen_random_uuid(), :streamer1_id, 'starstreamer@demo.com', 'StarStreamer', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days' + INTERVAL '5 hours', 300, 9200, 15000, 3500),
  (gen_random_uuid(), :streamer1_id, 'starstreamer@demo.com', 'StarStreamer', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '6 hours', 360, 10500, 18000, 4000),
  (gen_random_uuid(), :streamer1_id, 'starstreamer@demo.com', 'StarStreamer', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '5 hours', 300, 11000, 16000, 3800),
  (gen_random_uuid(), :streamer1_id, 'starstreamer@demo.com', 'StarStreamer', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '4 hours', 240, 9800, 14000, 3600);

-- GrinderPro: Medium-high performer
INSERT INTO stream_report_sessions (
  id, user_id, streamer_email, channel_name,
  session_start, session_end, duration_minutes,
  peak_viewer_count, total_messages, unique_chatters
)
VALUES
  (gen_random_uuid(), :streamer2_id, 'grinderpro@demo.com', 'GrinderPro', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days' + INTERVAL '3 hours', 180, 6200, 8000, 2100),
  (gen_random_uuid(), :streamer2_id, 'grinderpro@demo.com', 'GrinderPro', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '4 hours', 240, 6800, 9500, 2400),
  (gen_random_uuid(), :streamer2_id, 'grinderpro@demo.com', 'GrinderPro', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days' + INTERVAL '3 hours', 180, 7100, 9000, 2300),
  (gen_random_uuid(), :streamer2_id, 'grinderpro@demo.com', 'GrinderPro', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '5 hours', 300, 7500, 10000, 2600);

-- NightOwl: Medium performer
INSERT INTO stream_report_sessions (
  id, user_id, streamer_email, channel_name,
  session_start, session_end, duration_minutes,
  peak_viewer_count, total_messages, unique_chatters
)
VALUES
  (gen_random_uuid(), :streamer3_id, 'nightowl@demo.com', 'NightOwl', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days' + INTERVAL '4 hours', 240, 4500, 6000, 1500),
  (gen_random_uuid(), :streamer3_id, 'nightowl@demo.com', 'NightOwl', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days' + INTERVAL '3 hours', 180, 4800, 6500, 1600),
  (gen_random_uuid(), :streamer3_id, 'nightowl@demo.com', 'NightOwl', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days' + INTERVAL '4 hours', 240, 5200, 7000, 1700);

-- RushGamer: Lower-medium performer
INSERT INTO stream_report_sessions (
  id, user_id, streamer_email, channel_name,
  session_start, session_end, duration_minutes,
  peak_viewer_count, total_messages, unique_chatters
)
VALUES
  (gen_random_uuid(), :streamer4_id, 'rushgamer@demo.com', 'RushGamer', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days' + INTERVAL '3 hours', 180, 3200, 4500, 1100),
  (gen_random_uuid(), :streamer4_id, 'rushgamer@demo.com', 'RushGamer', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days' + INTERVAL '2 hours', 120, 3000, 4000, 1000);

-- ChillVibes: Smaller performer
INSERT INTO stream_report_sessions (
  id, user_id, streamer_email, channel_name,
  session_start, session_end, duration_minutes,
  peak_viewer_count, total_messages, unique_chatters
)
VALUES
  (gen_random_uuid(), :streamer5_id, 'chillvibes@demo.com', 'ChillVibes', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '2 hours', 120, 2100, 2800, 800),
  (gen_random_uuid(), :streamer5_id, 'chillvibes@demo.com', 'ChillVibes', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '3 hours', 180, 2300, 3200, 850);

-- ============================================================================
-- STEP 6: Create demo campaign chat messages with "Red Bull" mentions
-- ============================================================================

-- Helper function to create messages for a session
DO $$
DECLARE
  session_record RECORD;
  i INTEGER;
  mention_count INTEGER;
BEGIN
  -- Get all sessions
  FOR session_record IN
    SELECT id, channel_name FROM stream_report_sessions
    WHERE streamer_email IN (
      'starstreamer@demo.com',
      'grinderpro@demo.com',
      'nightowl@demo.com',
      'rushgamer@demo.com',
      'chillvibes@demo.com'
    )
  LOOP
    -- Determine number of "Red Bull" mentions based on channel
    CASE session_record.channel_name
      WHEN 'StarStreamer' THEN mention_count := 45;
      WHEN 'GrinderPro' THEN mention_count := 32;
      WHEN 'NightOwl' THEN mention_count := 25;
      WHEN 'RushGamer' THEN mention_count := 18;
      WHEN 'ChillVibes' THEN mention_count := 12;
      ELSE mention_count := 10;
    END CASE;

    -- Insert mention messages
    FOR i IN 1..mention_count LOOP
      INSERT INTO stream_chat_messages (
        session_id, username, message, sentiment, sentiment_score, timestamp
      )
      VALUES (
        session_record.id,
        'user' || i,
        CASE (random() * 5)::INTEGER
          WHEN 0 THEN 'Loving the Red Bull energy today!'
          WHEN 1 THEN 'Red Bull gives you wings!'
          WHEN 2 THEN 'Thanks to Red Bull for sponsoring this stream'
          WHEN 3 THEN 'Red Bull keeping me awake for this stream'
          ELSE 'Red Bull is the best energy drink'
        END,
        CASE WHEN random() > 0.2 THEN 'positive' ELSE 'neutral' END,
        0.7 + (random() * 0.25), -- sentiment score between 0.7 and 0.95
        NOW() - (random() * INTERVAL '30 days')
      );
    END LOOP;

    -- Also insert some non-mention messages for realism
    FOR i IN 1..50 LOOP
      INSERT INTO stream_chat_messages (
        session_id, username, message, sentiment, sentiment_score, timestamp
      )
      VALUES (
        session_record.id,
        'viewer' || i,
        CASE (random() * 5)::INTEGER
          WHEN 0 THEN 'Great gameplay!'
          WHEN 1 THEN 'This is amazing'
          WHEN 2 THEN 'Love this stream'
          WHEN 3 THEN 'Awesome content'
          ELSE 'Keep it up!'
        END,
        'positive',
        0.8,
        NOW() - (random() * INTERVAL '30 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- DEMO SETUP COMPLETE
-- ============================================================================

-- Verification queries:
SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations WHERE owner_id = :demo_admin_id
UNION ALL
SELECT 'Organization Members:', COUNT(*) FROM organization_members WHERE organization_id = :org_id
UNION ALL
SELECT 'User Profiles:', COUNT(*) FROM user_profiles WHERE id IN (:demo_admin_id, :streamer1_id, :streamer2_id, :streamer3_id, :streamer4_id, :streamer5_id)
UNION ALL
SELECT 'Stream Sessions:', COUNT(*) FROM stream_report_sessions WHERE streamer_email LIKE '%@demo.com'
UNION ALL
SELECT 'Red Bull Mentions:', COUNT(*) FROM stream_chat_messages WHERE message ILIKE '%Red Bull%';

-- ============================================================================
-- LOGIN INSTRUCTIONS FOR DEMO
-- ============================================================================

/*
TO ACCESS THE DEMO:

1. Navigate to: http://localhost:3002/login (or your production URL)

2. Log in with:
   Email: demo@loaded.gg
   Password: LoadedDemo2025!

3. You will be redirected to: http://localhost:3002/dashboard/agency

4. You should see:
   - Loaded Gaming Agency Command Center
   - 5 active talent members
   - Red Bull campaign with ~132 total mentions
   - Creator health dashboard showing varied health scores
   - Campaign benchmarks comparing to industry

5. Click "View" on any streamer to see their individual dashboard

6. Click "Generate Sponsor Report" to create a shareable report

ENVIRONMENT VARIABLES REQUIRED:
- NEXT_PUBLIC_SUPABASE_URL (your Supabase project URL)
- SUPABASE_SERVICE_ROLE_KEY (your Supabase service role key)
- NEXT_PUBLIC_APP_URL (http://localhost:3002 for development)

MIGRATIONS TO RUN (in order):
1. database/agency-organizations-migration.sql
2. database/agency-features-migration.sql
3. database/role-system-and-sponsor-reports.sql
4. database/seed-loaded-gaming-demo.sql (this file)
*/
