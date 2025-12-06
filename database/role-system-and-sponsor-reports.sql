-- ============================================================================
-- ROLE SYSTEM AND SPONSOR REPORTS MIGRATION
-- Adds user roles, sponsor report generation, and access control
-- For the Loaded.gg Agency Demo
-- ============================================================================

-- ============================================================================
-- STEP 1: Create user_profiles table for role management
-- This extends auth.users with application-specific data
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STREAMER', 'AGENCY_ADMIN')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Profile metadata
  display_name TEXT,
  twitch_id TEXT,
  twitch_username TEXT,
  avatar_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_twitch_id ON user_profiles(twitch_id);

COMMENT ON TABLE user_profiles IS 'User roles and profile data extending auth.users';
COMMENT ON COLUMN user_profiles.role IS 'User role: STREAMER (regular user) or AGENCY_ADMIN (manages agency)';
COMMENT ON COLUMN user_profiles.organization_id IS 'For AGENCY_ADMIN users, links to their organization';

-- ============================================================================
-- STEP 2: Ensure sponsor_reports table exists (from agency-features-migration.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Report metadata
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'campaign_summary' CHECK (report_type IN ('campaign_summary', 'creator_performance', 'quarterly_review')),
  date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Report content (stored as JSON for flexibility)
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- File storage
  report_url TEXT,

  -- Metadata
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  -- Sharing
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_reports_org ON sponsor_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_campaign ON sponsor_reports(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_generated_at ON sponsor_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_share_token ON sponsor_reports(share_token) WHERE share_token IS NOT NULL;

COMMENT ON TABLE sponsor_reports IS 'Generated sponsor reports for agencies';
COMMENT ON COLUMN sponsor_reports.report_data IS 'JSON blob containing report metrics and data';
COMMENT ON COLUMN sponsor_reports.share_token IS 'Public sharing token for external access';

-- ============================================================================
-- STEP 3: Enable RLS on user_profiles and sponsor_reports
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: RLS Policies for user_profiles
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Agency admins can view profiles of their talent
DROP POLICY IF EXISTS "Agency admins can view talent profiles" ON user_profiles;
CREATE POLICY "Agency admins can view talent profiles" ON user_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT om.user_id
      FROM organization_members om
      JOIN user_profiles up ON up.id = auth.uid()
      WHERE om.organization_id = up.organization_id
        AND up.role = 'AGENCY_ADMIN'
    )
  );

-- ============================================================================
-- STEP 5: RLS Policies for sponsor_reports
-- ============================================================================

-- Organization owners (agency admins) can manage their reports
DROP POLICY IF EXISTS "Agency admins can manage reports" ON sponsor_reports;
CREATE POLICY "Agency admins can manage reports" ON sponsor_reports
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_profiles
      WHERE id = auth.uid() AND role = 'AGENCY_ADMIN'
    )
  );

-- Public reports can be viewed by anyone with share token
DROP POLICY IF EXISTS "Public reports via share token" ON sponsor_reports;
CREATE POLICY "Public reports via share token" ON sponsor_reports
  FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- STEP 6: Helper functions for role checking
-- ============================================================================

-- Check if user is an agency admin
CREATE OR REPLACE FUNCTION is_agency_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'AGENCY_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_agency_admin IS 'Check if user has AGENCY_ADMIN role';

-- Check if user is a streamer
CREATE OR REPLACE FUNCTION is_streamer(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'STREAMER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_streamer IS 'Check if user has STREAMER role';

-- Get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role IS 'Get user role (STREAMER or AGENCY_ADMIN)';

-- Check if agency admin can view talent dashboard
CREATE OR REPLACE FUNCTION can_view_talent_dashboard(
  admin_id UUID,
  talent_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if admin is AGENCY_ADMIN and talent is in their roster
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles up_admin
    JOIN organization_members om ON om.organization_id = up_admin.organization_id
    WHERE up_admin.id = admin_id
      AND up_admin.role = 'AGENCY_ADMIN'
      AND om.user_id = talent_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_view_talent_dashboard IS 'Check if agency admin can view a specific talent dashboard';

-- ============================================================================
-- STEP 7: Create trigger for updated_at on user_profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- STEP 8: Create function to auto-create user_profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'STREAMER' -- Default role is STREAMER
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Automatically create user_profile when auth.users row is inserted';

-- ============================================================================
-- STEP 9: Update organizations table to link to owner's user_profile
-- ============================================================================

-- Already has owner_id, just add a comment for clarity
COMMENT ON COLUMN organizations.owner_id IS 'User ID of the agency admin who owns this organization (should have AGENCY_ADMIN role)';

-- ============================================================================
-- STEP 10: Create view for agency admin dashboard access
-- ============================================================================

CREATE OR REPLACE VIEW agency_admin_roster AS
SELECT
  up.id as admin_id,
  up.organization_id,
  o.name as organization_name,
  talent_up.id as talent_id,
  talent_up.email as talent_email,
  talent_up.display_name as talent_display_name,
  talent_up.twitch_username as talent_twitch_username,
  talent_up.avatar_url as talent_avatar_url,
  om.role as member_role,
  om.joined_at
FROM user_profiles up
JOIN organizations o ON o.id = up.organization_id
JOIN organization_members om ON om.organization_id = up.organization_id
JOIN user_profiles talent_up ON talent_up.id = om.user_id
WHERE up.role = 'AGENCY_ADMIN';

COMMENT ON VIEW agency_admin_roster IS 'Shows all talent accessible to each agency admin';

-- ============================================================================
-- STEP 11: Create helper view for sponsor report summary
-- ============================================================================

CREATE OR REPLACE VIEW sponsor_report_summary AS
SELECT
  sr.id as report_id,
  sr.title,
  sr.report_type,
  sr.date_range_start,
  sr.date_range_end,
  sr.organization_id,
  o.name as organization_name,
  sr.generated_at,
  up.display_name as generated_by_name,
  up.email as generated_by_email,
  sr.share_token,
  sr.is_public,
  c.name as campaign_name,
  c.brand_name
FROM sponsor_reports sr
JOIN organizations o ON o.id = sr.organization_id
LEFT JOIN user_profiles up ON up.id = sr.generated_by
LEFT JOIN campaigns c ON c.id = sr.campaign_id;

COMMENT ON VIEW sponsor_report_summary IS 'Summary of all sponsor reports with organization and campaign details';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification queries:
-- SELECT * FROM user_profiles;
-- SELECT * FROM sponsor_reports;
-- SELECT * FROM agency_admin_roster;
-- SELECT * FROM sponsor_report_summary;
