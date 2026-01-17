// Reader Licensing Service
// Handles license generation, validation, device activation, and support claims
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const DEVELOPER_EMAIL = 'ampledevelopment@gmail.com';
const MAX_DEVICES = 2; // What users see - "2 device limit"
const MAX_DEVICES_PER_CATEGORY = 2; // Internal: 2 mobile + 2 desktop = more flexibility

// Device category helpers - allows 2 mobile + 2 desktop activations internally
// This gives users flexibility for different browsers on same device type
type DeviceCategory = 'mobile' | 'desktop';

function getDeviceCategory(deviceType: string, userAgent?: string): DeviceCategory {
  // Native app types
  if (deviceType === 'ios' || deviceType === 'android') {
    return 'mobile';
  }
  if (deviceType === 'macos' || deviceType === 'windows') {
    return 'desktop';
  }
  
  // For 'web' type, detect from user agent
  if (userAgent) {
    const mobileKeywords = [
      'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'webOS', 
      'BlackBerry', 'Opera Mini', 'IEMobile', 'Windows Phone'
    ];
    const isMobile = mobileKeywords.some(keyword => 
      userAgent.includes(keyword)
    );
    return isMobile ? 'mobile' : 'desktop';
  }
  
  // Default to desktop if we can't determine
  return 'desktop';
}

function getSupabase() {
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return null;
}

function generateLicenseCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7 || i === 11) {
      result += '-';
    }
  }
  return result;
}

function generateClaimNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CLM-${dateStr}-${random}`;
}

export interface CreateLicenseResult {
  success: boolean;
  licenseCode?: string;
  licenseId?: string;
  error?: string;
}

export async function createLicenseFromPurchase(
  email: string,
  customerName: string | null,
  stripeSessionId: string,
  stripePaymentIntentId: string | null,
  stripeCustomerId: string | null,
  amountPaid: number,
  currency: string = 'usd'
): Promise<CreateLicenseResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const { data: existing } = await supabase
      .from('reader_licenses')
      .select('id, license_code')
      .eq('stripe_session_id', stripeSessionId)
      .single();

    if (existing) {
      return { success: true, licenseCode: existing.license_code, licenseId: existing.id };
    }

    const licenseCode = generateLicenseCode();

    const { data: license, error } = await supabase
      .from('reader_licenses')
      .insert({
        license_code: licenseCode,
        email: email.toLowerCase(),
        customer_name: customerName,
        stripe_session_id: stripeSessionId,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_customer_id: stripeCustomerId,
        amount_paid: amountPaid / 100,
        currency,
        max_devices: MAX_DEVICES,
      })
      .select('id, license_code')
      .single();

    if (error) {
      console.error('Failed to create license:', error);
      return { success: false, error: error.message };
    }

    console.log(`Created license ${licenseCode} for ${email}`);
    return { success: true, licenseCode: license.license_code, licenseId: license.id };
  } catch (error) {
    console.error('License creation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface ValidateLicenseResult {
  valid: boolean;
  canActivate: boolean;
  licenseId?: string;
  email?: string;
  customerName?: string;
  maxDevices?: number;
  activeDevices?: number;
  remainingActivations?: number;
  error?: string;
  errorCode?: 'INVALID_CODE' | 'REVOKED' | 'INACTIVE' | 'DEVICE_LIMIT_EXCEEDED';
}

export async function validateLicense(licenseCode: string): Promise<ValidateLicenseResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, canActivate: false, error: 'Database not configured' };
  }

  try {
    const { data: license, error } = await supabase
      .from('reader_licenses')
      .select('*')
      .eq('license_code', licenseCode.toUpperCase())
      .single();

    if (error || !license) {
      return { 
        valid: false, 
        canActivate: false, 
        error: 'Invalid license code', 
        errorCode: 'INVALID_CODE' 
      };
    }

    if (license.is_revoked) {
      return { 
        valid: false, 
        canActivate: false, 
        error: 'This license has been revoked', 
        errorCode: 'REVOKED' 
      };
    }

    if (!license.is_active) {
      return { 
        valid: false, 
        canActivate: false, 
        error: 'This license is inactive', 
        errorCode: 'INACTIVE' 
      };
    }

    const { data: activations } = await supabase
      .from('device_activations')
      .select('id')
      .eq('license_id', license.id)
      .eq('is_active', true);

    const activeDevices = activations?.length || 0;
    const canActivate = activeDevices < license.max_devices;

    return {
      valid: true,
      canActivate,
      licenseId: license.id,
      email: license.email,
      customerName: license.customer_name,
      maxDevices: license.max_devices,
      activeDevices,
      remainingActivations: license.max_devices - activeDevices,
      errorCode: canActivate ? undefined : 'DEVICE_LIMIT_EXCEEDED',
    };
  } catch (error) {
    console.error('License validation error:', error);
    return { valid: false, canActivate: false, error: 'Validation failed' };
  }
}

export interface ActivateDeviceResult {
  success: boolean;
  activationId?: string;
  remainingActivations?: number;
  error?: string;
  errorCode?: string;
  supportClaimUrl?: string;
}

export async function activateDevice(
  licenseCode: string,
  deviceFingerprint: string,
  deviceName: string | null,
  deviceType: 'macos' | 'windows' | 'ios' | 'android' | 'web',
  ipAddress?: string,
  userAgent?: string
): Promise<ActivateDeviceResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const validation = await validateLicense(licenseCode);
    
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error, 
        errorCode: validation.errorCode 
      };
    }

    const { data: existingActivation } = await supabase
      .from('device_activations')
      .select('id, is_active')
      .eq('license_id', validation.licenseId)
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    if (existingActivation) {
      if (existingActivation.is_active) {
        await supabase
          .from('device_activations')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', existingActivation.id);
        
        return { 
          success: true, 
          activationId: existingActivation.id,
          remainingActivations: validation.remainingActivations 
        };
      } else {
        const { error } = await supabase
          .from('device_activations')
          .update({ 
            is_active: true, 
            deactivated_at: null,
            last_used_at: new Date().toISOString() 
          })
          .eq('id', existingActivation.id);

        if (error) {
          return { success: false, error: 'Failed to reactivate device' };
        }

        return { 
          success: true, 
          activationId: existingActivation.id,
          remainingActivations: (validation.remainingActivations || 0) - 1
        };
      }
    }

    // Category-based device limits: allow 2 mobile + 2 desktop activations
    // This gives users flexibility for different browsers on same device type
    // while still showing "2 device limit" to users
    const newDeviceCategory = getDeviceCategory(deviceType, userAgent);
    
    // Get all active activations with their device info to count by category
    const { data: allActivations } = await supabase
      .from('device_activations')
      .select('id, device_type, user_agent')
      .eq('license_id', validation.licenseId)
      .eq('is_active', true);
    
    // Count activations in the same category as the new device
    const sameCategoryCount = (allActivations || []).filter(activation => {
      const category = getDeviceCategory(activation.device_type, activation.user_agent);
      return category === newDeviceCategory;
    }).length;
    
    // Check category limit instead of total limit
    const canActivateInCategory = sameCategoryCount < MAX_DEVICES_PER_CATEGORY;
    
    if (!canActivateInCategory) {
      // Show user-friendly message (they see "2 device limit")
      return {
        success: false,
        error: `Device limit reached. Your license allows ${validation.maxDevices} devices and you have ${validation.activeDevices} active devices. Per our Terms of Service, each license covers up to ${validation.maxDevices} devices. If you believe this is an error or need to transfer your license to a new device, please contact support.`,
        errorCode: 'DEVICE_LIMIT_EXCEEDED',
        supportClaimUrl: `https://thronelightpublishing.com/support/license-claim?code=${licenseCode}`,
      };
    }

    const { data: activation, error } = await supabase
      .from('device_activations')
      .insert({
        license_id: validation.licenseId,
        device_fingerprint: deviceFingerprint,
        device_name: deviceName,
        device_type: deviceType,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Device activation error:', error);
      return { success: false, error: 'Failed to activate device' };
    }

    console.log(`Activated device ${deviceFingerprint} for license ${licenseCode}`);
    return { 
      success: true, 
      activationId: activation.id,
      remainingActivations: (validation.remainingActivations || 1) - 1
    };
  } catch (error) {
    console.error('Activation error:', error);
    return { success: false, error: 'Activation failed' };
  }
}

export interface CreateSupportClaimResult {
  success: boolean;
  claimNumber?: string;
  error?: string;
}

export async function createSupportClaim(
  licenseCode: string | null,
  email: string,
  customerName: string | null,
  claimType: 'DEVICE_LIMIT_EXCEEDED' | 'ACTIVATION_ISSUE' | 'DOWNLOAD_ISSUE' | 'CODE_NOT_WORKING' | 'TRANSFER_REQUEST' | 'OTHER',
  subject: string,
  message: string,
  deviceInfo?: string
): Promise<CreateSupportClaimResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    let licenseId = null;
    
    if (licenseCode) {
      const { data: license } = await supabase
        .from('reader_licenses')
        .select('id')
        .eq('license_code', licenseCode.toUpperCase())
        .single();
      
      if (license) {
        licenseId = license.id;
      }
    }

    const claimNumber = generateClaimNumber();

    const { data: claim, error } = await supabase
      .from('license_support_claims')
      .insert({
        claim_number: claimNumber,
        license_id: licenseId,
        license_code: licenseCode?.toUpperCase(),
        email: email.toLowerCase(),
        customer_name: customerName,
        claim_type: claimType,
        subject,
        message,
        device_info: deviceInfo,
      })
      .select('claim_number')
      .single();

    if (error) {
      console.error('Failed to create support claim:', error);
      return { success: false, error: error.message };
    }

    await sendSupportClaimNotification(claimNumber, email, claimType, subject, message);

    console.log(`Created support claim ${claimNumber} for ${email}`);
    return { success: true, claimNumber: claim.claim_number };
  } catch (error) {
    console.error('Support claim error:', error);
    return { success: false, error: 'Failed to create support claim' };
  }
}

async function sendSupportClaimNotification(
  claimNumber: string,
  customerEmail: string,
  claimType: string,
  subject: string,
  message: string
): Promise<void> {
  try {
    const client = getResend();
    if (!client) return;
    await client.emails.send({
      from: 'Throne Light Support <support@thronelightpublishing.com>',
      to: DEVELOPER_EMAIL,
      subject: `[SUPPORT CLAIM] ${claimNumber} - ${claimType}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c9a961;">New Support Claim Received</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Claim Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${claimNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${claimType.replace(/_/g, ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #333;">Message:</h3>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
          
          <p style="margin-top: 24px;">
            <a href="https://thronelightpublishing.com/admin/support-claims/${claimNumber}" 
               style="background: #c9a961; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View in Admin Panel
            </a>
          </p>
        </div>
      `,
    });
    
    console.log(`Sent support claim notification for ${claimNumber}`);
  } catch (error) {
    console.error('Failed to send support claim notification:', error);
  }
}

export async function sendReaderDownloadEmail(
  licenseId: string,
  email: string,
  customerName: string | null,
  licenseCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  const client = getResend();
  if (!client) {
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const firstName = customerName?.split(' ')[0] || 'Valued Customer';
    
    const { data: emailResult, error: sendError } = await client.emails.send({
      from: 'Throne Light Publishing <reader@thronelightpublishing.com>',
      to: email,
      subject: '✨ Your Throne Light Reader Access',
      html: generateReaderDownloadEmailHtml(firstName, licenseCode),
    });

    if (sendError) {
      console.error('Failed to send download email:', sendError);
      return { success: false, error: sendError.message };
    }

    if (supabase) {
      await supabase.from('reader_download_emails').insert({
        license_id: licenseId,
        email,
        resend_id: emailResult?.id,
        status: 'SENT',
      });
    }

    console.log(`Sent Reader download email to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Download email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateReaderDownloadEmailHtml(firstName: string, licenseCode: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Book Is Ready - The Crowded Bed & The Empty Throne</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(180deg, #fdf8f3 0%, #f9efe6 100%); font-family: Georgia, 'Times New Roman', serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #fdf8f3 0%, #f9efe6 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Throne Light" width="56" height="56">
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <span style="color: #c9a961; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                THRONE LIGHT PUBLISHING
              </span>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="color: #9a8478; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
                Your Book Is Ready
              </span>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fffbf7 0%, #fef6f0 50%, #fdf4ee 100%); border: 1px solid rgba(201, 169, 97, 0.3); border-radius: 20px; box-shadow: 0 4px 24px rgba(180, 140, 100, 0.08);">
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <p style="color: #c9a961; font-size: 24px; margin: 0 0 24px 0; font-style: italic; text-align: center;">
                      Dear ${firstName},
                    </p>
                    
                    <p style="color: #3d3d3d; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0; text-align: center;">
                      Thank you for your purchase. Your journey into words of transformation begins now.
                    </p>
                    
                    <!-- Book Cover and Access Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://thronelightpublishing.com/reader" style="text-decoration: none; display: block;">
                            <!-- Book Cover Image -->
                            <img src="https://thronelightpublishing.com/images/book-cover.jpg" 
                                 alt="The Crowded Bed & The Empty Throne" 
                                 width="200" 
                                 style="display: block; margin: 0 auto 24px auto; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
                          </a>
                          
                          <p style="color: #3d3d3d; font-size: 18px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">
                            The Crowded Bed & The Empty Throne
                          </p>
                          <p style="color: #7a6b63; font-size: 14px; margin: 0 0 24px 0; text-align: center;">
                            by EOLLES
                          </p>
                          
                          <!-- Magic Link - Auto-fills access code -->
                          <a href="https://thronelightpublishing.com/login?code=${licenseCode}&redirect=/reader" 
                             style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%); color: #fff; font-size: 18px; font-weight: bold; text-decoration: none; padding: 18px 48px; border-radius: 12px; box-shadow: 0 4px 16px rgba(201, 169, 97, 0.4);">
                            📖 Open Reader Instantly
                          </a>
                          <p style="color: #9a8478; font-size: 12px; margin: 12px 0 0 0; text-align: center;">
                            Click above to auto-activate your device
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.4) 100%);"></td>
                              <td style="padding: 0 16px;">
                                <span style="color: rgba(201, 169, 97, 0.6); font-size: 16px;">✦</span>
                              </td>
                              <td style="width: 80px; height: 1px; background: linear-gradient(90deg, rgba(201, 169, 97, 0.4) 0%, transparent 100%);"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- License Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(201, 169, 97, 0.08) 100%); border: 2px solid #c9a961; border-radius: 12px; padding: 24px;">
                            <p style="color: #7a6b63; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">
                              Your Unique Access Code
                            </p>
                            <p style="color: #c9a961; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">
                              ${licenseCode}
                            </p>
                            <p style="color: #9a8478; font-size: 12px; margin: 16px 0 0 0;">
                              Valid for 2 devices • Keep this code safe
                            </p>
                            <a href="https://thronelightpublishing.com/code/${licenseCode}" 
                               style="display: inline-block; margin-top: 16px; background: transparent; border: 1px solid #c9a961; color: #c9a961; font-size: 12px; text-decoration: none; padding: 8px 16px; border-radius: 6px;">
                              📋 Tap to Copy Code
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Instructions -->
                    <div style="background: rgba(201, 169, 97, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <p style="color: #c9a961; font-size: 14px; font-weight: bold; margin: 0 0 12px 0; text-align: center;">
                        How to Access Your Book
                      </p>
                      <p style="color: #7a6b63; font-size: 14px; line-height: 1.8; margin: 0; text-align: center;">
                        <strong>Option 1:</strong> Click "Open Reader Instantly" above - it auto-enters your code<br><br>
                        <strong>Option 2:</strong> Download the Throne Light Reader app and enter your access code manually
                      </p>
                    </div>
                    
                    <!-- Download Options -->
                    <p style="color: #3d3d3d; font-size: 14px; margin: 0 0 16px 0; text-align: center;">
                      Download the Throne Light Reader for the best experience:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 6px;">
                                <a href="https://thronelightpublishing.com/download/macos" style="display: inline-block; background: transparent; border: 1px solid #c9a961; color: #c9a961; font-size: 12px; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                                  🍎 Mac
                                </a>
                              </td>
                              <td style="padding: 6px;">
                                <a href="https://thronelightpublishing.com/download/windows" style="display: inline-block; background: transparent; border: 1px solid #c9a961; color: #c9a961; font-size: 12px; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                                  🪟 Windows
                                </a>
                              </td>
                              <td style="padding: 6px;">
                                <a href="https://thronelightpublishing.com/download/ios" style="display: inline-block; background: transparent; border: 1px solid #c9a961; color: #c9a961; font-size: 12px; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                                  📱 iOS
                                </a>
                              </td>
                              <td style="padding: 6px;">
                                <a href="https://thronelightpublishing.com/download/android" style="display: inline-block; background: transparent; border: 1px solid #c9a961; color: #c9a961; font-size: 12px; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                                  🤖 Android
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.2) 100%);"></td>
                              <td style="padding: 0 16px;">
                                <span style="color: rgba(201, 169, 97, 0.4); font-size: 12px;">✦</span>
                              </td>
                              <td style="width: 80px; height: 1px; background: linear-gradient(90deg, rgba(201, 169, 97, 0.2) 0%, transparent 100%);"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #7a6b63; font-size: 13px; line-height: 1.7; margin: 0; text-align: center;">
                      Need help? Contact us at 
                      <a href="mailto:support@thronelightpublishing.com" style="color: #c9a961;">support@thronelightpublishing.com</a>
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="color: #8a7b73; font-size: 12px; margin: 0;">
                      Throne Light Publishing LLC
                    </p>
                    <p style="color: #9a8b83; font-size: 11px; margin: 8px 0 0 0;">
                      Where Books Bring Light
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

export async function generateDailySalesReport(): Promise<{
  success: boolean;
  report?: {
    date: string;
    totalSales: number;
    totalRevenue: number;
    sales: Array<{
      email: string;
      customerName: string | null;
      amount: number;
      purchasedAt: string;
    }>;
  };
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const { data: sales } = await supabase
      .from('reader_licenses')
      .select('email, customer_name, amount_paid, currency, purchased_at')
      .gte('purchased_at', yesterday.toISOString())
      .lt('purchased_at', today.toISOString())
      .order('purchased_at', { ascending: false });

    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.amount_paid), 0) || 0;

    const report = {
      date: yesterday.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      sales: sales?.map(s => ({
        email: s.email,
        customerName: s.customer_name,
        amount: parseFloat(s.amount_paid),
        purchasedAt: s.purchased_at,
      })) || [],
    };

    await supabase.from('daily_sales_reports').upsert({
      report_date: report.date,
      total_sales: totalSales,
      total_revenue: totalRevenue,
      report_data: report,
    });

    return { success: true, report };
  } catch (error) {
    console.error('Daily report error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendDailySalesReportEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResend();
    if (!client) {
      return { success: false, error: 'Email service not configured' };
    }
    const { success, report, error } = await generateDailySalesReport();
    
    if (!success || !report) {
      return { success: false, error: error || 'Failed to generate report' };
    }

    const salesRows = report.sales.length > 0
      ? report.sales.map(s => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${s.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${s.customerName || 'N/A'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${s.amount.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${new Date(s.purchasedAt).toLocaleTimeString()}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" style="padding: 24px; text-align: center; color: #999;">No sales recorded</td></tr>';

    await client.emails.send({
      from: 'Throne Light Reports <reports@thronelightpublishing.com>',
      to: DEVELOPER_EMAIL,
      subject: `📊 Daily Sales Report - ${report.date} | $${report.totalRevenue.toFixed(2)} from ${report.totalSales} sales`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #c9a961; margin-bottom: 8px;">Daily Sales Report</h1>
          <p style="color: #666; margin-top: 0;">${report.date}</p>
          
          <!-- Summary Cards -->
          <table width="100%" cellpadding="0" cellspacing="16" style="margin: 24px 0;">
            <tr>
              <td style="background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%); color: #fff; padding: 24px; border-radius: 12px; text-align: center; width: 50%;">
                <p style="margin: 0; font-size: 36px; font-weight: bold;">$${report.totalRevenue.toFixed(2)}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Total Revenue</p>
              </td>
              <td style="background: #f5f5f5; padding: 24px; border-radius: 12px; text-align: center; width: 50%;">
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #333;">${report.totalSales}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Total Sales</p>
              </td>
            </tr>
          </table>
          
          <!-- Sales Table -->
          <h3 style="color: #333;">Sales Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Email</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Name</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Amount</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${salesRows}
            </tbody>
          </table>
          
          <p style="margin-top: 32px; color: #999; font-size: 12px;">
            <a href="https://thronelightpublishing.com/admin" style="color: #c9a961;">View Full Dashboard</a>
          </p>
        </div>
      `,
    });

    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('daily_sales_reports')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('report_date', report.date);
    }

    console.log(`Sent daily sales report for ${report.date}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send daily report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// LICENSE EXTENSION SUPPORT SYSTEM
// Auto-approves first 2 license extension requests, then requires admin review
// ============================================================================

const MAX_AUTO_APPROVALS = 2; // After 2 auto-approvals, require human review
const AUTO_APPROVAL_DELAY_MS = 2 * 60 * 1000; // 2-5 minute delay (randomized)

export interface LicenseExtensionResult {
  success: boolean;
  claimNumber?: string;
  autoApproved?: boolean;
  requiresReview?: boolean;
  newMaxDevices?: number;
  error?: string;
}

/**
 * Request a license extension (add 1 device slot)
 * Auto-approves first 2 requests, then requires admin review
 */
export async function requestLicenseExtension(
  licenseCode: string,
  email: string,
  reason: string,
  receiptInfo?: string
): Promise<LicenseExtensionResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    // Find the license
    const { data: license, error: licenseError } = await supabase
      .from('reader_licenses')
      .select('id, license_code, email, customer_name, max_devices')
      .eq('license_code', licenseCode.toUpperCase())
      .single();

    if (licenseError || !license) {
      return { success: false, error: 'License not found' };
    }

    // Verify email matches
    if (license.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, error: 'Email does not match license' };
    }

    // Count previous auto-approved extensions for this license
    const { data: previousExtensions } = await supabase
      .from('license_extension_requests')
      .select('id, status')
      .eq('license_id', license.id)
      .eq('status', 'approved');

    const approvedCount = previousExtensions?.length || 0;
    const canAutoApprove = approvedCount < MAX_AUTO_APPROVALS;

    // Generate claim number
    const claimNumber = generateClaimNumber();

    // Create extension request record
    const { error: insertError } = await supabase
      .from('license_extension_requests')
      .insert({
        claim_number: claimNumber,
        license_id: license.id,
        license_code: license.license_code,
        email: email.toLowerCase(),
        reason,
        receipt_info: receiptInfo,
        status: canAutoApprove ? 'pending_auto_approval' : 'pending_review',
        auto_approval_eligible: canAutoApprove,
        previous_approvals: approvedCount,
      });

    if (insertError) {
      console.error('Failed to create extension request:', insertError);
      return { success: false, error: 'Failed to create request' };
    }

    // Send acknowledgment email immediately
    await sendExtensionAcknowledgmentEmail(email, claimNumber, license.customer_name);

    if (canAutoApprove) {
      // Schedule auto-approval with delay (2-5 minutes)
      const delay = AUTO_APPROVAL_DELAY_MS + Math.random() * 3 * 60 * 1000;
      
      // In production, use a job queue. For now, use setTimeout
      setTimeout(async () => {
        await processAutoApproval(claimNumber, license.id, license.max_devices);
      }, delay);

      return {
        success: true,
        claimNumber,
        autoApproved: false, // Will be auto-approved after delay
        requiresReview: false,
      };
    } else {
      // Requires human review - notify admin
      await sendAdminReviewNotification(claimNumber, email, reason, approvedCount);

      return {
        success: true,
        claimNumber,
        autoApproved: false,
        requiresReview: true,
      };
    }
  } catch (error) {
    console.error('License extension request error:', error);
    return { success: false, error: 'Failed to process request' };
  }
}

/**
 * Process auto-approval of license extension
 */
async function processAutoApproval(
  claimNumber: string,
  licenseId: string,
  currentMaxDevices: number
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    // Update license to add 1 device slot
    const newMaxDevices = currentMaxDevices + 1;
    
    const { error: updateLicenseError } = await supabase
      .from('reader_licenses')
      .update({ max_devices: newMaxDevices })
      .eq('id', licenseId);

    if (updateLicenseError) {
      console.error('Failed to update license:', updateLicenseError);
      return;
    }

    // Update extension request status
    const { data: request, error: updateRequestError } = await supabase
      .from('license_extension_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'auto',
        new_max_devices: newMaxDevices,
      })
      .eq('claim_number', claimNumber)
      .select('email, license_code')
      .single();

    if (updateRequestError || !request) {
      console.error('Failed to update extension request:', updateRequestError);
      return;
    }

    // Send approval email to customer
    await sendExtensionApprovalEmail(request.email, claimNumber, newMaxDevices);

    console.log(`Auto-approved license extension ${claimNumber}, new max devices: ${newMaxDevices}`);
  } catch (error) {
    console.error('Auto-approval processing error:', error);
  }
}

/**
 * Manually approve license extension (admin action)
 */
export async function approveLicenseExtension(
  claimNumber: string,
  approvedBy: string
): Promise<{ success: boolean; newMaxDevices?: number; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    // Get the extension request
    const { data: request, error: requestError } = await supabase
      .from('license_extension_requests')
      .select('license_id, email, status')
      .eq('claim_number', claimNumber)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status === 'approved') {
      return { success: false, error: 'Request already approved' };
    }

    // Get current license
    const { data: license, error: licenseError } = await supabase
      .from('reader_licenses')
      .select('max_devices')
      .eq('id', request.license_id)
      .single();

    if (licenseError || !license) {
      return { success: false, error: 'License not found' };
    }

    const newMaxDevices = license.max_devices + 1;

    // Update license
    await supabase
      .from('reader_licenses')
      .update({ max_devices: newMaxDevices })
      .eq('id', request.license_id);

    // Update request
    await supabase
      .from('license_extension_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        new_max_devices: newMaxDevices,
      })
      .eq('claim_number', claimNumber);

    // Send approval email
    await sendExtensionApprovalEmail(request.email, claimNumber, newMaxDevices);

    return { success: true, newMaxDevices };
  } catch (error) {
    console.error('Manual approval error:', error);
    return { success: false, error: 'Failed to approve' };
  }
}

/**
 * Send acknowledgment email when extension request is received
 */
async function sendExtensionAcknowledgmentEmail(
  email: string,
  claimNumber: string,
  customerName: string | null
): Promise<void> {
  const client = getResend();
  if (!client) return;

  const firstName = customerName?.split(' ')[0] || 'Valued Reader';

  try {
    await client.emails.send({
      from: 'Throne Light Support <support@thronelightpublishing.com>',
      to: email,
      subject: `Support Request Received - ${claimNumber}`,
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
              <h1 style="margin: 0; color: #c9a961; font-size: 24px;">Support Request Received</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Claim #${claimNumber}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Dear ${firstName},
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                We have received your license support request. Our team is reviewing your case and you will receive an update shortly.
              </p>
              <div style="background: #1a1a1a; border-left: 4px solid #c9a961; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #888; font-size: 14px;">
                  <strong style="color: #c9a961;">Expected Response Time:</strong><br>
                  Most requests are reviewed within 2-5 minutes. In some cases, it may take up to 48 hours.
                </p>
              </div>
              <p style="color: #888; font-size: 14px; margin: 30px 0 0;">
                Please keep this claim number for your reference: <strong style="color: #c9a961;">${claimNumber}</strong>
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
    });

    console.log(`Sent extension acknowledgment to ${email}`);
  } catch (error) {
    console.error('Failed to send acknowledgment email:', error);
  }
}

/**
 * Send approval email when extension is granted
 */
async function sendExtensionApprovalEmail(
  email: string,
  claimNumber: string,
  newMaxDevices: number
): Promise<void> {
  const client = getResend();
  if (!client) return;

  try {
    await client.emails.send({
      from: 'Throne Light Support <support@thronelightpublishing.com>',
      to: email,
      subject: `✅ License Extended - ${claimNumber}`,
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
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #22c55e; font-size: 24px;">License Extended!</h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Claim #${claimNumber}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Great news! Your license support request has been reviewed and approved.
              </p>
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #222 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                  Your New Device Limit
                </p>
                <p style="margin: 0; color: #22c55e; font-size: 48px; font-weight: bold;">
                  ${newMaxDevices}
                </p>
                <p style="margin: 10px 0 0; color: #888; font-size: 14px;">devices</p>
              </div>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                You can now activate the Throne Light Reader on an additional device. Simply enter your access code on the new device to begin reading.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://thecrowdedbedandtheemptythrone.com/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #c9a961 0%, #b8944a 100%); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Access Reader →
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
    });

    console.log(`Sent extension approval to ${email}`);
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}

/**
 * Notify admin when review is required (after 2 auto-approvals)
 */
async function sendAdminReviewNotification(
  claimNumber: string,
  customerEmail: string,
  reason: string,
  previousApprovals: number
): Promise<void> {
  const client = getResend();
  if (!client) return;

  try {
    await client.emails.send({
      from: 'Throne Light Support <support@thronelightpublishing.com>',
      to: DEVELOPER_EMAIL,
      subject: `🔔 License Extension Review Required - ${claimNumber}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c9a961;">License Extension Review Required</h2>
          <p style="color: #666;">This customer has exceeded the auto-approval limit.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">Claim Number:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${claimNumber}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Email:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">Previous Approvals:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #f97316;">${previousApprovals} (limit: ${MAX_AUTO_APPROVALS})</td>
            </tr>
          </table>
          
          <h3 style="color: #333;">Customer's Reason:</h3>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${reason}</div>
          
          <p style="margin-top: 24px;">
            <a href="https://thronelightpublishing.com/admin/license-claims/${claimNumber}" 
               style="background: #c9a961; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review & Approve
            </a>
          </p>
        </div>
      `,
    });

    console.log(`Sent admin review notification for ${claimNumber}`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}
