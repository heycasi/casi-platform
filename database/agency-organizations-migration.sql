-- ============================================================================
-- AGENCY ORGANIZATIONS MIGRATION
-- Adds multi-streamer organization support for Agency tier ($49.99/mo)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add user_id to stream_report_sessions (if not exists)
-- This allows us to link sessions to users instead of just emails
-- ============================================================================

ALTER TABLE stream_report_sessions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for efficient user_id lookups
CREATE INDEX IF NOT EXISTS idx_stream_report_sessions_user_id
ON stream_report_sessions(user_id);

-- Backfill user_id from streamer_email where possible
-- This will be done manually or via a separate script after deployment

COMMENT ON COLUMN stream_report_sessions.user_id IS 'User ID of the streamer (links to auth.users)';

-- ============================================================================
-- STEP 2: Create organizations table
-- Represents agencies/teams that manage multiple streamers
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

COMMENT ON TABLE organizations IS 'Agencies or teams that manage multiple streamers (Agency tier)';
COMMENT ON COLUMN organizations.owner_id IS 'The agency manager who owns this organization';
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID for billing the organization';

-- ============================================================================
-- STEP 3: Create organization_members table
-- Links streamers (talent) to organizations
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'talent')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only be in an org once
  UNIQUE(organization_id, user_id)
);

-- Indexes for organization_members
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(organization_id, role);

COMMENT ON TABLE organization_members IS 'Streamers belonging to an organization';
COMMENT ON COLUMN organization_members.role IS 'Role: owner (agency manager) or talent (streamer)';

-- ============================================================================
-- STEP 4: Enable RLS on new tables
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: RLS Policies for organizations
-- ============================================================================

-- Policy: Organization owners can manage their own organizations
DROP POLICY IF EXISTS "Owners can manage their organizations" ON organizations;
CREATE POLICY "Owners can manage their organizations" ON organizations
  FOR ALL
  USING (owner_id = auth.uid());

-- Policy: Organization members can view their organization details
DROP POLICY IF EXISTS "Members can view their organization" ON organizations;
CREATE POLICY "Members can view their organization" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 6: RLS Policies for organization_members
-- ============================================================================

-- Policy: Organization owners can manage their members
DROP POLICY IF EXISTS "Owners can manage organization members" ON organization_members;
CREATE POLICY "Owners can manage organization members" ON organization_members
  FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Policy: Members can view other members in their organization
DROP POLICY IF EXISTS "Members can view their organization members" ON organization_members;
CREATE POLICY "Members can view their organization members" ON organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view their own membership record
DROP POLICY IF EXISTS "Users can view own membership" ON organization_members;
CREATE POLICY "Users can view own membership" ON organization_members
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 7: Update RLS Policies for stream_report_sessions
-- Allow organization owners to view sessions of their talent
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can manage own stream sessions" ON stream_report_sessions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stream_report_sessions;

-- Policy 1: Users can manage their own stream sessions
CREATE POLICY "Users can manage own stream sessions" ON stream_report_sessions
  FOR ALL
  USING (
    streamer_email = auth.email()
    OR user_id = auth.uid()
  );

-- Policy 2: Organization owners can view sessions of their talent (God View)
CREATE POLICY "Org owners can view talent sessions" ON stream_report_sessions
  FOR SELECT
  USING (
    user_id IN (
      SELECT om.user_id
      FROM organization_members om
      JOIN organizations o ON o.id = om.organization_id
      WHERE o.owner_id = auth.uid() AND om.role = 'talent'
    )
  );

-- ============================================================================
-- STEP 8: Update RLS Policies for stream_chat_messages
-- Allow organization owners to view chat messages of their talent
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can access own chat messages" ON stream_chat_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON stream_chat_messages;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stream_chat_messages;

-- Policy 1: Anyone can insert chat messages (for webhook/API)
CREATE POLICY "Enable insert for all users" ON stream_chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Users can view their own chat messages
CREATE POLICY "Users can view own chat messages" ON stream_chat_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM stream_report_sessions
      WHERE streamer_email = auth.email() OR user_id = auth.uid()
    )
  );

-- Policy 3: Organization owners can view chat messages of their talent (God View)
CREATE POLICY "Org owners can view talent chat messages" ON stream_chat_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT srs.id
      FROM stream_report_sessions srs
      JOIN organization_members om ON om.user_id = srs.user_id
      JOIN organizations o ON o.id = om.organization_id
      WHERE o.owner_id = auth.uid() AND om.role = 'talent'
    )
  );

-- ============================================================================
-- STEP 9: Update RLS Policies for stream_session_analytics
-- Allow organization owners to view analytics of their talent
-- ============================================================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can access own analytics" ON stream_session_analytics;

-- Policy 1: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON stream_session_analytics
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM stream_report_sessions
      WHERE streamer_email = auth.email() OR user_id = auth.uid()
    )
  );

-- Policy 2: Organization owners can view analytics of their talent
CREATE POLICY "Org owners can view talent analytics" ON stream_session_analytics
  FOR SELECT
  USING (
    session_id IN (
      SELECT srs.id
      FROM stream_report_sessions srs
      JOIN organization_members om ON om.user_id = srs.user_id
      JOIN organizations o ON o.id = om.organization_id
      WHERE o.owner_id = auth.uid() AND om.role = 'talent'
    )
  );

-- ============================================================================
-- STEP 10: Create helper function to check if user is org owner
-- ============================================================================

CREATE OR REPLACE FUNCTION is_organization_owner(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_organization_owner IS 'Check if current user owns the specified organization';

-- ============================================================================
-- STEP 11: Create helper function to get user's organization
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS TABLE (
  org_id UUID,
  org_name TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    om.organization_id,
    o.name,
    om.role
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_organization IS 'Get current user''s organization details';

-- ============================================================================
-- STEP 12: Create view for organization overview
-- ============================================================================

CREATE OR REPLACE VIEW organization_overview AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  o.logo_url,
  o.owner_id,
  o.created_at,
  COUNT(DISTINCT om.user_id) FILTER (WHERE om.role = 'talent') as talent_count,
  COUNT(DISTINCT srs.id) as total_sessions,
  SUM(srs.total_messages) as total_messages_all_time,
  AVG(srs.peak_viewer_count) as avg_peak_viewers
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN stream_report_sessions srs ON srs.user_id = om.user_id
GROUP BY o.id, o.name, o.logo_url, o.owner_id, o.created_at;

COMMENT ON VIEW organization_overview IS 'Aggregated stats for each organization';

-- ============================================================================
-- STEP 13: Add updated_at trigger for organizations
-- ============================================================================

CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification queries (run these to confirm migration success):
-- SELECT * FROM organizations;
-- SELECT * FROM organization_members;
-- SELECT * FROM organization_overview;
