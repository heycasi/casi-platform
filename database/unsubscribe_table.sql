-- Create unsubscribe list table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_unsubscribes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);

-- Enable Row Level Security
ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for unsubscribe)
CREATE POLICY "Allow public unsubscribe" ON email_unsubscribes
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow service role to read
CREATE POLICY "Allow service role read" ON email_unsubscribes
  FOR SELECT
  USING (true);
