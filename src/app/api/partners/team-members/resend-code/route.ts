import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { TEAM_MEMBER_ROLES, type TeamMemberRole } from '@/lib/team-member-roles';

function generateTeamAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TM-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { memberId, partnerId } = await req.json();

    if (!memberId || !partnerId) {
      return NextResponse.json({ error: 'Member ID and Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get member info
    const { data: member, error: memberError } = await supabase
      .from('partner_team_members')
      .select('id, email, name, role, partner_id')
      .eq('id', memberId)
      .eq('partner_id', partnerId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Get partner name
    const { data: partner } = await supabase
      .from('partners')
      .select('name')
      .eq('id', partnerId)
      .single();

    // Generate new access code
    const newAccessCode = generateTeamAccessCode();

    // Update member with new code
    await supabase
      .from('partner_team_members')
      .update({ access_code: newAccessCode })
      .eq('id', memberId);

    // Send email with new code
    const roleInfo = TEAM_MEMBER_ROLES[member.role as TeamMemberRole];
    const accessDescription = roleInfo?.canViewSales 
      ? 'Your access level allows you to view sales and clicks.'
      : 'Your access level allows you to view clicks and traffic data.';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Publishing <partners@thronelightpublishing.com>',
        to: member.email,
        subject: 'Your New Access Code - Throne Light Publishing',
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
              <h1 style="margin: 0; color: #c9a961; font-size: 24px;">Throne Light Publishing</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">New Access Code</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Hi ${member.name},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                <strong style="color: #c9a961;">${partner?.name || 'Your partner'}</strong> has issued you a new access code for the Team Dashboard.
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                ${accessDescription}
              </p>
              
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #222 100%); border: 2px solid #c9a961; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                  Your New Access Code
                </p>
                <p style="margin: 0; color: #c9a961; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 3px;">
                  ${newAccessCode}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://thronelightpublishing.com/partner/team-login" 
                   style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #b8944a 100%); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Access Dashboard →
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #333;">
                This is a view-only access code.
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resending code:', error);
    return NextResponse.json({ error: 'Failed to resend code' }, { status: 500 });
  }
}
