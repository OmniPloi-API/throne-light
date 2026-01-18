import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; code: string } }
) {
  const { slug, code } = params;

  try {
    const supabase = getSupabaseAdmin();

    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, slug, is_active')
      .eq('slug', slug)
      .single();

    if (partnerError || !partner || !partner.is_active) {
      return NextResponse.redirect(new URL(`/partners/${slug}`, req.url));
    }

    const { data: subLink } = await supabase
      .from('partner_sub_links')
      .select('id, team_member_id, is_active')
      .eq('partner_id', partner.id)
      .eq('code', code.toLowerCase())
      .single();

    // Always redirect to the main partner promo page
    const redirectUrl = new URL(`/partners/${slug}`, req.url);
    const res = NextResponse.redirect(redirectUrl);

    // If a valid, active sub-link exists, track and set attribution cookies
    if (subLink && subLink.is_active) {
      // Increment click count on sub-link (non-blocking)
      try {
        await supabase.rpc('increment_sub_link_clicks', { sub_link_id: subLink.id });
      } catch {
        // ignore
      }

      // Basic request metadata
      const userAgent = req.headers.get('user-agent') || undefined;
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || undefined);

      // Track the visit as a PAGE_VIEW attributed to sub-link
      try {
        await supabase.from('tracking_events').insert({
          id: randomUUID(),
          partner_id: partner.id,
          sub_link_id: subLink.id,
          team_member_id: subLink.team_member_id,
          event_type: 'PAGE_VIEW',
          ip_address: ipAddress,
          user_agent: userAgent,
          page_path: `/partners/${slug}/${code}`,
          created_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }

      // Persist sub-link attribution so subsequent clicks/sales are tracked to the team member
      // Keep aligned with partner cookie lifetime (30 days)
      const maxAge = 60 * 60 * 24 * 30;
      res.cookies.set('sub_link_id', subLink.id, { path: '/', maxAge });
      if (subLink.team_member_id) {
        res.cookies.set('team_member_id', subLink.team_member_id, { path: '/', maxAge });
      }
    }

    return res;
  } catch (error) {
    console.error('Sub-link redirect error:', error);
    return NextResponse.redirect(new URL(`/partners/${slug}`, req.url));
  }
}
