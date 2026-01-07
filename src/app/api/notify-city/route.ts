import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, city, type, promoterData } = body;

    if (!email || !city) {
      return NextResponse.json({ error: 'Email and city are required' }, { status: 400 });
    }

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: 'EOLLES <eolles@thronelightpublishing.com>',
      to: email,
      subject: `You're on the list for ${city}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Georgia, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Crown" width="60" height="60" style="display: block;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); border: 1px solid #c9a961; border-radius: 12px; padding: 40px;">
                      <h1 style="color: #c9a961; font-size: 28px; margin: 0 0 20px 0; text-align: center; font-weight: normal;">
                        You're On The List
                      </h1>
                      
                      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; text-align: center;">
                        When the throne touches down in <strong style="color: #c9a961;">${city}</strong>, you will be among the first to know.
                      </p>
                      
                      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; text-align: center;">
                        We do not tour. We assemble. And when the gathering is announced, those who requested it will receive priority access.
                      </p>
                      
                      <div style="border-top: 1px solid #c9a961; margin: 30px 0; opacity: 0.3;"></div>
                      
                      <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                        Until then, keep your crown polished.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 30px; text-align: center;">
                      <p style="color: #666; font-size: 12px; margin: 0;">
                        Light of EOLLES
                      </p>
                      <p style="color: #444; font-size: 11px; margin: 10px 0 0 0;">
                        © ${new Date().getFullYear()} Throne Light Publishing LLC
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // If this is a promoter submission, also notify the admin
    if (type === 'promoter' && promoterData) {
      await resend.emails.send({
        from: 'EOLLES System <system@thronelightpublishing.com>',
        to: ['developer@thronelightpublishing.com', 'info@thronelightpublishing.com'],
        subject: `New Promoter Application: ${city}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h2 style="color: #c9a961; margin-top: 0;">New Promoter Application</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>City:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${promoterData.city}, ${promoterData.state}, ${promoterData.country}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Contact Name:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${promoterData.contactName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Website:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${promoterData.website ? `<a href="${promoterData.website}">${promoterData.website}</a>` : 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Social Links:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${promoterData.socialLinks || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Concert/Event Link:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${promoterData.concertLink ? `<a href="${promoterData.concertLink}">${promoterData.concertLink}</a>` : 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Message:</strong></td>
                  <td style="padding: 10px 0;">${promoterData.message || 'N/A'}</td>
                </tr>
              </table>
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                Submitted at ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({ success: true, id: confirmationEmail.data?.id });
  } catch (error) {
    console.error('Error sending notification email:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
