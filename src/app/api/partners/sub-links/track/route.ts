import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * SUB-LINK TRACKING API
 * Tracks clicks and attributes them to specific sub-links
 * Called when someone visits /partners/[slug]/[sub-link-code]
 */

export async function POST(req: NextRequest) {
  try {
    const { partnerSlug, subLinkCode, ipAddress, userAgent, country, city, device } = await req.json();

    if (!partnerSlug || !subLinkCode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find the partner by slug
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, is_active')
      .eq('slug', partnerSlug)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (!partner.is_active) {
      return NextResponse.json({ error: 'Partner is inactive' }, { status: 403 });
    }

    // Find the sub-link
    const { data: subLink, error: subLinkError } = await supabase
      .from('partner_sub_links')
      .select('id, team_member_id, is_active')
      .eq('partner_id', partner.id)
      .eq('code', subLinkCode.toLowerCase())
      .single();

    if (subLinkError || !subLink) {
      // Sub-link not found - still track as main partner click
      return NextResponse.json({ 
        success: true, 
        partnerId: partner.id,
        subLinkId: null,
        message: 'Tracked as main partner click' 
      });
    }

    if (!subLink.is_active) {
      // Sub-link inactive - track as main partner click
      return NextResponse.json({ 
        success: true, 
        partnerId: partner.id,
        subLinkId: null,
        message: 'Sub-link inactive, tracked as main partner click' 
      });
    }

    // Increment click count on sub-link
    await supabase.rpc('increment_sub_link_clicks', { sub_link_id: subLink.id });

    // Create tracking event with sub-link attribution
    const { error: eventError } = await supabase
      .from('tracking_events')
      .insert({
        id: crypto.randomUUID(),
        partner_id: partner.id,
        sub_link_id: subLink.id,
        team_member_id: subLink.team_member_id,
        event_type: 'PAGE_VIEW',
        ip_address: ipAddress,
        user_agent: userAgent,
        country,
        city,
        device,
        page_path: `/partners/${partnerSlug}/${subLinkCode}`,
        created_at: new Date().toISOString(),
      });

    if (eventError) {
      console.error('Error creating tracking event:', eventError);
    }

    return NextResponse.json({
      success: true,
      partnerId: partner.id,
      subLinkId: subLink.id,
      teamMemberId: subLink.team_member_id,
    });
  } catch (error) {
    console.error('Sub-link tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}

/**
 * GET - Get sub-link stats
 * PERMISSION ENFORCEMENT:
 * - Team members see: clicks, Amazon clicks, direct sales COUNT (no dollar amounts)
 * - Partners see: everything including revenue
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const teamMemberId = searchParams.get('teamMemberId');
    const isTeamMemberView = searchParams.get('isTeamMember') === 'true';

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get all sub-links with their stats
    let query = supabase
      .from('partner_sub_links')
      .select(`
        id,
        code,
        label,
        team_member_id,
        click_count,
        sale_count,
        amazon_click_count,
        direct_sale_count,
        revenue_generated,
        is_active,
        created_at,
        partner_team_members:team_member_id (name, email)
      `)
      .eq('partner_id', partnerId);

    // Team members only see their own links
    if (teamMemberId) {
      query = query.eq('team_member_id', teamMemberId);
    }

    const { data: subLinks, error } = await query.order('click_count', { ascending: false });

    if (error) {
      console.error('Error fetching sub-link stats:', error);
      return NextResponse.json({ stats: [] });
    }

    // Get partner slug for URLs
    const { data: partner } = await supabase
      .from('partners')
      .select('slug')
      .eq('id', partnerId)
      .single();

    const stats = (subLinks || []).map(link => {
      const memberData = link.partner_team_members as unknown as { name: string; email: string } | null;
      
      // Base stats - what TEAM MEMBERS can see (no financials)
      const baseStats = {
        id: link.id,
        code: link.code,
        label: link.label,
        createdBy: memberData?.name || 'Partner (Main)',
        isActive: link.is_active,
        // Non-financial metrics - team members CAN see these
        clicks: link.click_count || 0,
        amazonClicks: link.amazon_click_count || 0,
        directSales: link.direct_sale_count || 0,
        sales: link.sale_count || 0,
        conversionRate: link.click_count > 0 
          ? ((link.sale_count || 0) / link.click_count * 100).toFixed(1) + '%'
          : '0%',
        fullUrl: partner?.slug 
          ? `https://thronelightpublishing.com/partners/${partner.slug}/${link.code}`
          : null,
      };

      // TEAM MEMBERS: No financial data ever
      if (isTeamMemberView || teamMemberId) {
        return baseStats;
      }

      // PARTNERS: Full stats including revenue
      return {
        ...baseStats,
        revenue: link.revenue_generated || 0,
      };
    });

    // Calculate totals (exclude revenue for team members)
    const totals: Record<string, number> = {
      totalClicks: stats.reduce((sum, s) => sum + s.clicks, 0),
      totalAmazonClicks: stats.reduce((sum, s) => sum + (s.amazonClicks || 0), 0),
      totalDirectSales: stats.reduce((sum, s) => sum + (s.directSales || 0), 0),
      totalSales: stats.reduce((sum, s) => sum + s.sales, 0),
    };

    // Only include revenue for partners
    if (!isTeamMemberView && !teamMemberId) {
      totals.totalRevenue = stats.reduce((sum, s) => sum + ((s as any).revenue || 0), 0);
    }

    return NextResponse.json({ stats, totals });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ stats: [], totals: {} });
  }
}
