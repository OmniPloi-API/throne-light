import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();

    // Clean up stale sessions first (no heartbeat in 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from('active_reader_sessions')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('last_heartbeat', fiveMinutesAgo);

    // Get active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('active_reader_sessions')
      .select('*')
      .eq('is_active', true)
      .gte('last_heartbeat', fiveMinutesAgo)
      .order('last_heartbeat', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Get summary stats
    const activeCount = sessions?.length || 0;
    const uniqueIps = new Set(sessions?.map(s => s.ip_address)).size;
    const uniqueUsers = new Set(sessions?.map(s => s.user_id)).size;

    // Check for suspicious activity (multiple IPs per user or multiple users per IP)
    const ipsByUser: Record<string, Set<string>> = {};
    const usersByIp: Record<string, Set<string>> = {};

    sessions?.forEach(s => {
      if (!ipsByUser[s.user_id]) ipsByUser[s.user_id] = new Set();
      ipsByUser[s.user_id].add(s.ip_address);

      if (!usersByIp[s.ip_address]) usersByIp[s.ip_address] = new Set();
      usersByIp[s.ip_address].add(s.user_id);
    });

    const suspiciousUsers = Object.entries(ipsByUser)
      .filter(([, ips]) => ips.size > 2)
      .map(([userId, ips]) => ({ userId, ipCount: ips.size }));

    const suspiciousIps = Object.entries(usersByIp)
      .filter(([, users]) => users.size > 3)
      .map(([ip, users]) => ({ ip, userCount: users.size }));

    // Get recent activity (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentActivity } = await supabase
      .from('reader_activity_log')
      .select('*')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      summary: {
        activeCount,
        uniqueIps,
        uniqueUsers,
        suspiciousUsers,
        suspiciousIps
      },
      sessions: sessions || [],
      recentActivity: recentActivity || []
    });
  } catch (error) {
    console.error('Active readers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Block a specific IP or user
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, ip, userId, sessionId } = body;

    const supabase = getSupabaseAdmin();

    if (action === 'end_session' && sessionId) {
      await supabase
        .from('active_reader_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
      return NextResponse.json({ status: 'Session ended' });
    }

    if (action === 'end_by_ip' && ip) {
      await supabase
        .from('active_reader_sessions')
        .update({ is_active: false })
        .eq('ip_address', ip);
      return NextResponse.json({ status: `All sessions from ${ip} ended` });
    }

    if (action === 'end_by_user' && userId) {
      await supabase
        .from('active_reader_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);
      return NextResponse.json({ status: `All sessions for user ${userId} ended` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
