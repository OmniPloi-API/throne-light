import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const memberId = searchParams.get('memberId');

    if (!partnerId || !memberId) {
      return NextResponse.json({ error: 'Partner ID and Member ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify team member exists and is active
    const { data: member } = await supabase
      .from('partner_team_members')
      .select('id, role, is_active')
      .eq('id', memberId)
      .eq('partner_id', partnerId)
      .single();

    if (!member || !member.is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get partner slug for constructing links
    const { data: partner } = await supabase
      .from('partners')
      .select('slug')
      .eq('id', partnerId)
      .single();

    // Get event data (traffic + clicks) for this partner
    const { data: events, error: eventsError } = await supabase
      .from('tracking_events')
      .select('event_type')
      .eq('partner_id', partnerId);

    if (eventsError) {
      console.error('Team dashboard events error:', eventsError);
    }

    const safeEvents = events || [];
    const totalTraffic = safeEvents.filter(e => e.event_type === 'PAGE_VIEW').length;

    const CLICK_EVENT_TYPES = new Set([
      'CLICK_AMAZON',
      'CLICK_KINDLE',
      'CLICK_BOOKBABY',
      'CLICK_DIRECT',
    ]);
    const totalClicks = safeEvents.filter(e => CLICK_EVENT_TYPES.has(e.event_type)).length;
    const amazonClicks = safeEvents.filter(e => e.event_type === 'CLICK_AMAZON').length;

    // Stripe-verified sales: orders table (COMPLETED)
    const { count: salesCount, error: salesError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('status', 'COMPLETED');

    if (salesError) {
      console.error('Team dashboard sales error:', salesError);
    }

    // Get sub-links for this team member with detailed stats
    const { data: subLinks } = await supabase
      .from('partner_sub_links')
      .select('id, code, label')
      .eq('partner_id', partnerId)
      .eq('team_member_id', memberId)
      .eq('is_active', true);

    // Calculate per-sub-link stats from tracking_events
    const subLinkStats = await Promise.all(
      (subLinks || []).map(async (link) => {
        // Get all events for this sub-link
        const { data: linkEvents } = await supabase
          .from('tracking_events')
          .select('event_type')
          .eq('sub_link_id', link.id);

        const events = linkEvents || [];
        const traffic = events.filter(e => e.event_type === 'PAGE_VIEW').length;
        const clicks = events.filter(e => CLICK_EVENT_TYPES.has(e.event_type)).length;
        const amazonClicks = events.filter(e => e.event_type === 'CLICK_AMAZON').length;

        // Get sales count for this sub-link from orders
        const { count: linkSales } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('partner_id', partnerId)
          .eq('sub_link_id', link.id)
          .eq('status', 'COMPLETED');

        return {
          id: link.id,
          code: link.code,
          label: link.label,
          traffic,
          clicks,
          amazonClicks,
          sales: linkSales || 0,
        };
      })
    );

    return NextResponse.json({
      data: {
        totalTraffic,
        totalClicks,
        amazonClicks,
        totalSales: salesCount || 0,
      },
      subLinkStats,
      partnerSlug: partner?.slug || '',
    });
  } catch (error) {
    console.error('Team dashboard error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
