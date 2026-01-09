-- ============================================
-- SECURITY HARDENING PART 2: PRISMA TABLES + VIEW FIXES
-- Fixes remaining RLS issues on PascalCase Prisma tables
-- and Security Definer View warnings
-- ============================================

-- ============================================
-- PART 1: ENABLE RLS ON PRISMA TABLES (PascalCase)
-- These tables were created by Prisma with different naming
-- ============================================

ALTER TABLE IF EXISTS "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Partner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TrackingEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BonusClaim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "LibraryAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DigitalBook" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: CREATE POLICIES FOR PRISMA TABLES
-- Service role only - these are accessed via backend API
-- ============================================

-- Admin table - service role only (sensitive)
CREATE POLICY "Admin_service_role_all" ON "Admin"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Partner table (Prisma version)
CREATE POLICY "Partner_service_role_all" ON "Partner"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Order table (Prisma version)
CREATE POLICY "Order_service_role_all" ON "Order"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User table - service role only (contains passwords)
CREATE POLICY "User_service_role_all" ON "User"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- TrackingEvent table
CREATE POLICY "TrackingEvent_service_role_all" ON "TrackingEvent"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- BonusClaim table
CREATE POLICY "BonusClaim_service_role_all" ON "BonusClaim"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Payout table (Prisma version)
CREATE POLICY "Payout_service_role_all" ON "Payout"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- LibraryAccess table
CREATE POLICY "LibraryAccess_service_role_all" ON "LibraryAccess"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- DigitalBook table - allow public read for book catalog
CREATE POLICY "DigitalBook_service_role_all" ON "DigitalBook"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "DigitalBook_public_select" ON "DigitalBook"
    FOR SELECT TO anon USING ("isActive" = true);

CREATE POLICY "DigitalBook_authenticated_select" ON "DigitalBook"
    FOR SELECT TO authenticated USING ("isActive" = true);

-- ============================================
-- PART 3: FIX SECURITY DEFINER VIEWS
-- Recreate views with explicit SECURITY INVOKER
-- ============================================

-- Fix sales_by_location view
DROP VIEW IF EXISTS sales_by_location;
CREATE VIEW sales_by_location 
WITH (security_invoker = true)
AS
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

GRANT SELECT ON sales_by_location TO anon, authenticated, service_role;

-- Fix flagged_audio_segments view
DROP VIEW IF EXISTS flagged_audio_segments;
CREATE VIEW flagged_audio_segments
WITH (security_invoker = true)
AS
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

-- Fix readers_by_location view
DROP VIEW IF EXISTS readers_by_location;
CREATE VIEW readers_by_location
WITH (security_invoker = true)
AS
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

GRANT SELECT ON readers_by_location TO anon, authenticated, service_role;

-- Also fix the other views that might have been created as SECURITY DEFINER
DROP VIEW IF EXISTS partner_performance;
CREATE VIEW partner_performance
WITH (security_invoker = true)
AS
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

REVOKE ALL ON partner_performance FROM anon, authenticated;
GRANT SELECT ON partner_performance TO service_role;

DROP VIEW IF EXISTS global_analytics;
CREATE VIEW global_analytics
WITH (security_invoker = true)
AS
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

DROP VIEW IF EXISTS active_readers_summary;
CREATE VIEW active_readers_summary
WITH (security_invoker = true)
AS
SELECT 
    COUNT(*) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as active_count,
    COUNT(DISTINCT ip_address) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_ips,
    COUNT(DISTINCT user_id) FILTER (WHERE is_active = TRUE AND last_heartbeat > NOW() - INTERVAL '5 minutes') as unique_users
FROM active_reader_sessions;

REVOKE ALL ON active_readers_summary FROM anon, authenticated;
GRANT SELECT ON active_readers_summary TO service_role;

DROP VIEW IF EXISTS license_device_summary;
CREATE VIEW license_device_summary
WITH (security_invoker = true)
AS
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

DROP VIEW IF EXISTS subscribers_due_for_email;
CREATE VIEW subscribers_due_for_email
WITH (security_invoker = true)
AS
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

DROP VIEW IF EXISTS reader_support_summary;
CREATE VIEW reader_support_summary
WITH (security_invoker = true)
AS
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
-- VERIFICATION
-- After running this, rerun Security Advisor
-- Expected: 0 Errors
-- Warnings about INSERT policies are acceptable (intentional for public forms)
-- ============================================
