// Email campaign status endpoint
import { NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/email-campaigns-supabase';
import { getCampaignInfo } from '@/lib/email-campaigns';

export async function GET() {
  try {
    const campaignInfo = getCampaignInfo();
    const stats = await getCampaignStats();

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch campaign stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: campaignInfo,
      ...stats,
    });
  } catch (error) {
    console.error('Error fetching email status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email status' },
      { status: 500 }
    );
  }
}
