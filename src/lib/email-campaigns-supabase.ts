// Supabase integration for Light of EOLLES email campaigns
import { createClient } from '@supabase/supabase-js';
import { sendLightOfEollesEmail, calculateNextSendDate, isCampaignComplete } from './email-campaigns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

const CAMPAIGN_SLUG = 'light-of-eolles';

interface SubscriberCampaignState {
  id: string;
  subscriber_id: string;
  campaign_slug: string;
  current_email_number: number;
  next_send_at: string;
  is_paused: boolean;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
}

interface EmailSend {
  id: string;
  subscriber_id: string;
  campaign_slug: string;
  email_number: number;
  resend_id?: string;
  status: string;
  sent_at: string;
  failed_reason?: string;
}

// Enroll a new subscriber in the Light of EOLLES campaign
export async function enrollSubscriberInCampaign(
  subscriberId: string,
  subscriberEmail: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Supabase not configured' };
    }

    const now = new Date().toISOString();

    // Create campaign state
    const { error: stateError } = await client
      .from('subscriber_campaign_state')
      .insert({
        subscriber_id: subscriberId,
        campaign_slug: CAMPAIGN_SLUG,
        current_email_number: 0,
        next_send_at: now,
        is_paused: false,
        is_completed: false,
        started_at: now,
      });

    if (stateError) {
      console.error('Failed to create campaign state:', stateError);
      return { success: false, error: stateError.message };
    }

    // Send welcome email (Letter #1)
    const emailResult = await sendLightOfEollesEmail(subscriberEmail, 1, firstName, false);

    if (emailResult.success) {
      // Update campaign state and record send
      const nextSendAt = calculateNextSendDate(new Date()).toISOString();

      await client
        .from('subscriber_campaign_state')
        .update({
          current_email_number: 1,
          next_send_at: nextSendAt,
        })
        .eq('subscriber_id', subscriberId)
        .eq('campaign_slug', CAMPAIGN_SLUG);

      await client
        .from('email_sends')
        .insert({
          subscriber_id: subscriberId,
          campaign_slug: CAMPAIGN_SLUG,
          email_number: 1,
          resend_id: emailResult.resendId,
          status: 'SENT',
          sent_at: now,
        });

      console.log(`Enrolled ${subscriberEmail} in Light of EOLLES and sent welcome email`);
      return { success: true };
    } else {
      console.error(`Failed to send welcome email to ${subscriberEmail}:`, emailResult.error);
      return { success: false, error: emailResult.error };
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Process scheduled emails for all subscribers due for their next letter
export async function processScheduledEmails(): Promise<{
  processed: number;
  sent: number;
  failed: number;
  completed: number;
  errors: string[];
}> {
  const client = getSupabase();
  if (!client) {
    return { processed: 0, sent: 0, failed: 0, completed: 0, errors: ['Supabase not configured'] };
  }

  const now = new Date();
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    completed: 0,
    errors: [] as string[],
  };

  try {
    // Get subscribers due for email using the view
    const { data: dueSubscribers, error: queryError } = await client
      .from('subscribers_due_for_email')
      .select('*');

    if (queryError) {
      results.errors.push(`Query error: ${queryError.message}`);
      return results;
    }

    if (!dueSubscribers || dueSubscribers.length === 0) {
      console.log('No subscribers due for emails');
      return results;
    }

    console.log(`Found ${dueSubscribers.length} subscribers due for Light of EOLLES email`);

    for (const sub of dueSubscribers) {
      results.processed++;

      const nextEmailNumber = sub.current_email_number + 1;

      // Check if subscriber has purchased
      const { data: libraryAccess } = await client
        .from('library_access')
        .select('id')
        .eq('user_id', sub.subscriber_id)
        .limit(1);

      const hasPurchased = libraryAccess && libraryAccess.length > 0;

      // Send the email
      const emailResult = await sendLightOfEollesEmail(
        sub.email,
        nextEmailNumber,
        sub.first_name,
        hasPurchased
      );

      if (emailResult.success) {
        results.sent++;

        // Record the send
        await client.from('email_sends').insert({
          subscriber_id: sub.subscriber_id,
          campaign_slug: CAMPAIGN_SLUG,
          email_number: nextEmailNumber,
          resend_id: emailResult.resendId,
          status: 'SENT',
          sent_at: now.toISOString(),
        });

        // Update campaign state
        const isComplete = isCampaignComplete(nextEmailNumber);
        
        if (isComplete) {
          results.completed++;
          await client
            .from('subscriber_campaign_state')
            .update({
              current_email_number: nextEmailNumber,
              is_completed: true,
              completed_at: now.toISOString(),
            })
            .eq('subscriber_id', sub.subscriber_id)
            .eq('campaign_slug', CAMPAIGN_SLUG);
        } else {
          await client
            .from('subscriber_campaign_state')
            .update({
              current_email_number: nextEmailNumber,
              next_send_at: calculateNextSendDate(now).toISOString(),
            })
            .eq('subscriber_id', sub.subscriber_id)
            .eq('campaign_slug', CAMPAIGN_SLUG);
        }
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${sub.email}: ${emailResult.error}`);

        // Record failed send
        await client.from('email_sends').insert({
          subscriber_id: sub.subscriber_id,
          campaign_slug: CAMPAIGN_SLUG,
          email_number: nextEmailNumber,
          status: 'FAILED',
          failed_reason: emailResult.error,
          sent_at: now.toISOString(),
        });
      }
    }

    console.log(`Processed ${results.sent} emails, ${results.failed} failed, ${results.completed} completed`);
    return results;
  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return results;
  }
}

// Get campaign statistics
export async function getCampaignStats() {
  const client = getSupabase();
  if (!client) {
    return null;
  }

  try {
    const { data: states } = await client
      .from('subscriber_campaign_state')
      .select('*')
      .eq('campaign_slug', CAMPAIGN_SLUG);

    const { data: sends } = await client
      .from('email_sends')
      .select('*')
      .eq('campaign_slug', CAMPAIGN_SLUG);

    const now = new Date();
    const dueCount = states?.filter(
      s => !s.is_paused && !s.is_completed && new Date(s.next_send_at) <= now
    ).length || 0;

    return {
      subscribers: {
        totalEnrolled: states?.length || 0,
        active: states?.filter(s => !s.is_paused && !s.is_completed).length || 0,
        paused: states?.filter(s => s.is_paused).length || 0,
        completed: states?.filter(s => s.is_completed).length || 0,
        dueForEmail: dueCount,
      },
      emails: {
        totalSent: sends?.length || 0,
        byStatus: {
          sent: sends?.filter(s => s.status === 'SENT').length || 0,
          delivered: sends?.filter(s => s.status === 'DELIVERED').length || 0,
          opened: sends?.filter(s => s.status === 'OPENED').length || 0,
          clicked: sends?.filter(s => s.status === 'CLICKED').length || 0,
          bounced: sends?.filter(s => s.status === 'BOUNCED').length || 0,
          failed: sends?.filter(s => s.status === 'FAILED').length || 0,
        },
      },
    };
  } catch (error) {
    console.error('Failed to get campaign stats:', error);
    return null;
  }
}
