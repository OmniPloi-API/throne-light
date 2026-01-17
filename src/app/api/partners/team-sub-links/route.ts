import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET - Get sub-links for a team member
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: links, error } = await supabase
      .from('team_member_sub_links')
      .select('*')
      .eq('team_member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sub-links:', error);
      return NextResponse.json({ links: [] });
    }

    return NextResponse.json({ links: links || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ links: [] });
  }
}

/**
 * POST - Create a new sub-link for a team member
 */
export async function POST(req: NextRequest) {
  try {
    const { memberId, partnerId, name } = await req.json();

    if (!memberId || !partnerId || !name) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify team member
    const { data: member } = await supabase
      .from('partner_team_members')
      .select('id, is_active')
      .eq('id', memberId)
      .eq('partner_id', partnerId)
      .single();

    if (!member || !member.is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get partner slug
    const { data: partner } = await supabase
      .from('partners')
      .select('slug')
      .eq('id', partnerId)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Generate unique sub-link code
    const subCode = generateSubCode();
    const url = `https://thecrowdedbedandtheemptythrone.com/book?ref=${partner.slug}&sub=${subCode}`;

    const { data: link, error } = await supabase
      .from('team_member_sub_links')
      .insert({
        id: uuidv4(),
        team_member_id: memberId,
        partner_id: partnerId,
        name,
        sub_code: subCode,
        url,
        clicks: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sub-link:', error);
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

function generateSubCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
