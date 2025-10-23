-- Stream Events Table
-- Stores all Twitch events (subscriptions, follows, bits, raids, etc.)

CREATE TABLE IF NOT EXISTS stream_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event metadata
  event_type VARCHAR(50) NOT NULL, -- 'subscription', 'follow', 'bits', 'raid', 'resub', 'gift_sub'
  event_id VARCHAR(255) UNIQUE, -- Twitch event ID for deduplication

  -- Channel information
  channel_email VARCHAR(255) NOT NULL, -- Email of the streamer (links to subscriptions table)
  channel_name VARCHAR(100), -- Twitch username of the streamer

  -- User information (the person who triggered the event)
  user_id VARCHAR(100), -- Twitch user ID
  user_name VARCHAR(100), -- Twitch username
  user_display_name VARCHAR(100), -- Twitch display name

  -- Event-specific data
  event_data JSONB, -- Flexible storage for event-specific details
  -- Examples:
  -- For subs: { "tier": "1000", "is_gift": false }
  -- For bits: { "amount": 100, "message": "..." }
  -- For raids: { "viewer_count": 50 }
  -- For resubs: { "tier": "1000", "cumulative_months": 12, "streak_months": 6 }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(), -- When the event actually happened on Twitch

  -- Indexes for fast queries
  CONSTRAINT fk_channel_email FOREIGN KEY (channel_email)
    REFERENCES subscriptions(email) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stream_events_channel_email ON stream_events(channel_email);
CREATE INDEX IF NOT EXISTS idx_stream_events_event_type ON stream_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stream_events_created_at ON stream_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stream_events_event_id ON stream_events(event_id);

-- Enable Row Level Security
ALTER TABLE stream_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see events for their own channel
CREATE POLICY "Users can view their own stream events"
  ON stream_events
  FOR SELECT
  USING (channel_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Service role can insert events (from webhooks)
CREATE POLICY "Service role can insert events"
  ON stream_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can read all events
CREATE POLICY "Service role can read all events"
  ON stream_events
  FOR SELECT
  USING (true);

COMMENT ON TABLE stream_events IS 'Stores Twitch stream events (subs, follows, bits, raids)';
COMMENT ON COLUMN stream_events.event_type IS 'Type of event: subscription, follow, bits, raid, resub, gift_sub';
COMMENT ON COLUMN stream_events.event_data IS 'JSONB storage for event-specific details';
