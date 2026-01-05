-- Reader Support Tickets Table
-- Stores support requests from Throne Light Reader users

CREATE TABLE IF NOT EXISTS reader_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Device info
  browser TEXT,
  os TEXT,
  device_type TEXT, -- 'Mobile' or 'Desktop'
  screen_resolution TEXT,
  viewport_size TEXT,
  user_agent TEXT,
  platform TEXT,
  browser_language TEXT,
  
  -- Reader state
  current_page INTEGER,
  total_pages INTEGER,
  current_section TEXT,
  is_dark_mode BOOLEAN DEFAULT TRUE,
  selected_language TEXT DEFAULT 'en',
  audio_enabled BOOLEAN DEFAULT FALSE,
  
  -- Ticket management
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reader_support_tickets_status ON reader_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_reader_support_tickets_created_at ON reader_support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reader_support_tickets_email ON reader_support_tickets(email);

-- Enable RLS
ALTER TABLE reader_support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can insert (create support ticket)
CREATE POLICY "Anyone can create support tickets" ON reader_support_tickets
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read/update (handled via service role key in API)
CREATE POLICY "Service role can do everything" ON reader_support_tickets
  FOR ALL USING (true);

-- Summary view for admin dashboard
CREATE OR REPLACE VIEW reader_support_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE device_type = 'Mobile') as mobile_tickets,
  COUNT(*) FILTER (WHERE device_type = 'Desktop') as desktop_tickets,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as tickets_last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as tickets_last_7d
FROM reader_support_tickets;
