-- Active Reader Sessions Table
-- Tracks users currently using the ThroneLight reader

CREATE TABLE IF NOT EXISTS active_reader_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  book_id TEXT NOT NULL,
  current_section TEXT,
  current_page INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_active_readers_user ON active_reader_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_readers_heartbeat ON active_reader_sessions(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_active_readers_active ON active_reader_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_active_readers_ip ON active_reader_sessions(ip_address);

-- Function to clean up stale sessions (no heartbeat in 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_reader_sessions()
RETURNS void AS $$
BEGIN
  UPDATE active_reader_sessions
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND last_heartbeat < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Reader Activity Log for historical tracking
CREATE TABLE IF NOT EXISTS reader_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT,
  ip_address TEXT,
  book_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'start', 'page_turn', 'bookmark', 'audio_play', 'end'
  section_id TEXT,
  page_number INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reader_activity_user ON reader_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_reader_activity_created ON reader_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_reader_activity_action ON reader_activity_log(action);

-- View for admin dashboard showing active readers
CREATE OR REPLACE VIEW active_readers_summary AS
SELECT 
  COUNT(*) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as active_count,
  COUNT(DISTINCT ip_address) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_ips,
  COUNT(DISTINCT user_id) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_users
FROM active_reader_sessions;

-- Enable RLS
ALTER TABLE active_reader_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for service role access
CREATE POLICY "Service role can manage active sessions"
  ON active_reader_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage activity log"
  ON reader_activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);
