import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Team member permission levels
export const TEAM_MEMBER_ROLES = {
  view_all: {
    label: 'Full View Access',
    description: 'Can view all data including financial information',
    canViewFinancials: true,
    canViewSales: true,
    canViewClicks: true,
  },
  view_no_financials: {
    label: 'View Without Financials',
    description: 'Can view sales and click data, but not earnings or withdrawal info',
    canViewFinancials: false,
    canViewSales: true,
    canViewClicks: true,
  },
  view_clicks_only: {
    label: 'Clicks & Traffic Only',
    description: 'Can only view click and traffic data',
    canViewFinancials: false,
    canViewSales: false,
    canViewClicks: true,
  },
};

export type TeamMemberRole = keyof typeof TEAM_MEMBER_ROLES;

interface TeamMember {
  id: string;
  partner_id: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  access_code: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

// Generate a simple access code for team members
function generateTeamAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TM-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * GET - List team members for a partner
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    const { data: members, error } = await supabase
      .from('partner_team_members')
      .select('id, email, name, role, is_active, created_at, last_login')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json({ members: [] });
    }

    return NextResponse.json({ 
      members: members || [],
      roles: TEAM_MEMBER_ROLES,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ members: [] });
  }
}

/**
 * POST - Add a new team member
 */
export async function POST(req: NextRequest) {
  try {
    const { partnerId, email, name, role } = await req.json();

    if (!partnerId || !email || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!TEAM_MEMBER_ROLES[role as TeamMemberRole]) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify partner exists
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check if email already exists for this partner
    const { data: existing } = await supabase
      .from('partner_team_members')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Team member with this email already exists' }, { status: 400 });
    }

    const id = uuidv4();
    const accessCode = generateTeamAccessCode();

    const { data: member, error } = await supabase
      .from('partner_team_members')
      .insert({
        id,
        partner_id: partnerId,
        email: email.toLowerCase(),
        name,
        role,
        access_code: accessCode,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
    }

    // Send invitation email
    await sendTeamMemberInvite(email, name, partner.name, accessCode, role as TeamMemberRole);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        accessCode: member.access_code,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

/**
 * PATCH - Update team member
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, partnerId, name, role, isActive } = await req.json();

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Member ID and Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Build update object
    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (role && TEAM_MEMBER_ROLES[role as TeamMemberRole]) updates.role = role;
    if (typeof isActive === 'boolean') updates.is_active = isActive;

    const { data, error } = await supabase
      .from('partner_team_members')
      .update(updates)
      .eq('id', id)
      .eq('partner_id', partnerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

/**
 * DELETE - Remove team member
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Member ID and Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('partner_team_members')
      .delete()
      .eq('id', id)
      .eq('partner_id', partnerId);

    if (error) {
      console.error('Error deleting team member:', error);
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}

/**
 * Send invitation email to team member
 */
async function sendTeamMemberInvite(
  email: string,
  name: string,
  partnerName: string,
  accessCode: string,
  role: TeamMemberRole
): Promise<void> {
  try {
    const roleInfo = TEAM_MEMBER_ROLES[role];
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Publishing <partners@thronelightpublishing.com>',
        to: email,
        subject: `You've been invited to view ${partnerName}'s Partner Dashboard`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; color: #c9a961; font-size: 24px;">Team Dashboard Access</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Throne Light Publishing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Hi ${name},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                <strong style="color: #c9a961;">${partnerName}</strong> has invited you to view their Partner Dashboard at Throne Light Publishing.
              </p>
              
              <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                  Your Access Level
                </p>
                <p style="margin: 0; color: #c9a961; font-size: 18px; font-weight: bold;">
                  ${roleInfo.label}
                </p>
                <p style="margin: 8px 0 0; color: #888; font-size: 14px;">
                  ${roleInfo.description}
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #222 100%); border: 2px solid #c9a961; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                  Your Access Code
                </p>
                <p style="margin: 0; color: #c9a961; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 3px;">
                  ${accessCode}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://thronelightpublishing.com/partner/team-login" 
                   style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #b8944a 100%); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Access Dashboard →
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #333;">
                This is a view-only access code. You cannot make changes or request withdrawals.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #222;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © ${new Date().getFullYear()} Throne Light Publishing. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send team member invite email');
    }
  } catch (error) {
    console.error('Error sending team invite:', error);
  }
}
