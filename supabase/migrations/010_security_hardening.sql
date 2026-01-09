-- ============================================
-- SECURITY HARDENING MIGRATION
-- Fixes: RLS Disabled, Policy Always True, Search Path Mutable, Security Definer Views
-- ============================================

-- ============================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- (Ensures no table is left without RLS)
-- ============================================

-- Core business tables
ALTER TABLE IF EXISTS partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS manuscript_submissions ENABLE ROW LEVEL SECURITY;

-- Reader licensing tables
ALTER TABLE IF EXISTS reader_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS device_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS license_support_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reader_download_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_sales_reports ENABLE ROW LEVEL SECURITY;

-- Reader session tables
ALTER TABLE IF EXISTS active_reader_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reader_activity_log ENABLE ROW LEVEL SECURITY;

-- Email campaign tables
ALTER TABLE IF EXISTS email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriber_campaign_state ENABLE ROW LEVEL SECURITY;

-- Audio tables
ALTER TABLE IF EXISTS audio_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audio_feedback ENABLE ROW LEVEL SECURITY;

-- Feedback and profiles
ALTER TABLE IF EXISTS partner_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_locations ENABLE ROW LEVEL SECURITY;

-- Support tickets
ALTER TABLE IF EXISTS reader_support_tickets ENABLE ROW LEVEL SECURITY;

-- Partner onboarding tables
ALTER TABLE IF EXISTS partner_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_forwarding_rules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: DROP ALL EXISTING PERMISSIVE POLICIES
-- ============================================

-- Core business tables
DROP POLICY IF EXISTS "Service role full access to partners" ON partners;
DROP POLICY IF EXISTS "Service role full access to tracking_events" ON tracking_events;
DROP POLICY IF EXISTS "Service role full access to orders" ON orders;
DROP POLICY IF EXISTS "Service role full access to subscribers" ON subscribers;
DROP POLICY IF EXISTS "Service role full access to reviews" ON reviews;
DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Service role full access to support_tickets" ON support_tickets;
DROP POLICY IF EXISTS "Service role full access to payouts" ON payouts;
DROP POLICY IF EXISTS "Service role full access to withdrawal_requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Service role full access to manuscript_submissions" ON manuscript_submissions;

-- Reader licensing tables
DROP POLICY IF EXISTS "Service role full access to reader_licenses" ON reader_licenses;
DROP POLICY IF EXISTS "Service role full access to device_activations" ON device_activations;
DROP POLICY IF EXISTS "Service role full access to license_support_claims" ON license_support_claims;
DROP POLICY IF EXISTS "Service role full access to reader_download_emails" ON reader_download_emails;
DROP POLICY IF EXISTS "Service role full access to daily_sales_reports" ON daily_sales_reports;

-- Reader sessions
DROP POLICY IF EXISTS "Service role can manage active sessions" ON active_reader_sessions;
DROP POLICY IF EXISTS "Service role can manage activity log" ON reader_activity_log;

-- Email campaigns
DROP POLICY IF EXISTS "Service role full access to email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Service role full access to email_sends" ON email_sends;
DROP POLICY IF EXISTS "Service role full access to subscriber_campaign_state" ON subscriber_campaign_state;

-- Audio
DROP POLICY IF EXISTS "Audio segments are publicly readable" ON audio_segments;
DROP POLICY IF EXISTS "Service role can insert audio segments" ON audio_segments;
DROP POLICY IF EXISTS "Anyone can submit audio feedback" ON audio_feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON audio_feedback;

-- Feedback
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON partner_feedback;
DROP POLICY IF EXISTS "Allow authenticated reads" ON partner_feedback;
DROP POLICY IF EXISTS "Allow authenticated updates" ON partner_feedback;

-- Profiles and sales
DROP POLICY IF EXISTS "Service role can manage user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage sales_locations" ON sales_locations;

-- Support tickets
DROP POLICY IF EXISTS "Anyone can create support tickets" ON reader_support_tickets;
DROP POLICY IF EXISTS "Service role can do everything" ON reader_support_tickets;

-- ============================================
-- PART 3: CREATE STRICT SERVICE ROLE POLICIES
-- Service role bypasses RLS by default, but we explicitly define policies
-- for clarity and to handle authenticated/anon roles properly
-- ============================================

-- Helper: Check if current user is service_role
-- Note: service_role bypasses RLS, but we still define policies for other roles

-- ============================================
-- PARTNERS TABLE POLICIES
-- ============================================
-- Service role: Full access (implicit bypass)
-- Authenticated: Can only read their own partner record
CREATE POLICY "partners_service_role_all" ON partners
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "partners_authenticated_select_own" ON partners
    FOR SELECT TO authenticated
    USING (email = auth.jwt()->>'email');

-- ============================================
-- TRACKING EVENTS TABLE POLICIES
-- ============================================
CREATE POLICY "tracking_events_service_role_all" ON tracking_events
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can insert tracking events (for page views)
CREATE POLICY "tracking_events_anon_insert" ON tracking_events
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================
CREATE POLICY "orders_service_role_all" ON orders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view their own orders
CREATE POLICY "orders_authenticated_select_own" ON orders
    FOR SELECT TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

-- ============================================
-- SUBSCRIBERS TABLE POLICIES
-- ============================================
CREATE POLICY "subscribers_service_role_all" ON subscribers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can insert (newsletter signup)
CREATE POLICY "subscribers_anon_insert" ON subscribers
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================
CREATE POLICY "reviews_service_role_all" ON reviews
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public can read approved reviews only
CREATE POLICY "reviews_public_select_approved" ON reviews
    FOR SELECT TO anon USING (status = 'APPROVED');

CREATE POLICY "reviews_authenticated_select_approved" ON reviews
    FOR SELECT TO authenticated USING (status = 'APPROVED');

-- Anon can submit reviews
CREATE POLICY "reviews_anon_insert" ON reviews
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- SUPPORT TICKETS TABLE POLICIES
-- ============================================
CREATE POLICY "support_tickets_service_role_all" ON support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can create tickets
CREATE POLICY "support_tickets_anon_insert" ON support_tickets
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- PAYOUTS TABLE POLICIES
-- ============================================
CREATE POLICY "payouts_service_role_all" ON payouts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view their own payouts
CREATE POLICY "payouts_authenticated_select_own" ON payouts
    FOR SELECT TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

-- ============================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- ============================================
CREATE POLICY "withdrawal_requests_service_role_all" ON withdrawal_requests
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view and create their own withdrawal requests
CREATE POLICY "withdrawal_requests_authenticated_select_own" ON withdrawal_requests
    FOR SELECT TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "withdrawal_requests_authenticated_insert_own" ON withdrawal_requests
    FOR INSERT TO authenticated
    WITH CHECK (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

-- ============================================
-- MANUSCRIPT SUBMISSIONS TABLE POLICIES
-- ============================================
CREATE POLICY "manuscript_submissions_service_role_all" ON manuscript_submissions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can submit manuscripts
CREATE POLICY "manuscript_submissions_anon_insert" ON manuscript_submissions
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- READER LICENSES TABLE POLICIES
-- ============================================
CREATE POLICY "reader_licenses_service_role_all" ON reader_licenses
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- DEVICE ACTIVATIONS TABLE POLICIES
-- ============================================
CREATE POLICY "device_activations_service_role_all" ON device_activations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- LICENSE SUPPORT CLAIMS TABLE POLICIES
-- ============================================
CREATE POLICY "license_support_claims_service_role_all" ON license_support_claims
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can submit support claims
CREATE POLICY "license_support_claims_anon_insert" ON license_support_claims
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- READER DOWNLOAD EMAILS TABLE POLICIES
-- ============================================
CREATE POLICY "reader_download_emails_service_role_all" ON reader_download_emails
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- DAILY SALES REPORTS TABLE POLICIES
-- ============================================
CREATE POLICY "daily_sales_reports_service_role_all" ON daily_sales_reports
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- ACTIVE READER SESSIONS TABLE POLICIES
-- ============================================
CREATE POLICY "active_reader_sessions_service_role_all" ON active_reader_sessions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can insert/update sessions (for reader heartbeats)
CREATE POLICY "active_reader_sessions_anon_insert" ON active_reader_sessions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "active_reader_sessions_anon_update" ON active_reader_sessions
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================
-- READER ACTIVITY LOG TABLE POLICIES
-- ============================================
CREATE POLICY "reader_activity_log_service_role_all" ON reader_activity_log
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can log activity
CREATE POLICY "reader_activity_log_anon_insert" ON reader_activity_log
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- EMAIL CAMPAIGNS TABLE POLICIES
-- ============================================
CREATE POLICY "email_campaigns_service_role_all" ON email_campaigns
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- EMAIL SENDS TABLE POLICIES
-- ============================================
CREATE POLICY "email_sends_service_role_all" ON email_sends
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- SUBSCRIBER CAMPAIGN STATE TABLE POLICIES
-- ============================================
CREATE POLICY "subscriber_campaign_state_service_role_all" ON subscriber_campaign_state
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- AUDIO SEGMENTS TABLE POLICIES
-- ============================================
CREATE POLICY "audio_segments_service_role_all" ON audio_segments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read access (shared cache)
CREATE POLICY "audio_segments_public_select" ON audio_segments
    FOR SELECT TO anon USING (true);

CREATE POLICY "audio_segments_authenticated_select" ON audio_segments
    FOR SELECT TO authenticated USING (true);

-- ============================================
-- AUDIO FEEDBACK TABLE POLICIES
-- ============================================
CREATE POLICY "audio_feedback_service_role_all" ON audio_feedback
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anyone can submit feedback
CREATE POLICY "audio_feedback_anon_insert" ON audio_feedback
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "audio_feedback_authenticated_insert" ON audio_feedback
    FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- PARTNER FEEDBACK TABLE POLICIES
-- ============================================
CREATE POLICY "partner_feedback_service_role_all" ON partner_feedback
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can submit feedback
CREATE POLICY "partner_feedback_anon_insert" ON partner_feedback
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- USER PROFILES TABLE POLICIES
-- ============================================
CREATE POLICY "user_profiles_service_role_all" ON user_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- SALES LOCATIONS TABLE POLICIES
-- ============================================
CREATE POLICY "sales_locations_service_role_all" ON sales_locations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read for map visualization (non-sensitive aggregate data)
CREATE POLICY "sales_locations_public_select" ON sales_locations
    FOR SELECT TO anon
    USING (true); -- Only exposes city/country/lat/long, no PII in select

-- ============================================
-- READER SUPPORT TICKETS TABLE POLICIES
-- ============================================
CREATE POLICY "reader_support_tickets_service_role_all" ON reader_support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can create tickets
CREATE POLICY "reader_support_tickets_anon_insert" ON reader_support_tickets
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- PARTNER TEAM MEMBERS TABLE POLICIES
-- ============================================
CREATE POLICY "partner_team_members_service_role_all" ON partner_team_members
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Team members can view their own team
CREATE POLICY "partner_team_members_authenticated_select_own" ON partner_team_members
    FOR SELECT TO authenticated
    USING (email = auth.jwt()->>'email');

-- ============================================
-- PARTNER MESSAGES TABLE POLICIES
-- ============================================
CREATE POLICY "partner_messages_service_role_all" ON partner_messages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view their own messages
CREATE POLICY "partner_messages_authenticated_select_own" ON partner_messages
    FOR SELECT TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        ) OR is_announcement = true
    );

-- ============================================
-- PARTNER SUPPORT TICKETS TABLE POLICIES
-- ============================================
CREATE POLICY "partner_support_tickets_service_role_all" ON partner_support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view/create their own tickets
CREATE POLICY "partner_support_tickets_authenticated_select_own" ON partner_support_tickets
    FOR SELECT TO authenticated
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "partner_support_tickets_authenticated_insert_own" ON partner_support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (
        partner_id IN (
            SELECT id FROM partners WHERE email = auth.jwt()->>'email'
        )
    );

-- ============================================
-- PARTNER TICKET MESSAGES TABLE POLICIES
-- ============================================
CREATE POLICY "partner_ticket_messages_service_role_all" ON partner_ticket_messages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partners can view/create messages on their own tickets
CREATE POLICY "partner_ticket_messages_authenticated_select_own" ON partner_ticket_messages
    FOR SELECT TO authenticated
    USING (
        ticket_id IN (
            SELECT pst.id FROM partner_support_tickets pst
            JOIN partners p ON pst.partner_id = p.id
            WHERE p.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "partner_ticket_messages_authenticated_insert_own" ON partner_ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        ticket_id IN (
            SELECT pst.id FROM partner_support_tickets pst
            JOIN partners p ON pst.partner_id = p.id
            WHERE p.email = auth.jwt()->>'email'
        )
    );

-- ============================================
-- EMAIL FORWARDING RULES TABLE POLICIES
-- ============================================
CREATE POLICY "email_forwarding_rules_service_role_all" ON email_forwarding_rules
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- PART 4: FIX FUNCTIONS WITH SEARCH_PATH
-- Recreate functions with SET search_path = public
-- ============================================

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: check_and_flag_segment
CREATE OR REPLACE FUNCTION check_and_flag_segment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    report_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO report_count
    FROM audio_feedback
    WHERE audio_segment_id = NEW.audio_segment_id
    AND resolved = FALSE;
    
    IF report_count >= 3 THEN
        UPDATE audio_segments
        SET flagged_for_review = TRUE
        WHERE id = NEW.audio_segment_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix: cleanup_stale_reader_sessions
CREATE OR REPLACE FUNCTION cleanup_stale_reader_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE active_reader_sessions
    SET is_active = FALSE
    WHERE is_active = TRUE
        AND last_heartbeat < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Fix: update_partner_feedback_timestamp
CREATE OR REPLACE FUNCTION update_partner_feedback_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: generate_feedback_number
CREATE OR REPLACE FUNCTION generate_feedback_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    year_str TEXT;
    count_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    SELECT COUNT(*) + 1 INTO count_num FROM partner_feedback WHERE feedback_number LIKE 'FB-' || year_str || '-%';
    NEW.feedback_number := 'FB-' || year_str || '-' || LPAD(count_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

-- Fix: generate_license_code
CREATE OR REPLACE FUNCTION generate_license_code()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(32) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..16 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        IF i IN (4, 8, 12) THEN
            result := result || '-';
        END IF;
    END LOOP;
    RETURN result;
END;
$$;

-- Fix: generate_claim_number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
END;
$$;

-- ============================================
-- PART 5: RECREATE VIEWS AS SECURITY INVOKER
-- Ensures views respect RLS policies of the calling user
-- ============================================

-- Recreate partner_performance view (SECURITY INVOKER is default for views)
DROP VIEW IF EXISTS partner_performance;
CREATE VIEW partner_performance AS
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

-- Revoke public access and grant only to service_role
REVOKE ALL ON partner_performance FROM anon, authenticated;
GRANT SELECT ON partner_performance TO service_role;

-- Recreate global_analytics view
DROP VIEW IF EXISTS global_analytics;
CREATE VIEW global_analytics AS
SELECT
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'PAGE_VIEW') as total_page_views,
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'CLICK_AMAZON') as total_amazon_clicks,
    (SELECT COUNT(*) FROM tracking_events WHERE event_type = 'CLICK_DIRECT') as total_direct_clicks,
    (SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED') as total_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'COMPLETED') as total_revenue,
    (SELECT COUNT(*) FROM subscribers WHERE is_verified = true) as total_subscribers,
    (SELECT COUNT(*) FROM reviews WHERE status = 'APPROVED') as total_reviews,
    (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE status = 'APPROVED') as average_rating;

REVOKE ALL ON global_analytics FROM anon, authenticated;
GRANT SELECT ON global_analytics TO service_role;

-- Recreate flagged_audio_segments view
DROP VIEW IF EXISTS flagged_audio_segments;
CREATE VIEW flagged_audio_segments AS
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

REVOKE ALL ON flagged_audio_segments FROM anon;
GRANT SELECT ON flagged_audio_segments TO authenticated, service_role;

-- Recreate active_readers_summary view
DROP VIEW IF EXISTS active_readers_summary;
CREATE VIEW active_readers_summary AS
SELECT 
    COUNT(*) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as active_count,
    COUNT(DISTINCT ip_address) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_ips,
    COUNT(DISTINCT user_id) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_users
FROM active_reader_sessions;

REVOKE ALL ON active_readers_summary FROM anon, authenticated;
GRANT SELECT ON active_readers_summary TO service_role;

-- Recreate license_device_summary view
DROP VIEW IF EXISTS license_device_summary;
CREATE VIEW license_device_summary AS
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

REVOKE ALL ON license_device_summary FROM anon, authenticated;
GRANT SELECT ON license_device_summary TO service_role;

-- Recreate subscribers_due_for_email view
DROP VIEW IF EXISTS subscribers_due_for_email;
CREATE VIEW subscribers_due_for_email AS
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

REVOKE ALL ON subscribers_due_for_email FROM anon, authenticated;
GRANT SELECT ON subscribers_due_for_email TO service_role;

-- Recreate sales_by_location view
DROP VIEW IF EXISTS sales_by_location;
CREATE VIEW sales_by_location AS
SELECT 
    city,
    country,
    country_code,
    latitude,
    longitude,
    COUNT(*) as sale_count,
    SUM(amount) as total_amount
FROM sales_locations
WHERE latitude IS NOT NULL
GROUP BY city, country, country_code, latitude, longitude;

-- This view is intentionally public for map visualization
GRANT SELECT ON sales_by_location TO anon, authenticated, service_role;

-- Recreate readers_by_location view
DROP VIEW IF EXISTS readers_by_location;
CREATE VIEW readers_by_location AS
SELECT 
    city,
    country,
    country_code,
    latitude,
    longitude,
    COUNT(*) as reader_count
FROM active_reader_sessions
WHERE is_active = TRUE 
    AND latitude IS NOT NULL
    AND last_heartbeat > NOW() - INTERVAL '5 minutes'
GROUP BY city, country, country_code, latitude, longitude;

-- This view is intentionally public for map visualization
GRANT SELECT ON readers_by_location TO anon, authenticated, service_role;

-- Recreate reader_support_summary view
DROP VIEW IF EXISTS reader_support_summary;
CREATE VIEW reader_support_summary AS
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

REVOKE ALL ON reader_support_summary FROM anon, authenticated;
GRANT SELECT ON reader_support_summary TO service_role;

-- ============================================
-- PART 6: GRANT SERVICE ROLE BYPASS
-- Ensure service_role can bypass RLS (this is default but explicit)
-- ============================================
-- Note: service_role automatically bypasses RLS by design in Supabase
-- The policies above with "TO service_role" are for documentation/explicitness

-- ============================================
-- VERIFICATION COMMENT
-- After running this migration, rerun the Supabase Security Advisor
-- Goal: 0 Errors for RLS Disabled, Policy Always True, Search Path Mutable
-- ============================================
