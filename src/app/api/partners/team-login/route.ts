import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { accessCode, email } = await req.json();

    if (!accessCode || !email) {
      return NextResponse.json({ error: 'Access code and email are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find team member by access code and email
    const { data: member, error } = await supabase
      .from('partner_team_members')
      .select('id, partner_id, name, email, role, is_active, access_code')
      .eq('access_code', accessCode.trim().toUpperCase())
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid access code or email' }, { status: 401 });
    }

    if (!member.is_active) {
      return NextResponse.json({ error: 'Your access has been deactivated. Please contact the partner.' }, { status: 403 });
    }

    // Get partner name
    const { data: partner } = await supabase
      .from('partners')
      .select('name')
      .eq('id', member.partner_id)
      .single();

    // Update last login
    await supabase
      .from('partner_team_members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', member.id);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        partnerId: member.partner_id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
      partnerName: partner?.name || 'Partner',
    });
  } catch (error) {
    console.error('Team login error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
