import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  try {
    const { memberId, position } = await req.json();

    if (!memberId || !position) {
      return NextResponse.json({ error: 'Member ID and position are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('partner_team_members')
      .update({ position: position.trim() })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating position:', error);
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Position update error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
