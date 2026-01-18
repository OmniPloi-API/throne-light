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

    return NextResponse.json({
      data: {
        totalTraffic,
        totalClicks,
        amazonClicks,
        totalSales: salesCount || 0,
      },
    });
  } catch (error) {
    console.error('Team dashboard error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
