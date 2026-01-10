// Resend Access Code API
// Sends the user's license code to their email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

function getSupabase() {
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Find license(s) for this email
    const { data: licenses, error } = await supabase
      .from('reader_licenses')
      .select('license_code, customer_name, is_active, is_revoked')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .eq('is_revoked', false)
      .order('created_at', { ascending: false });

    if (error || !licenses || licenses.length === 0) {
      // Don't reveal if email exists - just say we'll send if found
      return NextResponse.json({
        success: true,
        message: 'If this email has a valid license, an access code will be sent.',
      });
    }

    // Get the most recent active license
    const license = licenses[0];
    const firstName = license.customer_name?.split(' ')[0] || 'Reader';

    // Send email with the access code
    const magicLink = `https://thronelightpublishing.com/login?code=${license.license_code}`;

    await resend.emails.send({
      from: 'Throne Light Publishing <books@thronelightpublishing.com>',
      to: email.toLowerCase(),
      subject: 'Your Throne Light Reader Access Code',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" 
                   alt="Crown" 
                   width="48" 
                   style="display: block;">
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="color: #c9a961; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                THRONE LIGHT PUBLISHING
              </span>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fffbf7 0%, #fef6f0 100%); border: 1px solid rgba(201, 169, 97, 0.3); border-radius: 16px;">
                <tr>
                  <td style="padding: 40px 32px;">
                    
                    <p style="color: #c9a961; font-size: 20px; margin: 0 0 24px 0; text-align: center;">
                      Hello ${firstName},
                    </p>
                    
                    <p style="color: #3d3d3d; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0; text-align: center;">
                      Here's your access code to enter the Throne Light Reader:
                    </p>
                    
                    <!-- Access Code Box -->
                    <div style="background: linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(201, 169, 97, 0.08) 100%); border: 2px solid #c9a961; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                      <p style="color: #7a6b63; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">
                        Your Access Code
                      </p>
                      <p style="color: #c9a961; font-size: 26px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">
                        ${license.license_code}
                      </p>
                    </div>
                    
                    <!-- Magic Link Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${magicLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%); color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);">
                            📖 Open Reader Instantly
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #7a6b63; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
                      Or copy the code above and enter it manually
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px;">
              <p style="color: #666; font-size: 11px; margin: 0; text-align: center;">
                Valid for 2 devices • Keep this code safe
              </p>
              <p style="color: #555; font-size: 11px; margin: 12px 0 0 0; text-align: center;">
                Throne Light Publishing LLC
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
    });

    // Log the resend for tracking (non-critical, ignore errors)
    try {
      await supabase.from('reader_download_emails').insert({
        email: email.toLowerCase(),
        email_type: 'CODE_RESEND',
        subject: 'Your Throne Light Reader Access Code',
      });
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json({
      success: true,
      message: 'Access code sent to your email',
    });

  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
