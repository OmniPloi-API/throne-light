import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * SUPER ADMIN OVERSIGHT API
 * Real-time visibility into all partners, sub-admins, and team members
 * Super admin can revoke ANY access from this panel
 */

// GET - Get complete oversight data (super admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch all data in parallel
    const [
      { data: partners },
      { data: adminUsers },
      { data: teamMembers },
      { data: activityLogs },
    ] = await Promise.all([
      // Partners with their activity status
      supabase
        .from('partners')
        .select('id, name, email, slug, is_active, last_login, created_at, coupon_code')
        .order('last_login', { ascending: false, nullsFirst: false }),
      
      // Sub-admin users
      supabase
        .from('admin_users')
        .select('id, name, email, role, is_active, last_login, created_at, created_by')
        .order('last_login', { ascending: false, nullsFirst: false }),
      
      // Team members across all partners
      supabase
        .from('partner_team_members')
        .select(`
          id, name, email, role, is_active, last_login, created_at,
          partner_id,
          partners:partner_id (name, slug)
        `)
        .order('last_login', { ascending: false, nullsFirst: false }),
      
      // Recent activity logs (last 24 hours)
      supabase
        .from('user_activity_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    // Calculate online status (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const formattedPartners = (partners || []).map(p => ({
      ...p,
      type: 'partner',
      isOnline: p.last_login && p.last_login > fiveMinutesAgo,
    }));

    const formattedAdmins = (adminUsers || []).map(a => ({
      ...a,
      type: 'admin',
      isOnline: a.last_login && a.last_login > fiveMinutesAgo,
    }));

    const formattedTeamMembers = (teamMembers || []).map(t => {
      const partnerData = t.partners as unknown as { name: string; slug: string } | null;
      return {
        ...t,
        type: 'team_member',
        partnerName: partnerData?.name,
        partnerSlug: partnerData?.slug,
        isOnline: t.last_login && t.last_login > fiveMinutesAgo,
      };
    });

    // Combine and sort by online status and last activity
    const allUsers = [
      ...formattedPartners,
      ...formattedAdmins,
      ...formattedTeamMembers,
    ].sort((a, b) => {
      // Online users first
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      // Then by last login
      const aTime = a.last_login ? new Date(a.last_login).getTime() : 0;
      const bTime = b.last_login ? new Date(b.last_login).getTime() : 0;
      return bTime - aTime;
    });

    // Summary stats
    const stats = {
      totalPartners: formattedPartners.length,
      activePartners: formattedPartners.filter(p => p.is_active).length,
      onlinePartners: formattedPartners.filter(p => p.isOnline).length,
      
      totalAdmins: formattedAdmins.length,
      activeAdmins: formattedAdmins.filter(a => a.is_active).length,
      onlineAdmins: formattedAdmins.filter(a => a.isOnline).length,
      
      totalTeamMembers: formattedTeamMembers.length,
      activeTeamMembers: formattedTeamMembers.filter(t => t.is_active).length,
      onlineTeamMembers: formattedTeamMembers.filter(t => t.isOnline).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      users: allUsers,
      partners: formattedPartners,
      admins: formattedAdmins,
      teamMembers: formattedTeamMembers,
      recentActivity: activityLogs || [],
    });
  } catch (error) {
    console.error('Oversight API error:', error);
    return NextResponse.json({ error: 'Failed to fetch oversight data' }, { status: 500 });
  }
}

/**
 * POST - Revoke access (super admin veto power)
 * Can revoke access for partners, admins, or team members
 */
export async function POST(req: NextRequest) {
  try {
    const { targetType, targetId, action, reason } = await req.json();

    if (!targetType || !targetId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let result;

    switch (targetType) {
      case 'partner':
        if (action === 'revoke') {
          result = await supabase
            .from('partners')
            .update({ 
              is_active: false, 
              deactivated_at: new Date().toISOString(),
              deactivation_reason: reason || 'Revoked by super admin',
            })
            .eq('id', targetId);
        } else if (action === 'restore') {
          result = await supabase
            .from('partners')
            .update({ 
              is_active: true, 
              deactivated_at: null,
              deactivation_reason: null,
            })
            .eq('id', targetId);
        }
        break;

      case 'admin':
        if (action === 'revoke') {
          result = await supabase
            .from('admin_users')
            .update({ is_active: false })
            .eq('id', targetId)
            .neq('role', 'super_admin'); // Cannot revoke super admin
        } else if (action === 'restore') {
          result = await supabase
            .from('admin_users')
            .update({ is_active: true })
            .eq('id', targetId);
        }
        break;

      case 'team_member':
        if (action === 'revoke') {
          result = await supabase
            .from('partner_team_members')
            .update({ 
              is_active: false,
              revoked_at: new Date().toISOString(),
              revoked_by: 'super_admin',
            })
            .eq('id', targetId);
        } else if (action === 'restore') {
          result = await supabase
            .from('partner_team_members')
            .update({ 
              is_active: true,
              revoked_at: null,
              revoked_by: null,
            })
            .eq('id', targetId);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (result?.error) {
      console.error('Revoke error:', result.error);
      return NextResponse.json({ error: 'Failed to update access' }, { status: 500 });
    }

    // Log the action
    await supabase.from('user_activity_logs').insert({
      user_type: 'super_admin',
      user_id: 'super_admin',
      action: action === 'revoke' ? 'ACCESS_REVOKED' : 'ACCESS_RESTORED',
      target_type: targetType,
      target_id: targetId,
      reason,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: action === 'revoke' ? 'Access revoked successfully' : 'Access restored successfully',
    });
  } catch (error) {
    console.error('Revoke API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
