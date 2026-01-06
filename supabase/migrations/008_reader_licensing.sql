-- Reader Licensing and Device Activation System
-- Handles purchase verification, license codes, and device limits

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- READER LICENSES TABLE
-- Stores license codes generated after purchase
-- ============================================
CREATE TABLE IF NOT EXISTS reader_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_code VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    amount_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    max_devices INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for license lookups
CREATE INDEX IF NOT EXISTS idx_licenses_code ON reader_licenses(license_code);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON reader_licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_stripe_session ON reader_licenses(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_licenses_purchased ON reader_licenses(purchased_at);

-- ============================================
-- DEVICE ACTIVATIONS TABLE
-- Tracks which devices have been activated with each license
-- ============================================
CREATE TABLE IF NOT EXISTS device_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES reader_licenses(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('macos', 'windows', 'ios', 'android', 'web')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent same device from being activated twice with same license
    CONSTRAINT unique_license_device UNIQUE (license_id, device_fingerprint)
);

-- Indexes for activation queries
CREATE INDEX IF NOT EXISTS idx_activations_license ON device_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_activations_fingerprint ON device_activations(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_activations_active ON device_activations(is_active);

-- ============================================
-- LICENSE SUPPORT CLAIMS TABLE
-- For users disputing device limits or requesting help
-- ============================================
CREATE TABLE IF NOT EXISTS license_support_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    license_id UUID REFERENCES reader_licenses(id) ON DELETE SET NULL,
    license_code VARCHAR(32),
    email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN (
        'DEVICE_LIMIT_EXCEEDED', 'ACTIVATION_ISSUE', 'DOWNLOAD_ISSUE',
        'CODE_NOT_WORKING', 'TRANSFER_REQUEST', 'OTHER'
    )),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    device_info TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED')),
    admin_notes TEXT,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for support claim queries
CREATE INDEX IF NOT EXISTS idx_claims_license ON license_support_claims(license_id);
CREATE INDEX IF NOT EXISTS idx_claims_email ON license_support_claims(email);
CREATE INDEX IF NOT EXISTS idx_claims_status ON license_support_claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created ON license_support_claims(created_at);

-- ============================================
-- DOWNLOAD EMAILS SENT TABLE
-- Tracks when download emails were sent
-- ============================================
CREATE TABLE IF NOT EXISTS reader_download_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES reader_licenses(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    resend_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_download_emails_license ON reader_download_emails(license_id);

-- ============================================
-- DAILY SALES REPORTS TABLE
-- Stores generated daily reports for reference
-- ============================================
CREATE TABLE IF NOT EXISTS daily_sales_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL UNIQUE,
    total_sales INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    report_data JSONB NOT NULL DEFAULT '{}',
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_date ON daily_sales_reports(report_date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger for reader_licenses
DROP TRIGGER IF EXISTS update_reader_licenses_updated_at ON reader_licenses;
CREATE TRIGGER update_reader_licenses_updated_at
    BEFORE UPDATE ON reader_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for license_support_claims
DROP TRIGGER IF EXISTS update_license_support_claims_updated_at ON license_support_claims;
CREATE TRIGGER update_license_support_claims_updated_at
    BEFORE UPDATE ON license_support_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE reader_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_support_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_download_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to reader_licenses" ON reader_licenses FOR ALL USING (true);
CREATE POLICY "Service role full access to device_activations" ON device_activations FOR ALL USING (true);
CREATE POLICY "Service role full access to license_support_claims" ON license_support_claims FOR ALL USING (true);
CREATE POLICY "Service role full access to reader_download_emails" ON reader_download_emails FOR ALL USING (true);
CREATE POLICY "Service role full access to daily_sales_reports" ON daily_sales_reports FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTION: Generate License Code
-- ============================================
CREATE OR REPLACE FUNCTION generate_license_code()
RETURNS VARCHAR(32) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(32) := '';
    i INTEGER;
BEGIN
    -- Generate format: XXXX-XXXX-XXXX-XXXX
    FOR i IN 1..16 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        IF i IN (4, 8, 12) THEN
            result := result || '-';
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Generate Claim Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Active Licenses with Device Count
-- ============================================
CREATE OR REPLACE VIEW license_device_summary AS
SELECT 
    rl.id,
    rl.license_code,
    rl.email,
    rl.customer_name,
    rl.max_devices,
    rl.is_active,
    rl.purchased_at,
    COUNT(da.id) FILTER (WHERE da.is_active = TRUE) as active_device_count,
    rl.max_devices - COUNT(da.id) FILTER (WHERE da.is_active = TRUE) as remaining_activations
FROM reader_licenses rl
LEFT JOIN device_activations da ON rl.id = da.license_id
GROUP BY rl.id;

GRANT SELECT ON license_device_summary TO service_role;
