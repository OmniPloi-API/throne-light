import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'Throne Light Publishing <noreply@thronelightpublishing.com>';

export async function sendNewsletterConfirmation(email: string, source: string) {
  try {
    const client = getResend();
    if (!client) {
      console.log('Email service not configured - skipping confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    const sourceNames: Record<string, string> = {
      'AUTHOR_MAILING_LIST': 'Light of Eolles mailing list',
      'BOOK_PRESALE': 'book pre-sale updates',
      'PUBLISHER_UPDATES': 'Throne Light Publishing updates',
      'READER_NEWSLETTER': 'Throne Light Reader newsletter',
    };
    
    const sourceName = sourceNames[source] || 'our newsletter';
    
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to the Kingdom 👑',
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
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Crown" width="64" height="64" style="display: block;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid rgba(201, 169, 97, 0.3); border-radius: 16px; padding: 40px;">
                      <h1 style="color: #c9a961; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                        Welcome, Beloved
                      </h1>
                      
                      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; text-align: center;">
                        You have been enrolled in the <strong style="color: #c9a961;">${sourceName}</strong>.
                      </p>
                      
                      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                        You did not stumble upon this. You were summoned.<br>
                        Expect divine downloads, kingdom updates, and words that awaken.
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://thronelightpublishing.com" style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%); color: #0a0a0a; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                          Enter The Light
                        </a>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid rgba(201, 169, 97, 0.2); margin: 30px 0;">
                      
                      <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        Throne Light Publishing • Where Books Bring Light
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 30px; text-align: center;">
                      <p style="color: #666; font-size: 11px; margin: 0;">
                        You're receiving this because you signed up at thronelightpublishing.com
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

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendSupportConfirmation(email: string, message: string) {
  try {
    const client = getResend();
    if (!client) {
      console.log('Email service not configured - skipping support confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'We Received Your Message 📩',
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
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Crown" width="64" height="64" style="display: block;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid rgba(201, 169, 97, 0.3); border-radius: 16px; padding: 40px;">
                      <h1 style="color: #c9a961; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                        Message Received
                      </h1>
                      
                      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; text-align: center;">
                        Thank you for reaching out. Our team has received your message and will respond within 24-48 hours.
                      </p>
                      
                      <div style="background: #0a0a0a; border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="color: #888; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                          Your Message:
                        </p>
                        <p style="color: #f5f0e6; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                          "${message.substring(0, 300)}${message.length > 300 ? '...' : ''}"
                        </p>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid rgba(201, 169, 97, 0.2); margin: 30px 0;">
                      
                      <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        Throne Light Publishing • Support Team
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 30px; text-align: center;">
                      <p style="color: #666; font-size: 11px; margin: 0;">
                        This is an automated confirmation. Please do not reply to this email.
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

    if (error) {
      console.error('Failed to send support confirmation:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}
