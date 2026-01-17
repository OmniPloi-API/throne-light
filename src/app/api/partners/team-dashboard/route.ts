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

    // Get partner's slug for tracking
    const { data: partner } = await supabase
      .from('partners')
      .select('slug')
      .eq('id', partnerId)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get click data
    const { data: clicks } = await supabase
      .from('tracking_events')
      .select('event_type')
      .eq('partner_slug', partner.slug);

    const totalClicks = clicks?.filter(c => c.event_type === 'CLICK_LINK').length || 0;
    const amazonClicks = clicks?.filter(c => c.event_type === 'CLICK_AMAZON').length || 0;
    const readerDownloads = clicks?.filter(c => c.event_type === 'READER_DOWNLOAD').length || 0;

    // Get sales count (no dollar amounts)
    const { count: salesCount } = await supabase
      .from('tracking_events')
      .select('id', { count: 'exact' })
      .eq('partner_slug', partner.slug)
      .in('event_type', ['SALE', 'CLICK_DIRECT']);

    return NextResponse.json({
      data: {
        totalClicks,
        amazonClicks,
        totalSales: salesCount || 0,
        readerDownloads,
      },
    });
  } catch (error) {
    console.error('Team dashboard error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
