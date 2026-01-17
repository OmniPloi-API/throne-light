import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { TEAM_MEMBER_ROLES, TeamMemberRole } from '../route';

/**
 * POST - Team member login with access code
 */
export async function POST(req: NextRequest) {
  try {
    const { accessCode } = await req.json();

    if (!accessCode) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find team member by access code
    const { data: member, error } = await supabase
      .from('partner_team_members')
      .select(`
        id,
        partner_id,
        email,
        name,
        role,
        is_active,
        partners:partner_id (
          id,
          name,
          slug,
          coupon_code
        )
      `)
      .eq('access_code', accessCode.toUpperCase())
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }

    if (!member.is_active) {
      return NextResponse.json({ error: 'This access has been deactivated' }, { status: 401 });
    }

    // Update last login
    await supabase
      .from('partner_team_members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', member.id);

    // Get role permissions
    const roleInfo = TEAM_MEMBER_ROLES[member.role as TeamMemberRole];

    // Create session token for team member
    const token = Buffer.from(`team:${member.id}:${member.partner_id}:${member.role}:${Date.now()}`).toString('base64');

    const response = NextResponse.json({
      success: true,
      teamMember: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        roleLabel: roleInfo?.label,
        permissions: {
          canViewFinancials: roleInfo?.canViewFinancials || false,
          canViewSales: roleInfo?.canViewSales || false,
          canViewClicks: roleInfo?.canViewClicks || false,
          isViewOnly: true, // Team members are always view-only
        },
      },
      partner: member.partners,
    });

    // Set session cookie
    response.cookies.set('team_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Team member login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

/**
 * GET - Verify team member session
 */
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('team_session')?.value;

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const decoded = Buffer.from(session, 'base64').toString();
    const [prefix, memberId, partnerId, role, timestamp] = decoded.split(':');

    if (prefix !== 'team') {
      return NextResponse.json({ authenticated: false });
    }

    // Check session expiry (8 hours)
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const eightHours = 8 * 60 * 60 * 1000;

    if (now - sessionTime > eightHours) {
      return NextResponse.json({ authenticated: false });
    }

    // Get role permissions
    const roleInfo = TEAM_MEMBER_ROLES[role as TeamMemberRole];

    return NextResponse.json({
      authenticated: true,
      teamMember: {
        id: memberId,
        partnerId,
        role,
        roleLabel: roleInfo?.label,
        permissions: {
          canViewFinancials: roleInfo?.canViewFinancials || false,
          canViewSales: roleInfo?.canViewSales || false,
          canViewClicks: roleInfo?.canViewClicks || false,
          isViewOnly: true,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

/**
 * DELETE - Team member logout
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('team_session');
  return response;
}
