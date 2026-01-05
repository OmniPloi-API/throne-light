// Email campaign status endpoint for admin dashboard

import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getCampaignInfo, getTotalLetters } from '@/lib/email-campaigns';

export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    const campaignInfo = getCampaignInfo();
    
    // Get all campaign states
    const campaignStates = db.subscriberCampaignStates.filter(
      s => s.campaignSlug === campaignInfo.slug
    );
    
    // Calculate statistics
    const totalEnrolled = campaignStates.length;
    const active = campaignStates.filter(s => !s.isPaused && !s.isCompleted).length;
    const paused = campaignStates.filter(s => s.isPaused).length;
    const completed = campaignStates.filter(s => s.isCompleted).length;
    
    // Get email send stats
    const emailSends = db.emailSends.filter(
      s => s.campaignSlug === campaignInfo.slug
    );
    
    const totalSent = emailSends.length;
    const sentByStatus = {
      sent: emailSends.filter(s => s.status === 'SENT').length,
      delivered: emailSends.filter(s => s.status === 'DELIVERED').length,
      opened: emailSends.filter(s => s.status === 'OPENED').length,
      clicked: emailSends.filter(s => s.status === 'CLICKED').length,
      bounced: emailSends.filter(s => s.status === 'BOUNCED').length,
      failed: emailSends.filter(s => s.status === 'FAILED').length,
    };
    
    // Get subscribers due for next email
    const now = new Date();
    const dueCount = campaignStates.filter(
      s => !s.isPaused && !s.isCompleted && new Date(s.nextSendAt) <= now
    ).length;
    
    // Email distribution (how many subscribers at each letter)
    const distribution: Record<number, number> = {};
    for (const state of campaignStates) {
      const num = state.currentEmailNumber;
      distribution[num] = (distribution[num] || 0) + 1;
    }
    
    // Recent sends (last 10)
    const recentSends = emailSends
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 10)
      .map(send => {
        const subscriber = db.subscribers.find(s => s.id === send.subscriberId);
        return {
          email: subscriber?.email || 'Unknown',
          letterNumber: send.emailNumber,
          status: send.status,
          sentAt: send.sentAt,
        };
      });
    
    return NextResponse.json({
      campaign: {
        name: campaignInfo.name,
        slug: campaignInfo.slug,
        totalEmails: getTotalLetters(),
        frequencyDays: campaignInfo.frequencyDays,
      },
      subscribers: {
        totalEnrolled,
        active,
        paused,
        completed,
        dueForEmail: dueCount,
      },
      emails: {
        totalSent,
        byStatus: sentByStatus,
      },
      distribution,
      recentSends,
    });
  } catch (error) {
    console.error('Error fetching email status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email status' },
      { status: 500 }
    );
  }
}
