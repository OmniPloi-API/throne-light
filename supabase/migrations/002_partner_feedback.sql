-- Partner Feedback System: Persistent Storage
-- Migrating from ephemeral JSON file to Supabase

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: partner_feedback
CREATE TABLE IF NOT EXISTS partner_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_number VARCHAR(20) NOT NULL UNIQUE,
    partner_id VARCHAR(100),
    partner_name VARCHAR(255),
    page_url TEXT NOT NULL,
    section_name VARCHAR(255),
    raw_feedback TEXT NOT NULL,
    processed_feedback TEXT,
    screenshot_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX idx_partner_feedback_status ON partner_feedback(status);
CREATE INDEX idx_partner_feedback_created ON partner_feedback(created_at DESC);
CREATE INDEX idx_partner_feedback_partner ON partner_feedback(partner_id);

-- Enable Row Level Security
ALTER TABLE partner_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for feedback submission)
CREATE POLICY "Allow anonymous feedback submission" ON partner_feedback
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow authenticated reads (for admin)
CREATE POLICY "Allow authenticated reads" ON partner_feedback
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated updates (for admin status changes)
CREATE POLICY "Allow authenticated updates" ON partner_feedback
    FOR UPDATE
    TO authenticated
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partner_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_feedback_timestamp
    BEFORE UPDATE ON partner_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_feedback_timestamp();

-- Function to generate feedback number
CREATE OR REPLACE FUNCTION generate_feedback_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    count_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    SELECT COUNT(*) + 1 INTO count_num FROM partner_feedback WHERE feedback_number LIKE 'FB-' || year_str || '-%';
    NEW.feedback_number := 'FB-' || year_str || '-' || LPAD(count_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_feedback_number
    BEFORE INSERT ON partner_feedback
    FOR EACH ROW
    WHEN (NEW.feedback_number IS NULL OR NEW.feedback_number = '')
    EXECUTE FUNCTION generate_feedback_number();
