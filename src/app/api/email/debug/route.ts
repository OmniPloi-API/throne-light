// Debug endpoint to check database state
import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const db = readDb();
    
    // Also check Supabase directly
    let supabaseData = null;
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // @ts-ignore
      const { data: subs } = await supabase.from('subscribers').select('id, email, source').limit(5);
      // @ts-ignore
      const { data: states } = await supabase.from('subscriber_campaign_state').select('*').limit(5);
      // @ts-ignore
      const { data: sends } = await supabase.from('email_sends').select('*').limit(5);
      
      supabaseData = {
        subscribers: subs || [],
        campaignStates: states || [],
        emailSends: sends || [],
      };
    }
    
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
      supabase: supabaseData,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
