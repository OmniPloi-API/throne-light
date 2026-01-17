import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

function generateAccessCodeEmail(partnerName: string, accessCode: string): { subject: string; html: string; text: string } {
  const subject = 'Your Partner Portal Access Code - Throne Light Publishing';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Georgia', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #111 0%, #1a1a1a 100%); border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <h1 style="margin: 0; color: #c9a961; font-size: 28px; font-weight: 600; font-style: italic; letter-spacing: 1px;">
                Partner Portal
              </h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">
                Throne Light Publishing
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #e8e8e8; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Dear ${partnerName},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                You requested your Partner Portal access code. Here it is:
              </p>
              
              <!-- Access Code Box -->
              <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                  Access Code
                </p>
                <p style="margin: 0; color: #e8e8e8; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 6px;">
                  ${accessCode}
                </p>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Enter your unique partner access code
              </p>
              
              <!-- Login Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://thronelightpublishing.com/partner/login" 
                   style="display: inline-block; background: #c9a961; color: #0a0a0a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  →  Access Dashboard  →
                </a>
              </div>
              
              <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                If you did not request this email, please ignore it. Your access code remains secure.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; color: #555; font-size: 12px;">
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
  `.trim();

  const text = `
Partner Portal Access Code - Throne Light Publishing

Dear ${partnerName},

You requested your Partner Portal access code. Here it is:

ACCESS CODE: ${accessCode}

Use this code to log in to your Partner Dashboard at:
https://thronelightpublishing.com/partner/login

If you did not request this email, please ignore it.

© ${new Date().getFullYear()} Throne Light Publishing
  `.trim();

  return { subject, html, text };
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Find partner by email (case-insensitive)
    const { data: partner, error } = await supabase
      .from('partners')
      .select('id, name, email, access_code, coupon_code')
      .ilike('email', email.toLowerCase())
      .single();
    
    if (error || !partner) {
      // For security, don't reveal if the email exists
      // Just return success anyway
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive your access code.'
      });
    }
    
    // Get the access code (could be access_code or coupon_code)
    const accessCode = partner.access_code || partner.coupon_code;
    
    if (!accessCode) {
      console.error(`Partner ${partner.id} has no access code`);
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive your access code.'
      });
    }
    
    // Generate email content
    const emailContent = generateAccessCodeEmail(partner.name, accessCode);
    
    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Publishing <partners@thronelightpublishing.com>',
        to: partner.email,
        reply_to: ['partners@thronelightpublishing.com'],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Email send error:', errorData);
      // Still return success for security (don't reveal if email exists)
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive your access code.'
      });
    }
    
    console.log(`Access code email sent to ${partner.email}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Access code sent to your email'
    });
    
  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
