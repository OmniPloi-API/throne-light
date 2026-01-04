-- Lazy Generation TTS System: Audio Segments Cache
-- This table stores generated audio files for reuse across users

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: audio_segments (The Community Cache)
CREATE TABLE IF NOT EXISTS audio_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL,
    content_hash VARCHAR(32) NOT NULL, -- MD5 hash of paragraph text
    segment_index INTEGER NOT NULL, -- Paragraph order in chapter
    language_code VARCHAR(10) NOT NULL DEFAULT 'en', -- e.g., 'en', 'es', 'fr'
    voice_id VARCHAR(50) NOT NULL DEFAULT 'shimmer', -- OpenAI voice
    version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number BETWEEN 1 AND 3),
    storage_path TEXT NOT NULL, -- Path to audio file in storage
    duration_seconds DECIMAL(10, 2), -- Audio duration for progress tracking
    flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    generation_cost_cents INTEGER DEFAULT 0, -- Track costs per segment
    play_count INTEGER NOT NULL DEFAULT 0, -- Track popularity
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one version per paragraph/language/voice combo
    CONSTRAINT unique_segment_version UNIQUE (book_id, content_hash, language_code, voice_id, version_number)
);

-- Table: audio_feedback (User Reports for Quality Control)
CREATE TABLE IF NOT EXISTS audio_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audio_segment_id UUID NOT NULL REFERENCES audio_segments(id) ON DELETE CASCADE,
    user_id UUID, -- Can be null for anonymous users
    session_id VARCHAR(64), -- For anonymous tracking
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('wrong_language', 'glitch', 'robotic', 'mispronunciation', 'wrong_speed', 'other')),
    comment TEXT, -- Optional user details
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_audio_segments_lookup 
    ON audio_segments(book_id, content_hash, language_code, voice_id, version_number);

CREATE INDEX IF NOT EXISTS idx_audio_segments_flagged 
    ON audio_segments(flagged_for_review) WHERE flagged_for_review = TRUE;

CREATE INDEX IF NOT EXISTS idx_audio_feedback_segment 
    ON audio_feedback(audio_segment_id);

CREATE INDEX IF NOT EXISTS idx_audio_feedback_unresolved 
    ON audio_feedback(resolved) WHERE resolved = FALSE;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for audio_segments updated_at
DROP TRIGGER IF EXISTS update_audio_segments_updated_at ON audio_segments;
CREATE TRIGGER update_audio_segments_updated_at
    BEFORE UPDATE ON audio_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-flag segments with 3+ reports
CREATE OR REPLACE FUNCTION check_and_flag_segment()
RETURNS TRIGGER AS $$
DECLARE
    report_count INTEGER;
BEGIN
    -- Count total unresolved reports for this segment
    SELECT COUNT(*) INTO report_count
    FROM audio_feedback
    WHERE audio_segment_id = NEW.audio_segment_id
    AND resolved = FALSE;
    
    -- Flag if 3 or more reports
    IF report_count >= 3 THEN
        UPDATE audio_segments
        SET flagged_for_review = TRUE
        WHERE id = NEW.audio_segment_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-flag on new feedback
DROP TRIGGER IF EXISTS auto_flag_segment ON audio_feedback;
CREATE TRIGGER auto_flag_segment
    AFTER INSERT ON audio_feedback
    FOR EACH ROW
    EXECUTE FUNCTION check_and_flag_segment();

-- RLS Policies (Row Level Security)
ALTER TABLE audio_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_feedback ENABLE ROW LEVEL SECURITY;

-- Public read access to audio segments (the cache is shared)
CREATE POLICY "Audio segments are publicly readable"
    ON audio_segments FOR SELECT
    USING (true);

-- Only authenticated users or service role can insert
CREATE POLICY "Service role can insert audio segments"
    ON audio_segments FOR INSERT
    WITH CHECK (true);

-- Anyone can submit feedback
CREATE POLICY "Anyone can submit audio feedback"
    ON audio_feedback FOR INSERT
    WITH CHECK (true);

-- Only admins can view/manage all feedback
CREATE POLICY "Admins can view all feedback"
    ON audio_feedback FOR SELECT
    USING (true);

-- View for admin dashboard: flagged segments with report counts
CREATE OR REPLACE VIEW flagged_audio_segments AS
SELECT 
    s.id,
    s.book_id,
    s.segment_index,
    s.language_code,
    s.voice_id,
    s.version_number,
    s.storage_path,
    s.flagged_for_review,
    s.created_at,
    COUNT(f.id) as total_reports,
    COUNT(CASE WHEN f.resolved = FALSE THEN 1 END) as unresolved_reports,
    ARRAY_AGG(DISTINCT f.issue_type) as issue_types
FROM audio_segments s
LEFT JOIN audio_feedback f ON s.id = f.audio_segment_id
WHERE s.flagged_for_review = TRUE
GROUP BY s.id
ORDER BY unresolved_reports DESC, s.created_at DESC;

-- Grant access to the view
GRANT SELECT ON flagged_audio_segments TO authenticated;
GRANT SELECT ON flagged_audio_segments TO anon;
