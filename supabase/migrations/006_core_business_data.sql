-- Core Business Data Migration
-- This migrates partners, tracking events, orders, subscribers, reviews, and support tickets
-- from the ephemeral JSON file to persistent Supabase storage

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT, -- Hashed password for partner login
    slug VARCHAR(100) NOT NULL UNIQUE,
    coupon_code VARCHAR(50) NOT NULL,
    access_code VARCHAR(50),
    amazon_url TEXT,
    kindle_url TEXT,
    book_baby_url TEXT,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT 20,
    click_bounty DECIMAL(10,2) NOT NULL DEFAULT 0.10,
    discount_percent INTEGER NOT NULL DEFAULT 10,
    partner_type VARCHAR(20) NOT NULL DEFAULT 'REV_SHARE' CHECK (partner_type IN ('REV_SHARE', 'FLAT_FEE')),
    auto_withdraw_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    -- Stripe Connect fields
    stripe_account_id VARCHAR(100),
    stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    tax_form_verified BOOLEAN NOT NULL DEFAULT FALSE,
    -- Location & Payout settings
    country VARCHAR(10) NOT NULL DEFAULT 'US',
    payout_method VARCHAR(20) NOT NULL DEFAULT 'STRIPE' CHECK (payout_method IN ('STRIPE', 'WISE', 'CRYPTO', 'MANUAL')),
    wise_email VARCHAR(255),
    crypto_wallet VARCHAR(255),
    last_payout_month VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for partner lookups
CREATE INDEX IF NOT EXISTS idx_partners_slug ON partners(slug);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);

-- ============================================
-- TRACKING EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'PAGE_VIEW', 'CLICK_AMAZON', 'CLICK_KINDLE', 'CLICK_BOOKBABY', 
        'CLICK_DIRECT', 'PENDING_SALE', 'SALE'
    )),
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_events_partner ON tracking_events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON tracking_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_partner_type ON tracking_events(partner_id, event_type);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    stripe_session_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    commission_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REFUNDED', 'FAILED')),
    -- Commission maturity tracking
    maturity_date TIMESTAMPTZ NOT NULL,
    is_matured BOOLEAN NOT NULL DEFAULT FALSE,
    -- Refund workflow
    refund_status VARCHAR(30) NOT NULL DEFAULT 'NONE' CHECK (refund_status IN (
        'NONE', 'REQUESTED', 'VERIFIED_PENDING', 'APPROVED', 'REJECTED', 'DISPUTED'
    )),
    refund_requested_at TIMESTAMPTZ,
    refund_verified_at TIMESTAMPTZ,
    refund_approved_at TIMESTAMPTZ,
    refund_rejected_at TIMESTAMPTZ,
    refund_reason TEXT,
    -- Geo tracking
    customer_country VARCHAR(100),
    customer_city VARCHAR(100),
    customer_ip VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order queries
CREATE INDEX IF NOT EXISTS idx_orders_partner ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    source VARCHAR(50) NOT NULL CHECK (source IN (
        'AUTHOR_MAILING_LIST', 'MUSIC_UPDATES', 'BOOK_UPDATES',
        'DAILY_ENCOURAGEMENT', 'WEEKLY_ENCOURAGEMENT', 'PUBLISHER_INQUIRY',
        'GENERAL_NEWSLETTER', 'OTHER'
    )),
    source_detail TEXT,
    country VARCHAR(100),
    country_flag VARCHAR(10),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint on email + source to allow same email in different lists
    CONSTRAINT unique_subscriber_source UNIQUE (email, source)
);

-- Indexes for subscriber queries
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers(source);
CREATE INDEX IF NOT EXISTS idx_subscribers_verified ON subscribers(is_verified);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'US',
    country_flag VARCHAR(10) NOT NULL DEFAULT '🇺🇸',
    device VARCHAR(20) NOT NULL DEFAULT 'desktop' CHECK (device IN ('mobile', 'desktop')),
    has_emoji BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    verification_sent_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- Indexes for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'ORDER_ISSUE', 'REFUND_REQUEST', 'TECHNICAL_ISSUE',
        'ACCOUNT_ISSUE', 'GENERAL_INQUIRY', 'OTHER'
    )),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    order_number VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    admin_notes TEXT,
    assigned_to VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for support ticket queries
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);

-- ============================================
-- PAYOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'PENDING_APPROVAL', 'PROCESSING', 'PAID', 'FAILED', 'REJECTED'
    )),
    payout_type VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (payout_type IN ('MANUAL', 'AUTO')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    requested_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for payout queries
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================
-- WITHDRAWAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount_requested DECIMAL(10,2) NOT NULL,
    payout_fee DECIMAL(10,2) NOT NULL DEFAULT 0.25,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    cross_border_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_to_deposit DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'FAILED')),
    payout_method VARCHAR(20) NOT NULL DEFAULT 'STRIPE' CHECK (payout_method IN ('STRIPE', 'WISE', 'CRYPTO', 'MANUAL')),
    stripe_transfer_id VARCHAR(255),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for withdrawal queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_partner ON withdrawal_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);

-- ============================================
-- MANUSCRIPT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS manuscript_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    synopsis TEXT NOT NULL,
    sample_chapter TEXT,
    manuscript_file_url TEXT,
    manuscript_file_name VARCHAR(500),
    manuscript_file_size INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for submission queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON manuscript_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON manuscript_submissions(email);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

-- Partners
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Subscribers
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Support Tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Manuscript Submissions
DROP TRIGGER IF EXISTS update_submissions_updated_at ON manuscript_submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON manuscript_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript_submissions ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for server-side operations)
CREATE POLICY "Service role full access to partners" ON partners FOR ALL USING (true);
CREATE POLICY "Service role full access to tracking_events" ON tracking_events FOR ALL USING (true);
CREATE POLICY "Service role full access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access to subscribers" ON subscribers FOR ALL USING (true);
CREATE POLICY "Service role full access to reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Service role full access to support_tickets" ON support_tickets FOR ALL USING (true);
CREATE POLICY "Service role full access to payouts" ON payouts FOR ALL USING (true);
CREATE POLICY "Service role full access to withdrawal_requests" ON withdrawal_requests FOR ALL USING (true);
CREATE POLICY "Service role full access to manuscript_submissions" ON manuscript_submissions FOR ALL USING (true);

-- Public read for approved reviews
CREATE POLICY "Public can read approved reviews" ON reviews FOR SELECT USING (status = 'APPROVED');

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Partner performance view
CREATE OR REPLACE VIEW partner_performance AS
SELECT 
    p.id,
    p.name,
    p.email,
    p.slug,
    p.coupon_code,
    p.commission_percent,
    p.click_bounty,
    p.discount_percent,
    p.is_active,
    COALESCE(page_views.count, 0) as page_views,
    COALESCE(amazon_clicks.count, 0) as amazon_clicks,
    COALESCE(direct_clicks.count, 0) as direct_clicks,
    COALESCE(sales.count, 0) as sales,
    COALESCE(sales.total_revenue, 0) as total_revenue,
    COALESCE(sales.total_commission, 0) as total_commission,
    p.created_at
FROM partners p
LEFT JOIN (
    SELECT partner_id, COUNT(*) as count 
    FROM tracking_events WHERE event_type = 'PAGE_VIEW' 
    GROUP BY partner_id
) page_views ON p.id = page_views.partner_id
LEFT JOIN (
    SELECT partner_id, COUNT(*) as count 
    FROM tracking_events WHERE event_type = 'CLICK_AMAZON' 
    GROUP BY partner_id
) amazon_clicks ON p.id = amazon_clicks.partner_id
LEFT JOIN (
    SELECT partner_id, COUNT(*) as count 
    FROM tracking_events WHERE event_type = 'CLICK_DIRECT' 
    GROUP BY partner_id
) direct_clicks ON p.id = direct_clicks.partner_id
LEFT JOIN (
    SELECT partner_id, COUNT(*) as count, SUM(total_amount) as total_revenue, SUM(commission_earned) as total_commission
    FROM orders WHERE status = 'COMPLETED'
    GROUP BY partner_id
) sales ON p.id = sales.partner_id;

-- Grant access to the view
GRANT SELECT ON partner_performance TO authenticated;
GRANT SELECT ON partner_performance TO service_role;

-- Global analytics view
CREATE OR REPLACE VIEW global_analytics AS
SELECT
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'PAGE_VIEW') as total_page_views,
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'CLICK_AMAZON') as total_amazon_clicks,
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'CLICK_DIRECT') as total_direct_clicks,
    (SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED') as total_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'COMPLETED') as total_revenue,
    (SELECT COUNT(*) FROM subscribers WHERE is_verified = true) as total_subscribers,
    (SELECT COUNT(*) FROM reviews WHERE status = 'APPROVED') as total_reviews,
    (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE status = 'APPROVED') as average_rating;

GRANT SELECT ON global_analytics TO authenticated;
GRANT SELECT ON global_analytics TO service_role;
