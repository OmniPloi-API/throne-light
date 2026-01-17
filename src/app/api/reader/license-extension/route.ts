import { NextRequest, NextResponse } from 'next/server';
import { requestLicenseExtension, approveLicenseExtension } from '@/lib/reader-licensing';

/**
 * POST - Request a license extension (customer facing)
 * Auto-approves first 2 requests with 2-5 min delay, then requires admin review
 */
export async function POST(req: NextRequest) {
  try {
    const { licenseCode, email, reason, receiptInfo } = await req.json();

    if (!licenseCode || !email) {
      return NextResponse.json(
        { error: 'License code and email are required' },
        { status: 400 }
      );
    }

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a brief reason for your request' },
        { status: 400 }
      );
    }

    const result = await requestLicenseExtension(
      licenseCode,
      email,
      reason,
      receiptInfo
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      claimNumber: result.claimNumber,
      message: result.requiresReview
        ? 'Your request has been submitted for review. You will receive an email update within 48 hours.'
        : 'Your request has been received and is being processed. You will receive an email confirmation shortly.',
    });
  } catch (error) {
    console.error('License extension request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Approve a license extension (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { claimNumber, approvedBy } = await req.json();

    if (!claimNumber) {
      return NextResponse.json(
        { error: 'Claim number is required' },
        { status: 400 }
      );
    }

    const result = await approveLicenseExtension(
      claimNumber,
      approvedBy || 'admin'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newMaxDevices: result.newMaxDevices,
      message: 'License extension approved successfully',
    });
  } catch (error) {
    console.error('License extension approval error:', error);
    return NextResponse.json(
      { error: 'Failed to approve' },
      { status: 500 }
    );
  }
}
