// Light of EOLLES Email Template
// Beautiful, professional HTML email template matching the author's aesthetic
// Personal enlightening messages from EOLLES

import { EollesLetter } from '../email-content/light-of-eolles';

interface TemplateOptions {
  letter: EollesLetter;
  recipientEmail: string;
  firstName?: string;
  hasPurchased: boolean;
  unsubscribeUrl: string;
}

export function generateLightOfEollesEmail(options: TemplateOptions): string {
  const { letter, recipientEmail, firstName, hasPurchased, unsubscribeUrl } = options;
  
  // Personalize greeting if we have a first name
  const greeting = firstName 
    ? letter.greeting.replace('Beloved', `Beloved ${firstName}`)
    : letter.greeting;
  
  // Format body paragraphs
  const bodyHtml = letter.body
    .map(paragraph => `
      <p style="color: #f5f0e6; font-size: 16px; line-height: 1.9; margin: 0 0 24px 0; font-family: Georgia, 'Times New Roman', serif;">
        ${paragraph}
      </p>
    `)
    .join('');
  
  // Non-purchaser CTA section
  const readerCta = !hasPurchased ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
      <tr>
        <td style="padding: 32px; background: linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(201, 169, 97, 0.05) 100%); border: 1px solid rgba(201, 169, 97, 0.3); border-radius: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Crown" width="40" height="40" style="display: block; margin-bottom: 16px;">
              </td>
            </tr>
            <tr>
              <td align="center">
                <h3 style="color: #c9a961; font-size: 20px; margin: 0 0 12px 0; font-family: Georgia, 'Times New Roman', serif;">
                  Ascend Anytime with Throne Light Reader
                </h3>
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="color: #a0a0a0; font-size: 14px; line-height: 1.7; margin: 0 0 20px 0; max-width: 400px; font-family: Georgia, 'Times New Roman', serif;">
                  Experience words of transformation wherever you are. The Throne Light Reader reads to you allowing you to receive wisdom on the go whether driving or resting or simply being.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="https://thronelightpublishing.com/download" style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%); color: #0a0a0a; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-family: Georgia, 'Times New Roman', serif;">
                  Download the Reader
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Light of EOLLES</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    .fallback-font {font-family: Arial, sans-serif;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${letter.body[0].substring(0, 100)}...
  </div>
  
  <!-- Spacer for preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">
          
          <!-- Header with Crown -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="https://thronelightpublishing.com/author" style="text-decoration: none;">
                <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Throne Light" width="56" height="56" style="display: block;">
              </a>
            </td>
          </tr>
          
          <!-- Letter Title -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <span style="color: #c9a961; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', serif;">
                Light of EOLLES
              </span>
            </td>
          </tr>
          
          <!-- Letter Number -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="color: #555; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', serif;">
                Letter ${letter.number} of 52
              </span>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(180deg, #141414 0%, #0f0f0f 100%); border: 1px solid rgba(201, 169, 97, 0.25); border-radius: 20px;">
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <!-- Greeting -->
                    <p style="color: #c9a961; font-size: 24px; margin: 0 0 32px 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">
                      ${greeting}
                    </p>
                    
                    <!-- Body -->
                    ${bodyHtml}
                    
                    <!-- Decorative Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.4) 100%);"></td>
                              <td style="padding: 0 16px;">
                                <span style="color: rgba(201, 169, 97, 0.6); font-size: 16px;">✦</span>
                              </td>
                              <td style="width: 40px; height: 1px; background: linear-gradient(90deg, rgba(201, 169, 97, 0.4) 0%, transparent 100%);"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Closing -->
                    <p style="color: #a0a0a0; font-size: 15px; line-height: 1.8; margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">
                      ${letter.closing}
                    </p>
                    
                    <!-- Signature -->
                    <p style="color: #c9a961; font-size: 22px; margin: 0; font-family: Georgia, 'Times New Roman', serif;">
                      ${letter.signature}
                    </p>
                    
                    <!-- Reader CTA for non-purchasers -->
                    ${readerCta}
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                
                <!-- Social/Website Link -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="https://thronelightpublishing.com/author" style="color: #c9a961; font-size: 13px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">
                      Visit EOLLES
                    </a>
                  </td>
                </tr>
                
                <!-- Publisher Info -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="color: #555; font-size: 12px; margin: 0; font-family: Georgia, 'Times New Roman', serif;">
                      Throne Light Publishing LLC
                    </p>
                    <p style="color: #444; font-size: 11px; margin: 8px 0 0 0; font-family: Georgia, 'Times New Roman', serif;">
                      Where Books Bring Light
                    </p>
                  </td>
                </tr>
                
                <!-- Unsubscribe -->
                <tr>
                  <td align="center">
                    <p style="color: #444; font-size: 11px; margin: 0; font-family: Georgia, 'Times New Roman', serif;">
                      You are receiving this because you signed up for the Light of EOLLES at thronelightpublishing.com
                      <br><br>
                      <a href="${unsubscribeUrl}" style="color: #555; text-decoration: underline;">
                        Unsubscribe from these letters
                      </a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
