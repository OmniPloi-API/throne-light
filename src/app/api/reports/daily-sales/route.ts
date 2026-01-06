// Daily Sales Report Cron Endpoint
// Triggered daily to send sales report to developer email
import { NextRequest, NextResponse } from 'next/server';
import { sendDailySalesReportEmail } from '@/lib/reader-licensing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');

    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorized = 
      (cronSecret && secret === cronSecret) ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sendDailySalesReportEmail();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Daily sales report sent successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );

  } catch (error) {
    console.error('Daily report cron error:', error);
    return NextResponse.json(
      { error: 'Failed to send daily report' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
