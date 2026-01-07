import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Email template for partner welcome
function generateWelcomeEmail(partner: {
  name: string;
  email: string;
  accessCode: string;
  slug: string;
  couponCode: string;
  commissionPercent: number;
  discountPercent: number;
}) {
  const loginUrl = `https://thronelightpublishing.com/partner/login`;
  const partnerLinkUrl = `https://thronelightpublishing.com/partners/${partner.slug}`;
  
  return {
    subject: `Welcome to the Throne Light Kingdom, ${partner.name}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Throne Light Publishing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #D4AF37; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Crown Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); padding: 40px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <img src="https://thronelightpublishing.com/images/CROWN-LOGO-500PX.png" alt="Crown" width="60" height="60" style="display: block; margin: 0 auto 15px;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: normal; letter-spacing: 2px;">
                THRONE LIGHT PUBLISHING
              </h1>
              <p style="margin: 10px 0 0; color: #a0a0a0; font-size: 14px; font-style: italic;">
                Rolling Out the Royal Carpet
              </p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #D4AF37; font-size: 24px; font-weight: normal; text-align: center;">
                Welcome, ${partner.name}!
              </h2>
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                You have been selected as a <strong style="color: #D4AF37;">Trusted Partner</strong> of Throne Light Publishing. 
                We are honored to have you join our royal constellation of ambassadors who help bring 
                <em>"The Crowded Bed & The Empty Throne"</em> to readers across the kingdom.
              </p>
              
              <!-- Access Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #D4AF37; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 5px; color: #D4AF37; font-size: 18px; font-weight: normal; text-align: center;">
                      Your Royal Credentials
                    </h3>
                    <p style="margin: 0 0 15px; color: #666; font-size: 20px; text-align: center;">&#x1F512;</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #a0a0a0; font-size: 14px;">Partner Portal:</td>
                        <td style="padding: 8px 0; color: #D4AF37; font-size: 14px;">
                          <a href="${loginUrl}" style="color: #D4AF37; text-decoration: none;">${loginUrl}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #a0a0a0; font-size: 14px;">Access Code:</td>
                        <td style="padding: 8px 0;">
                          <code style="background-color: #0a0a0a; color: #D4AF37; padding: 4px 12px; border-radius: 4px; font-size: 16px; letter-spacing: 2px;">
                            ${partner.accessCode}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #a0a0a0; font-size: 14px;">Your Coupon Code:</td>
                        <td style="padding: 8px 0;">
                          <code style="background-color: #0a0a0a; color: #4ade80; padding: 4px 12px; border-radius: 4px; font-size: 16px; letter-spacing: 2px;">
                            ${partner.couponCode}
                          </code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Benefits Section -->
              <div style="text-align: center; margin: 30px 0 15px;">
                <img src="https://thronelightpublishing.com/images/CROWN-LOGO-500PX.png" alt="Crown" width="30" height="30" style="display: inline-block; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #D4AF37; font-size: 18px; font-weight: normal;">
                  Your Partner Benefits
                </h3>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; text-align: center;">
                    &#9675; <strong>${partner.commissionPercent}% Commission</strong> on every sale through your link
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; text-align: center;">
                    &#9675; <strong>${partner.discountPercent}% Discount</strong> for your audience using code <code style="color: #4ade80;">${partner.couponCode}</code>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; text-align: center;">
                    &#9675; <strong>Real-time Analytics</strong> in your personal Partner Portal
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #e0e0e0; font-size: 14px; text-align: center;">
                    &#9675; <strong>Direct Payouts</strong> via Stripe Connect
                  </td>
                </tr>
              </table>
              
              <!-- Your Link Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #a0a0a0; font-size: 14px;">Share this link with your audience:</p>
                    <a href="${partnerLinkUrl}" style="display: inline-block; background-color: #D4AF37; color: #0a0a0a; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                      ${partnerLinkUrl}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- How to Access -->
              <h3 style="margin: 30px 0 15px; color: #D4AF37; font-size: 18px; font-weight: normal; text-align: center;">
                How to Access Your Partner Portal
              </h3>
              <ol style="margin: 0; padding-left: 20px; color: #e0e0e0; font-size: 14px; line-height: 1.8;">
                <li>Visit <a href="${loginUrl}" style="color: #D4AF37;">${loginUrl}</a></li>
                <li>Enter your Access Code: <code style="color: #D4AF37;">${partner.accessCode}</code></li>
                <li>View your earnings, clicks, and sales in real-time</li>
                <li>Connect your Stripe account to receive payouts</li>
                <li>Invite team members to view your dashboard</li>
              </ol>
              
              <!-- Support -->
              <p style="margin: 30px 0 0; color: #a0a0a0; font-size: 14px; line-height: 1.6; text-align: center;">
                Questions? Simply reply to this email and our team will assist you promptly.
              </p>
              <p style="margin: 15px 0 0; color: #a0a0a0; font-size: 14px; line-height: 1.6; text-align: center;">
                May your reign be prosperous!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 25px; text-align: center; border-top: 1px solid #333;">
              <img src="https://thronelightpublishing.com/images/THRONELIGHT-LOGO.png" alt="Throne Light Publishing" width="120" style="display: block; margin: 0 auto 15px;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © ${new Date().getFullYear()} Throne Light Publishing
                <br>
                <a href="https://thronelightpublishing.com" style="color: #D4AF37; text-decoration: none;">thronelightpublishing.com</a>
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
    text: `
Welcome to Throne Light Publishing, ${partner.name}!

You have been selected as a Trusted Partner of Throne Light Publishing.

YOUR CREDENTIALS:
- Partner Portal: ${loginUrl}
- Access Code: ${partner.accessCode}
- Your Coupon Code: ${partner.couponCode}

YOUR BENEFITS:
- ${partner.commissionPercent}% Commission on every sale
- ${partner.discountPercent}% Discount for your audience
- Real-time Analytics in your Partner Portal
- Direct Payouts via Stripe Connect

Share this link with your audience: ${partnerLinkUrl}

Questions? Reply to this email and our team will assist you.

May your reign be prosperous!
Throne Light Publishing
    `
  };
}

export async function POST(request: NextRequest) {
  try {
    const { partnerId, instant } = await request.json();
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Get partner details
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single();
    
    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    // Check if already sent
    if (partner.onboarding_email_sent_at) {
      return NextResponse.json({ 
        error: 'Welcome email already sent',
        sentAt: partner.onboarding_email_sent_at 
      }, { status: 400 });
    }
    
    // Generate email content
    const email = generateWelcomeEmail({
      name: partner.name,
      email: partner.email,
      accessCode: partner.access_code,
      slug: partner.slug,
      couponCode: partner.coupon_code,
      commissionPercent: partner.commission_percent,
      discountPercent: partner.discount_percent,
    });
    
    // Send email via Resend (or your email provider)
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
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Email send error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: errorData 
      }, { status: 500 });
    }
    
    // Update partner record
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        onboarding_email_sent_at: new Date().toISOString(),
        onboarding_cancelled: false,
      })
      .eq('id', partnerId);
    
    if (updateError) {
      console.error('Error updating partner:', updateError);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Welcome email sent successfully',
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Schedule email for later (5 minute countdown)
export async function PUT(request: NextRequest) {
  try {
    const { partnerId, action } = await request.json();
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    if (action === 'schedule') {
      // Schedule for 5 minutes from now
      const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('partners')
        .update({
          onboarding_scheduled_at: scheduledAt,
          onboarding_cancelled: false,
        })
        .eq('id', partnerId);
      
      if (error) {
        return NextResponse.json({ error: 'Failed to schedule' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        scheduledAt,
        message: 'Email scheduled for deployment'
      });
      
    } else if (action === 'cancel') {
      // Cancel the scheduled email
      const { error } = await supabase
        .from('partners')
        .update({
          onboarding_scheduled_at: null,
          onboarding_cancelled: true,
        })
        .eq('id', partnerId);
      
      if (error) {
        return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Email deployment cancelled'
      });
      
    } else if (action === 'reset') {
      // Reset to schedule a new countdown
      const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('partners')
        .update({
          onboarding_scheduled_at: scheduledAt,
          onboarding_cancelled: false,
        })
        .eq('id', partnerId);
      
      if (error) {
        return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        scheduledAt,
        message: 'Email countdown reset'
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error managing email schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
