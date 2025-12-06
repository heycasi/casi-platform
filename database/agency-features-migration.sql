-- ============================================================================
-- AGENCY FEATURES MIGRATION
-- Adds campaign tracking, benchmarking, sponsor reports, and health metrics
-- For the Loaded.gg demo
-- ============================================================================

-- ============================================================================
-- STEP 1: Create campaigns table
-- Tracks brand campaigns across streamers
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Red Bull", "Monster Energy"
  brand_name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Optional metadata
  description TEXT,
  target_mentions INTEGER,
  budget_amount DECIMAL(10, 2),

  UNIQUE(organization_id, name, start_date)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_name ON campaigns(brand_name);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

COMMENT ON TABLE campaigns IS 'Brand campaigns tracked across agency talent';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: active, completed, or paused';

-- ============================================================================
-- STEP 2: Create campaign_mentions table
-- Stores aggregated mention data for campaign analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  streamer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES stream_report_sessions(id) ON DELETE SET NULL,

  -- Metrics
  mention_count INTEGER NOT NULL DEFAULT 1,
  avg_sentiment DECIMAL(3, 2), -- -1.0 to 1.0
  avg_viewers_during_mention INTEGER,
  total_reach INTEGER, -- cumulative viewers who saw mentions

  -- Timestamps
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(campaign_id, streamer_user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_mentions_campaign ON campaign_mentions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_mentions_streamer ON campaign_mentions(streamer_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_mentions_date ON campaign_mentions(campaign_id, recorded_date);

COMMENT ON TABLE campaign_mentions IS 'Aggregated brand mention data per campaign/streamer/session';
COMMENT ON COLUMN campaign_mentions.avg_sentiment IS 'Average sentiment score during brand mentions (-1 to 1)';

-- ============================================================================
-- STEP 3: Create sponsor_reports table
-- Stores generated sponsor reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS sponsor_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Report metadata
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'campaign_summary' CHECK (report_type IN ('campaign_summary', 'creator_performance', 'quarterly_review')),
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,

  -- Report content (stored as JSON for flexibility)
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- File storage
  report_url TEXT, -- Public URL to generated PDF/HTML
  file_path TEXT, -- Internal file path

  -- Metadata
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  -- Sharing
  share_token TEXT UNIQUE, -- Random token for public sharing
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_reports_org ON sponsor_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_campaign ON sponsor_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_generated_at ON sponsor_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_reports_share_token ON sponsor_reports(share_token) WHERE share_token IS NOT NULL;

COMMENT ON TABLE sponsor_reports IS 'Generated sponsor reports for agencies';
COMMENT ON COLUMN sponsor_reports.report_data IS 'JSON blob containing report metrics and data';
COMMENT ON COLUMN sponsor_reports.share_token IS 'Public sharing token for external access';

-- ============================================================================
-- STEP 4: Create creator_health_metrics table
-- Stores calculated health scores for streamers
-- ============================================================================

CREATE TABLE IF NOT EXISTS creator_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Health score (0-100)
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  health_category TEXT NOT NULL CHECK (health_category IN ('green', 'amber', 'red')),

  -- Component scores
  sentiment_score INTEGER, -- Contribution from sentiment trend
  frequency_score INTEGER, -- Contribution from stream consistency
  toxicity_score INTEGER, -- Penalty from toxicity spikes
  growth_score INTEGER, -- Contribution from viewer growth

  -- Supporting data
  reason_summary TEXT, -- Human-readable explanation
  flags JSONB DEFAULT '[]'::jsonb, -- Array of warning flags

  -- Calculation metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_period_start TIMESTAMP WITH TIME ZONE,
  data_period_end TIMESTAMP WITH TIME ZONE,

  UNIQUE(streamer_user_id, calculated_at)
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_streamer ON creator_health_metrics(streamer_user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_org ON creator_health_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_category ON creator_health_metrics(health_category);
CREATE INDEX IF NOT EXISTS idx_health_metrics_calculated ON creator_health_metrics(calculated_at DESC);

COMMENT ON TABLE creator_health_metrics IS 'Calculated health scores for streamers (updated periodically)';
COMMENT ON COLUMN creator_health_metrics.health_score IS 'Overall health score 0-100 (80+ green, 50-79 amber, 0-49 red)';
COMMENT ON COLUMN creator_health_metrics.flags IS 'JSON array of warning flags like ["toxicity_spike", "viewer_drop"]';

-- ============================================================================
-- STEP 5: Add brand_color column to organizations
-- For report branding
-- ============================================================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#6932FF';

COMMENT ON COLUMN organizations.brand_color IS 'Hex color for agency branding in reports';

-- ============================================================================
-- STEP 6: Enable RLS on new tables
-- ============================================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_health_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: RLS Policies for campaigns
-- ============================================================================

-- Organization owners can manage their campaigns
DROP POLICY IF EXISTS "Org owners can manage campaigns" ON campaigns;
CREATE POLICY "Org owners can manage campaigns" ON campaigns
  FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Organization members can view campaigns
DROP POLICY IF EXISTS "Org members can view campaigns" ON campaigns;
CREATE POLICY "Org members can view campaigns" ON campaigns
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 8: RLS Policies for campaign_mentions
-- ============================================================================

-- Organization owners can manage mentions
DROP POLICY IF EXISTS "Org owners can manage mentions" ON campaign_mentions;
CREATE POLICY "Org owners can manage mentions" ON campaign_mentions
  FOR ALL
  USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN organizations o ON o.id = c.organization_id
      WHERE o.owner_id = auth.uid()
    )
  );

-- Streamers can view their own mentions
DROP POLICY IF EXISTS "Streamers can view own mentions" ON campaign_mentions;
CREATE POLICY "Streamers can view own mentions" ON campaign_mentions
  FOR SELECT
  USING (streamer_user_id = auth.uid());

-- ============================================================================
-- STEP 9: RLS Policies for sponsor_reports
-- ============================================================================

-- Organization owners can manage reports
DROP POLICY IF EXISTS "Org owners can manage reports" ON sponsor_reports;
CREATE POLICY "Org owners can manage reports" ON sponsor_reports
  FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Public reports can be viewed by anyone with share token (handled in API)
DROP POLICY IF EXISTS "Public reports via share token" ON sponsor_reports;
CREATE POLICY "Public reports via share token" ON sponsor_reports
  FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- STEP 10: RLS Policies for creator_health_metrics
-- ============================================================================

-- Organization owners can view health metrics for their talent
DROP POLICY IF EXISTS "Org owners can view health metrics" ON creator_health_metrics;
CREATE POLICY "Org owners can view health metrics" ON creator_health_metrics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Streamers can view their own health metrics
DROP POLICY IF EXISTS "Streamers can view own health" ON creator_health_metrics;
CREATE POLICY "Streamers can view own health" ON creator_health_metrics
  FOR SELECT
  USING (streamer_user_id = auth.uid());

-- ============================================================================
-- STEP 11: Create helper view for campaign analytics
-- ============================================================================

CREATE OR REPLACE VIEW campaign_analytics_summary AS
SELECT
  c.id as campaign_id,
  c.name as campaign_name,
  c.brand_name,
  c.organization_id,
  c.status,
  c.start_date,
  c.end_date,
  COUNT(DISTINCT cm.streamer_user_id) as participating_streamers,
  SUM(cm.mention_count) as total_mentions,
  AVG(cm.avg_sentiment) as overall_sentiment,
  AVG(cm.avg_viewers_during_mention) as avg_viewers,
  SUM(cm.total_reach) as total_reach,
  MAX(cm.recorded_date) as last_mention_date
FROM campaigns c
LEFT JOIN campaign_mentions cm ON cm.campaign_id = c.id
GROUP BY c.id, c.name, c.brand_name, c.organization_id, c.status, c.start_date, c.end_date;

COMMENT ON VIEW campaign_analytics_summary IS 'Aggregated analytics for each campaign';

-- ============================================================================
-- STEP 12: Create updated_at triggers
-- ============================================================================

-- Campaigns
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- ============================================================================
-- STEP 13: Create function to calculate creator health score
-- (This will be called by a scheduled job or API)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_creator_health(
  p_streamer_user_id UUID,
  p_organization_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  health_score INTEGER,
  health_category TEXT,
  sentiment_score INTEGER,
  frequency_score INTEGER,
  toxicity_score INTEGER,
  growth_score INTEGER,
  reason_summary TEXT
) AS $$
DECLARE
  v_health_score INTEGER;
  v_health_category TEXT;
  v_sentiment_score INTEGER := 50;
  v_frequency_score INTEGER := 50;
  v_toxicity_score INTEGER := 50;
  v_growth_score INTEGER := 50;
  v_reason TEXT := 'Stable performance';
BEGIN
  -- TODO: Implement actual calculation logic based on stream_report_sessions
  -- For now, return placeholder values
  -- Real implementation would:
  -- 1. Calculate sentiment trend from session analytics
  -- 2. Calculate stream frequency consistency
  -- 3. Detect toxicity spikes from chat data
  -- 4. Calculate viewer growth trend

  v_health_score := (v_sentiment_score + v_frequency_score + v_toxicity_score + v_growth_score) / 4;

  IF v_health_score >= 80 THEN
    v_health_category := 'green';
  ELSIF v_health_score >= 50 THEN
    v_health_category := 'amber';
  ELSE
    v_health_category := 'red';
  END IF;

  RETURN QUERY SELECT
    v_health_score,
    v_health_category,
    v_sentiment_score,
    v_frequency_score,
    v_toxicity_score,
    v_growth_score,
    v_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_creator_health IS 'Calculate health score for a creator (placeholder implementation)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification queries:
-- SELECT * FROM campaigns;
-- SELECT * FROM campaign_mentions;
-- SELECT * FROM sponsor_reports;
-- SELECT * FROM creator_health_metrics;
-- SELECT * FROM campaign_analytics_summary;
