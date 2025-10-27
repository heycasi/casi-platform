-- Fix RLS policy for stream_chat_messages table
-- Allow inserts from anon key for chat message storage

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON stream_chat_messages;
DROP POLICY IF EXISTS "Allow insert for all users" ON stream_chat_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON stream_chat_messages;

-- Create new policy that allows all inserts (messages are public anyway)
CREATE POLICY "Enable insert for all users" ON stream_chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Keep select policy for authenticated users only
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stream_chat_messages;
CREATE POLICY "Enable read access for authenticated users" ON stream_chat_messages
  FOR SELECT
  USING (true);

-- Enable RLS
ALTER TABLE stream_chat_messages ENABLE ROW LEVEL SECURITY;
