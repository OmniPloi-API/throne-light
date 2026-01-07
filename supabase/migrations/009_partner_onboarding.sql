-- Partner Onboarding Email System
-- Tracks email deployment status, team members, and messaging

-- Add onboarding fields to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS onboarding_email_sent_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS onboarding_scheduled_at TIMESTAMPTZ;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS onboarding_cancelled BOOLEAN DEFAULT FALSE;

-- Partner team members (view-only access for team)
CREATE TABLE IF NOT EXISTS partner_team_members (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'viewer', -- 'admin' or 'viewer'
    access_code TEXT NOT NULL,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id, email)
);

-- Partner messages (two-way communication)
CREATE TABLE IF NOT EXISTS partner_messages (
    id TEXT PRIMARY KEY,
    partner_id TEXT REFERENCES partners(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'admin' or 'partner'
    sender_id TEXT, -- partner_id if from partner, null if from admin
    subject TEXT,
    message TEXT NOT NULL,
    is_announcement BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner support tickets
CREATE TABLE IF NOT EXISTS partner_support_tickets (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Support ticket messages (thread)
CREATE TABLE IF NOT EXISTS partner_ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES partner_support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'admin' or 'partner'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email forwarding rules (for partners@thronelightpublishing.com)
CREATE TABLE IF NOT EXISTS email_forwarding_rules (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    forward_to TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default forwarding rule for partners@ email
INSERT INTO email_forwarding_rules (id, from_address, forward_to, is_active)
VALUES (
    'default-partners-forward',
    'partners@thronelightpublishing.com',
    ARRAY['developer@thronelightpublishing.com', 'info@thronelightpublishing.com', 'olivia@thronelightpublishing.com'],
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_team_members_partner_id ON partner_team_members(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_team_members_email ON partner_team_members(email);
CREATE INDEX IF NOT EXISTS idx_partner_messages_partner_id ON partner_messages(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_support_tickets_partner_id ON partner_support_tickets(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_support_tickets_status ON partner_support_tickets(status);
