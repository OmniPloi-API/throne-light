// Cron endpoint for sending scheduled Light of EOLLES emails
// This should be triggered by Railway cron or external cron service

import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { sendLightOfEollesEmail, calculateNextSendDate, isCampaignComplete, getCampaignInfo } from '@/lib/email-campaigns';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

interface SubscriberCampaignState {
  subscriberId: string;
  campaignSlug: string;
  currentEmailNumber: number;
  nextSendAt: string;
  isPaused: boolean;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

interface EmailSend {
  id: string;
  subscriberId: string;
  campaignSlug: string;
  emailNumber: number;
  resendId?: string;
  status: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED';
  failedReason?: string;
  sentAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDb();
    const now = new Date();
    const campaignInfo = getCampaignInfo();
    
    // Initialize arrays if they don't exist
    if (!db.subscriberCampaignStates) {
      db.subscriberCampaignStates = [];
    }
    if (!db.emailSends) {
      db.emailSends = [];
    }

    // Find subscribers due for their next email
    const dueSubscribers = db.subscriberCampaignStates.filter((state: SubscriberCampaignState) => 
      state.campaignSlug === campaignInfo.slug &&
      !state.isPaused &&
      !state.isCompleted &&
      new Date(state.nextSendAt) <= now
    );

    console.log(`Found ${dueSubscribers.length} subscribers due for Light of EOLLES email`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      completed: 0,
      errors: [] as string[],
    };

    for (const state of dueSubscribers) {
      results.processed++;
      
      // Find subscriber details
      const subscriber = (db.subscribers || []).find((s: { id: string }) => s.id === state.subscriberId);
      if (!subscriber) {
        results.errors.push(`Subscriber ${state.subscriberId} not found`);
        results.failed++;
        continue;
      }

      // Check if unsubscribed
      if (subscriber.unsubscribedAt) {
        state.isPaused = true;
        continue;
      }

      // Calculate next email number
      const nextEmailNumber = state.currentEmailNumber + 1;

      // Check if subscriber has purchased (check library access)
      const hasPurchased = (db.libraryAccess || []).some(
        (access: { userId: string }) => {
          const user = (db.users || []).find((u: { email: string }) => 
            u.email.toLowerCase() === subscriber.email.toLowerCase()
          );
          return user && access.userId === user.id;
        }
      );

      // Send the email
      const result = await sendLightOfEollesEmail(
        subscriber.email,
        nextEmailNumber,
        subscriber.firstName,
        hasPurchased
      );

      if (result.success) {
        results.sent++;
        
        // Record the send
        const emailSend: EmailSend = {
          id: `es_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscriberId: state.subscriberId,
          campaignSlug: campaignInfo.slug,
          emailNumber: nextEmailNumber,
          resendId: result.resendId,
          status: 'SENT',
          sentAt: now.toISOString(),
        };
        db.emailSends.push(emailSend);

        // Update state
        state.currentEmailNumber = nextEmailNumber;
        
        // Check if campaign is complete
        if (isCampaignComplete(nextEmailNumber)) {
          state.isCompleted = true;
          state.completedAt = now.toISOString();
          results.completed++;
        } else {
          // Schedule next email
          state.nextSendAt = calculateNextSendDate(now).toISOString();
        }
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${subscriber.email}: ${result.error}`);
        
        // Record failed send
        const emailSend: EmailSend = {
          id: `es_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscriberId: state.subscriberId,
          campaignSlug: campaignInfo.slug,
          emailNumber: nextEmailNumber,
          status: 'FAILED',
          failedReason: result.error,
          sentAt: now.toISOString(),
        };
        db.emailSends.push(emailSend);
      }
    }

    // Save all changes
    writeDb(db);

    console.log(`Cron complete: ${results.sent} sent, ${results.failed} failed, ${results.completed} completed campaign`);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process email cron', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger with specific subscriber
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriberEmail, letterNumber } = body;

    if (!subscriberEmail || !letterNumber) {
      return NextResponse.json(
        { error: 'subscriberEmail and letterNumber are required' },
        { status: 400 }
      );
    }

    const db = readDb();
    const subscriber = (db.subscribers || []).find(
      (s: { email: string }) => s.email.toLowerCase() === subscriberEmail.toLowerCase()
    );

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    // Check purchase status
    const hasPurchased = (db.libraryAccess || []).some(
      (access: { userId: string }) => {
        const user = (db.users || []).find((u: { email: string }) => 
          u.email.toLowerCase() === subscriber.email.toLowerCase()
        );
        return user && access.userId === user.id;
      }
    );

    const result = await sendLightOfEollesEmail(
      subscriber.email,
      letterNumber,
      subscriber.firstName,
      hasPurchased
    );

    return NextResponse.json({
      success: result.success,
      resendId: result.resendId,
      error: result.error,
    });
  } catch (error) {
    console.error('Manual send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
