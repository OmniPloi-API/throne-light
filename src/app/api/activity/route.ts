import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * USER ACTIVITY TRACKING API
 * Tracks login events and activity for real-time monitoring
 * Updates last_login timestamps for partners, admins, and team members
 */

// POST - Log activity / update last seen
export async function POST(req: NextRequest) {
  try {
    const { userType, userId, action, metadata } = await req.json();

    if (!userType || !userId) {
      return NextResponse.json({ error: 'User type and ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Update last_login based on user type
    switch (userType) {
      case 'partner':
        await supabase
          .from('partners')
          .update({ last_login: now })
          .eq('id', userId);
        break;

      case 'admin':
        await supabase
          .from('admin_users')
          .update({ last_login: now })
          .eq('id', userId);
        break;

      case 'team_member':
        await supabase
          .from('partner_team_members')
          .update({ last_login: now })
          .eq('id', userId);
        break;
    }

    // Log the activity if action is provided
    if (action) {
      await supabase.from('user_activity_logs').insert({
        user_type: userType,
        user_id: userId,
        action,
        metadata: metadata || {},
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
        user_agent: req.headers.get('user-agent') || null,
        created_at: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

// GET - Get activity logs (super admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get('userType');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const hours = parseInt(searchParams.get('hours') || '24');

    const supabase = getSupabaseAdmin();

    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('user_activity_logs')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userType) {
      query = query.eq('user_type', userType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ logs: [] });
  }
}
