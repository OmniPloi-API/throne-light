// Light of EOLLES Email Campaign Service
// Handles sending bi-weekly encouragement emails to subscribers

import { Resend } from 'resend';
import { getLetter, getTotalLetters as getLetterCount } from './email-content/light-of-eolles';

// Re-export for use in other modules
export { getTotalLetters } from './email-content/light-of-eolles';
import { generateLightOfEollesEmail } from './email-templates/light-of-eolles-template';

// Lazy initialization
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'EOLLES <eolles@thronelightpublishing.com>';
const CAMPAIGN_SLUG = 'light-of-eolles';
const EMAIL_FREQUENCY_DAYS = 5; // Changed from 14 to 5 days

export interface SendEmailResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

export interface SubscriberEmailState {
  subscriberId: string;
  email: string;
  firstName?: string;
  currentEmailNumber: number;
  nextSendAt: string;
  hasPurchased: boolean;
}

// Send a specific Light of EOLLES letter to a subscriber
export async function sendLightOfEollesEmail(
  subscriberEmail: string,
  letterNumber: number,
  firstName?: string,
  hasPurchased: boolean = false,
  hasReviewed: boolean = false,
  purchasedDaysAgo?: number
): Promise<SendEmailResult> {
  try {
    const client = getResend();
    if (!client) {
      console.log('Resend not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const letter = getLetter(letterNumber);
    if (!letter) {
      return { success: false, error: `Letter ${letterNumber} not found` };
    }

    // Generate unsubscribe URL
    const unsubscribeToken = Buffer.from(`${subscriberEmail}:${CAMPAIGN_SLUG}`).toString('base64');
    const unsubscribeUrl = `https://thronelightpublishing.com/api/email/unsubscribe?token=${unsubscribeToken}`;

    const html = generateLightOfEollesEmail({
      letter,
      recipientEmail: subscriberEmail,
      firstName,
      hasPurchased,
      hasReviewed,
      purchasedDaysAgo,
      unsubscribeUrl,
    });

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: subscriberEmail,
      subject: `✨ ${letter.subject}`,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (error) {
      console.error(`Failed to send letter ${letterNumber} to ${subscriberEmail}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`Sent Light of EOLLES letter ${letterNumber} to ${subscriberEmail}`);
    return { success: true, resendId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Calculate next send date (every 5 days from now)
export function calculateNextSendDate(fromDate?: Date): Date {
  const date = fromDate || new Date();
  date.setDate(date.getDate() + EMAIL_FREQUENCY_DAYS);
  return date;
}

// Check if subscriber has completed the campaign
export function isCampaignComplete(currentEmailNumber: number): boolean {
  return currentEmailNumber >= getLetterCount();
}

// Get campaign info
export function getCampaignInfo() {
  return {
    slug: CAMPAIGN_SLUG,
    name: 'Light of EOLLES',
    totalEmails: getLetterCount(),
    frequencyDays: EMAIL_FREQUENCY_DAYS,
  };
}
