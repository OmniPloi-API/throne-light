// Test endpoint to verify Resend configuration
import { NextResponse } from 'next/server';
import { sendLightOfEollesEmail } from '@/lib/email-campaigns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Test sending letter #1
    const result = await sendLightOfEollesEmail(email, 1, firstName, false);
    
    return NextResponse.json({
      success: result.success,
      resendId: result.resendId,
      error: result.error,
      resendConfigured: !!process.env.RESEND_API_KEY,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      resendConfigured: !!process.env.RESEND_API_KEY,
    }, { status: 500 });
  }
}
