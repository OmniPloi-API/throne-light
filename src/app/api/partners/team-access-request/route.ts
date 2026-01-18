import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST - Submit an access request from a team member
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, partnerName, message } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if this email is already a team member
    const { data: existingMember } = await supabase
      .from('partner_team_members')
      .select('id, partner_id, is_active, auto_approve')
      .eq('email', email.toLowerCase())
      .single();

    if (existingMember) {
      // Existing team member - check if auto-approve is enabled
      if (existingMember.auto_approve && existingMember.is_active) {
        // Auto-approve: Generate new access code and send it
        const newAccessCode = generateAccessCode();
        
        await supabase
          .from('partner_team_members')
          .update({ access_code: newAccessCode })
          .eq('id', existingMember.id);

        // Get partner info
        const { data: partner } = await supabase
          .from('partners')
          .select('name, email')
          .eq('id', existingMember.partner_id)
          .single();

        // Get member info
        const { data: member } = await supabase
          .from('partner_team_members')
          .select('name, role')
          .eq('id', existingMember.id)
          .single();

        // Send new access code email
        await sendNewAccessCodeEmail(email, member?.name || name, newAccessCode);

        return NextResponse.json({
          success: true,
          autoApproved: true,
          message: 'A new access code has been sent to your email.',
        });
      }

      // Not auto-approved - create a pending request
      await createAccessRequest(supabase, existingMember.partner_id, email, name, message, existingMember.id);

      return NextResponse.json({
        success: true,
        autoApproved: false,
        message: 'Your request has been sent to the partner for approval.',
      });
    }

    // New team member - try to find partner by name if provided
    let matchedPartnerId: string | null = null;
    
    if (partnerName) {
      const { data: matchedPartner } = await supabase
        .from('partners')
        .select('id, name, email')
        .ilike('name', `%${partnerName}%`)
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (matchedPartner) {
        matchedPartnerId = matchedPartner.id;
        
        // Send notification to the matched partner
        if (matchedPartner.email) {
          await sendPartnerNotificationEmail(
            matchedPartner.email, 
            matchedPartner.name, 
            name, 
            email
          );
        }
      }
    }

    const { error: requestError } = await supabase
      .from('team_access_requests')
      .insert({
        id: uuidv4(),
        partner_id: matchedPartnerId,
        partner_name_provided: partnerName || null,
        email: email.toLowerCase(),
        name,
        message: message || null,
        status: 'pending',
        is_new_member: true,
        created_at: new Date().toISOString(),
      });

    if (requestError) {
      console.error('Error creating access request:', requestError);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      autoApproved: false,
      message: matchedPartnerId 
        ? 'Your request has been sent to the partner for approval.'
        : 'Your request has been submitted. We will review and contact you soon.',
    });
  } catch (error) {
    console.error('Access request error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

/**
 * GET - Get pending access requests for a partner
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: requests, error } = await supabase
      .from('team_access_requests')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json({ requests: [] });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ requests: [] });
  }
}

/**
 * PATCH - Approve or deny an access request
 */
export async function PATCH(req: NextRequest) {
  try {
    const { requestId, partnerId, action, role } = await req.json();

    if (!requestId || !partnerId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (action === 'approve') {
      // Get the request
      const { data: request } = await supabase
        .from('team_access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      if (request.existing_member_id) {
        // Existing member - just send new access code
        const newAccessCode = generateAccessCode();
        
        await supabase
          .from('partner_team_members')
          .update({ access_code: newAccessCode, is_active: true })
          .eq('id', request.existing_member_id);

        await sendNewAccessCodeEmail(request.email, request.name, newAccessCode);
      } else {
        // New member - create team member entry
        const newAccessCode = generateAccessCode();
        
        await supabase
          .from('partner_team_members')
          .insert({
            id: uuidv4(),
            partner_id: partnerId,
            email: request.email,
            name: request.name,
            role: role || 'view_clicks_only',
            access_code: newAccessCode,
            is_active: true,
            auto_approve: false,
            created_at: new Date().toISOString(),
          });

        await sendNewAccessCodeEmail(request.email, request.name, newAccessCode);
      }

      // Update request status
      await supabase
        .from('team_access_requests')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', requestId);

    } else if (action === 'deny') {
      await supabase
        .from('team_access_requests')
        .update({ status: 'denied', resolved_at: new Date().toISOString() })
        .eq('id', requestId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TM-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createAccessRequest(
  supabase: any,
  partnerId: string,
  email: string,
  name: string,
  message: string | null,
  existingMemberId: string
) {
  // Check for existing pending request
  const { data: existing } = await supabase
    .from('team_access_requests')
    .select('id')
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .single();

  if (existing) {
    return; // Already has a pending request
  }

  await supabase.from('team_access_requests').insert({
    id: uuidv4(),
    partner_id: partnerId,
    email: email.toLowerCase(),
    name,
    message: message || null,
    existing_member_id: existingMemberId,
    status: 'pending',
    is_new_member: false,
    created_at: new Date().toISOString(),
  });

  // Send notification email to partner
  const { data: partner } = await supabase
    .from('partners')
    .select('email, name')
    .eq('id', partnerId)
    .single();

  if (partner?.email) {
    await sendPartnerNotificationEmail(partner.email, partner.name, name, email);
  }
}

async function sendNewAccessCodeEmail(email: string, name: string, accessCode: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Publishing <partners@thronelightpublishing.com>',
        to: email,
        subject: 'Your New Access Code - Throne Light Publishing',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; color: #c9a961; font-size: 24px;">New Access Code</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Throne Light Publishing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Hi ${name},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Your access request has been approved. Here's your new access code:
              </p>
              
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
  } catch (error) {
    console.error('Error sending access code email:', error);
  }
}

async function sendPartnerNotificationEmail(partnerEmail: string, partnerName: string, memberName: string, memberEmail: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Publishing <partners@thronelightpublishing.com>',
        to: partnerEmail,
        subject: 'Team Member Access Request - Action Required',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; color: #c9a961; font-size: 24px;">Team Access Request</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Action Required</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Hi ${partnerName},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                A team member has requested access to your partner dashboard:
              </p>
              
              <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Name: <strong style="color: #fff;">${memberName}</strong></p>
                <p style="margin: 0; color: #888; font-size: 14px;">Email: <strong style="color: #fff;">${memberEmail}</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://thronelightpublishing.com/partner/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #b8944a 100%); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Review in Dashboard →
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #333;">
                Log in to your partner portal to approve or deny this request.
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
  } catch (error) {
    console.error('Error sending partner notification:', error);
  }
}
