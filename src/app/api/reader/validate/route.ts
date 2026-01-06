// License Validation API for Throne Light Reader
import { NextRequest, NextResponse } from 'next/server';
import { validateLicense, activateDevice } from '@/lib/reader-licensing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseCode, deviceFingerprint, deviceName, deviceType, action } = body;

    if (!licenseCode) {
      return NextResponse.json(
        { valid: false, error: 'License code is required' },
        { status: 400 }
      );
    }

    // Just validate (check if license is valid without activating)
    if (action === 'validate') {
      const result = await validateLicense(licenseCode);
      return NextResponse.json(result);
    }

    // Activate device (requires device info)
    if (action === 'activate') {
      if (!deviceFingerprint || !deviceType) {
        return NextResponse.json(
          { success: false, error: 'Device fingerprint and type are required for activation' },
          { status: 400 }
        );
      }

      const validDeviceTypes = ['macos', 'windows', 'ios', 'android', 'web'];
      if (!validDeviceTypes.includes(deviceType)) {
        return NextResponse.json(
          { success: false, error: 'Invalid device type' },
          { status: 400 }
        );
      }

      const forwarded = request.headers.get('x-forwarded-for');
      const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
      const userAgent = request.headers.get('user-agent') || undefined;

      const result = await activateDevice(
        licenseCode,
        deviceFingerprint,
        deviceName || null,
        deviceType,
        ipAddress,
        userAgent
      );

      if (!result.success && result.errorCode === 'DEVICE_LIMIT_EXCEEDED') {
        return NextResponse.json({
          success: false,
          error: result.error,
          errorCode: result.errorCode,
          supportClaimUrl: result.supportClaimUrl,
          message: `Your license has reached its device limit. Each Throne Light Reader license allows activation on up to 2 devices. If you need to transfer your license to a new device or believe this is an error, please contact our support team.`,
        }, { status: 403 });
      }

      return NextResponse.json(result);
    }

    // Default: validate and return status
    const result = await validateLicense(licenseCode);
    return NextResponse.json(result);

  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple validation checks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const licenseCode = searchParams.get('code');

  if (!licenseCode) {
    return NextResponse.json(
      { valid: false, error: 'License code is required' },
      { status: 400 }
    );
  }

  const result = await validateLicense(licenseCode);
  return NextResponse.json(result);
}
