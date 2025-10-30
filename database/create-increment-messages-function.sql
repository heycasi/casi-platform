-- Function to atomically increment session's total_messages count
-- This prevents race conditions when multiple message batches are saved simultaneously

CREATE OR REPLACE FUNCTION increment_session_messages(
  p_session_id UUID,
  p_increment INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE stream_report_sessions
  SET total_messages = COALESCE(total_messages, 0) + p_increment
  WHERE id = p_session_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_session_messages(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_session_messages(UUID, INTEGER) TO service_role;
