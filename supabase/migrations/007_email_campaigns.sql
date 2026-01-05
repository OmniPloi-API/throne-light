-- Email Campaigns Migration
-- Tracks "Light of EOLLES" bi-weekly email sends to subscribers

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    email_count INTEGER NOT NULL DEFAULT 0,
    frequency_days INTEGER NOT NULL DEFAULT 14, -- Bi-weekly = 14 days
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the Light of EOLLES campaign
INSERT INTO email_campaigns (name, slug, description, email_count, frequency_days)
VALUES (
    'Light of EOLLES',
    'light-of-eolles',
    'Bi-weekly words of encouragement from EOLLES to her beloved readers',
    52,
    14
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- EMAIL SENDS TABLE
-- Tracks which emails have been sent to which subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    campaign_slug VARCHAR(100) NOT NULL,
    email_number INTEGER NOT NULL, -- Which email in the sequence (1-52)
    resend_id VARCHAR(255), -- Resend API message ID
    status VARCHAR(20) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED')),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    failed_reason TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate sends
    CONSTRAINT unique_subscriber_campaign_email UNIQUE (subscriber_id, campaign_slug, email_number)
);

-- Indexes for email send queries
CREATE INDEX IF NOT EXISTS idx_email_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_slug);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at);

-- ============================================
-- SUBSCRIBER CAMPAIGN STATE
-- Tracks where each subscriber is in each campaign
-- ============================================
CREATE TABLE IF NOT EXISTS subscriber_campaign_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    campaign_slug VARCHAR(100) NOT NULL,
    current_email_number INTEGER NOT NULL DEFAULT 0, -- Last sent email number (0 = none sent yet)
    next_send_at TIMESTAMPTZ NOT NULL, -- When to send the next email
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE, -- Has received all emails
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT unique_subscriber_campaign UNIQUE (subscriber_id, campaign_slug)
);

-- Indexes for campaign state queries
CREATE INDEX IF NOT EXISTS idx_campaign_state_subscriber ON subscriber_campaign_state(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_campaign_state_next_send ON subscriber_campaign_state(next_send_at);
CREATE INDEX IF NOT EXISTS idx_campaign_state_active ON subscriber_campaign_state(is_paused, is_completed);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger for email_campaigns
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_campaign_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to email_campaigns" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Service role full access to email_sends" ON email_sends FOR ALL USING (true);
CREATE POLICY "Service role full access to subscriber_campaign_state" ON subscriber_campaign_state FOR ALL USING (true);

-- ============================================
-- VIEW: Subscribers due for next email
-- ============================================
CREATE OR REPLACE VIEW subscribers_due_for_email AS
SELECT 
    scs.id as state_id,
    scs.subscriber_id,
    s.email,
    s.first_name,
    scs.campaign_slug,
    scs.current_email_number,
    scs.current_email_number + 1 as next_email_number,
    scs.next_send_at
FROM subscriber_campaign_state scs
JOIN subscribers s ON scs.subscriber_id = s.id
WHERE 
    scs.is_paused = FALSE 
    AND scs.is_completed = FALSE
    AND s.unsubscribed_at IS NULL
    AND scs.next_send_at <= NOW();

GRANT SELECT ON subscribers_due_for_email TO service_role;
