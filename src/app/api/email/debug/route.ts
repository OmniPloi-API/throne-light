// Debug endpoint to check database state
import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET() {
  try {
    const db = readDb();
    
    return NextResponse.json({
      subscribers: {
        total: db.subscribers?.length || 0,
        authorMailingList: db.subscribers?.filter(s => s.source === 'AUTHOR_MAILING_LIST').length || 0,
        sample: db.subscribers?.slice(0, 2) || [],
      },
      campaignStates: {
        total: db.subscriberCampaignStates?.length || 0,
        sample: db.subscriberCampaignStates?.slice(0, 5) || [],
      },
      emailSends: {
        total: db.emailSends?.length || 0,
        sample: db.emailSends?.slice(0, 5) || [],
      },
      environment: {
        resendConfigured: !!process.env.RESEND_API_KEY,
        cronSecretConfigured: !!process.env.CRON_SECRET,
        supabaseUrlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseServiceKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
