// License Support Claims API
import { NextRequest, NextResponse } from 'next/server';
import { createSupportClaim } from '@/lib/reader-licensing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      licenseCode, 
      email, 
      customerName, 
      claimType, 
      subject, 
      message,
      deviceInfo 
    } = body;

    if (!email || !claimType || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Email, claim type, subject, and message are required' },
        { status: 400 }
      );
    }

    const validClaimTypes = [
      'DEVICE_LIMIT_EXCEEDED', 
      'ACTIVATION_ISSUE', 
      'DOWNLOAD_ISSUE',
      'CODE_NOT_WORKING', 
      'TRANSFER_REQUEST', 
      'OTHER'
    ];

    if (!validClaimTypes.includes(claimType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim type' },
        { status: 400 }
      );
    }

    const result = await createSupportClaim(
      licenseCode || null,
      email,
      customerName || null,
      claimType,
      subject,
      message,
      deviceInfo
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        claimNumber: result.claimNumber,
        message: `Your support claim has been submitted. Your claim number is ${result.claimNumber}. Our team will review your request and respond within 24-48 hours.`,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );

  } catch (error) {
    console.error('Support claim error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit support claim' },
      { status: 500 }
    );
  }
}
