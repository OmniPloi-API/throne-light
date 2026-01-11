// License Code Authentication API
// Authenticates users via their license/access code instead of email/password
import { NextRequest, NextResponse } from 'next/server';
import { validateLicense, activateDevice } from '@/lib/reader-licensing';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'throne-light-secret-key-change-in-production';
const SESSION_EXPIRY = '30d'; // Longer expiry for code-based auth

interface LicenseAuthPayload {
  licenseId: string;
  email: string;
  deviceFingerprint: string;
  sessionToken: string;
}

function createLicenseToken(licenseId: string, email: string, deviceFingerprint: string): string {
  const sessionToken = uuidv4();
  return jwt.sign(
    { licenseId, email, deviceFingerprint, sessionToken } as LicenseAuthPayload,
    JWT_SECRET,
    { expiresIn: SESSION_EXPIRY }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessCode, deviceFingerprint, deviceName, deviceType = 'web' } = body;

    if (!accessCode) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
    }

    // Clean the access code (remove spaces, dashes for flexibility)
    const cleanCode = accessCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Re-format to standard format: XXXX-XXXX-XXXX-XXXX
    const formattedCode = cleanCode.match(/.{1,4}/g)?.join('-') || cleanCode;

    // Get or create a persistent device fingerprint
    // Priority: 1) Provided fingerprint, 2) Existing cookie, 3) Generate new
    const existingCookieFingerprint = req.cookies.get('device_fingerprint')?.value;
    const fingerprint = deviceFingerprint || existingCookieFingerprint || `web-${uuidv4()}`;
    const isNewFingerprint = !deviceFingerprint && !existingCookieFingerprint;

    // Get IP and user agent
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Validate the license first
    const validation = await validateLicense(formattedCode);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid access code',
        errorCode: validation.errorCode,
      }, { status: 401 });
    }

    // Activate the device
    const activation = await activateDevice(
      formattedCode,
      fingerprint,
      deviceName || `${deviceType} device`,
      deviceType as 'macos' | 'windows' | 'ios' | 'android' | 'web',
      ipAddress,
      userAgent
    );

    if (!activation.success) {
      // Device limit exceeded - return upsell opportunity
      if (activation.errorCode === 'DEVICE_LIMIT_EXCEEDED') {
        return NextResponse.json({
          success: false,
          error: 'Device limit reached',
          errorCode: 'DEVICE_LIMIT_EXCEEDED',
          message: `Your license allows ${validation.maxDevices} devices and you have ${validation.activeDevices} active. Would you like to add another device license?`,
          upsell: {
            available: true,
            price: 5.99,
            currency: 'USD',
            description: 'Add 1 additional device to your license',
            checkoutUrl: `/checkout/add-device?license=${formattedCode}`,
          },
          supportUrl: activation.supportClaimUrl,
        }, { status: 403 });
      }

      return NextResponse.json({
        success: false,
        error: activation.error || 'Failed to activate device',
        errorCode: activation.errorCode,
      }, { status: 400 });
    }

    // Create session token
    const token = createLicenseToken(
      validation.licenseId!,
      validation.email!,
      fingerprint
    );

    // Set the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Welcome to the Kingdom',
      user: {
        id: validation.licenseId,
        email: validation.email,
        name: validation.customerName,
      },
      license: {
        maxDevices: validation.maxDevices,
        activeDevices: (validation.activeDevices || 0) + 1,
        remainingActivations: activation.remainingActivations,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Also set a non-httpOnly cookie for client-side checks
    response.cookies.set('license_active', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    // Set persistent device fingerprint cookie
    // NOT httpOnly so client can read and send it explicitly (helps with mobile browsers)
    // Always set to ensure it persists, even if not new
    response.cookies.set('device_fingerprint', fingerprint, {
      httpOnly: false, // Allow client-side access for explicit passing
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years - device should persist long-term
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Code auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
