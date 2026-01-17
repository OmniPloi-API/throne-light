import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return null;
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

// AI Triage - Categorize and analyze support tickets
interface TriageResult {
  category: 'reader_issue' | 'billing_refund' | 'technical' | 'content_feedback' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresHumanReview: boolean;
  suggestedResponse: string | null;
  aiAnalysis: string;
}

function triageTicket(message: string, email: string): TriageResult {
  const lowerMessage = message.toLowerCase();
  
  // Billing/Refund keywords - highest priority
  const billingKeywords = ['refund', 'charged', 'payment', 'money', 'billing', 'credit card', 'transaction', 'purchase', 'order', 'receipt', 'charged twice', 'double charge', 'cancel order'];
  const hasBillingIssue = billingKeywords.some(kw => lowerMessage.includes(kw));
  
  // Technical/Reader issue keywords
  const technicalKeywords = ['not working', 'error', 'crash', 'bug', 'broken', 'can\'t open', 'won\'t load', 'black screen', 'frozen', 'stuck', 'glitch', 'doesn\'t work'];
  const hasTechnicalIssue = technicalKeywords.some(kw => lowerMessage.includes(kw));
  
  // Navigation/How-to keywords - can be auto-responded
  const howToKeywords = ['how do i', 'how to', 'where is', 'can\'t find', 'navigate', 'bookmark', 'font size', 'dark mode', 'language', 'translation'];
  const isHowTo = howToKeywords.some(kw => lowerMessage.includes(kw));
  
  // Content feedback keywords
  const contentKeywords = ['offended', 'offensive', 'disagree', 'upset', 'content', 'chapter', 'story', 'written', 'author'];
  const isContentFeedback = contentKeywords.some(kw => lowerMessage.includes(kw));
  
  // Urgent keywords
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'lawsuit', 'legal'];
  const isUrgent = urgentKeywords.some(kw => lowerMessage.includes(kw));
  
  // Determine category and priority
  let category: TriageResult['category'] = 'general';
  let priority: TriageResult['priority'] = 'low';
  let requiresHumanReview = false;
  let suggestedResponse: string | null = null;
  let aiAnalysis = '';
  
  if (hasBillingIssue) {
    category = 'billing_refund';
    priority = isUrgent ? 'urgent' : 'high';
    requiresHumanReview = true;
    aiAnalysis = 'Billing/refund related issue detected. Requires human review to verify transaction details and process any refunds if applicable. Check Stripe dashboard for transaction history.';
  } else if (hasTechnicalIssue) {
    category = 'technical';
    priority = 'medium';
    requiresHumanReview = true;
    aiAnalysis = 'Technical issue reported. Review device info to diagnose. May require development team attention if widespread.';
  } else if (isContentFeedback) {
    category = 'content_feedback';
    priority = 'medium';
    requiresHumanReview = true;
    aiAnalysis = 'Content-related feedback. Handle with empathy and compassion. The reader may be processing emotional content.';
    suggestedResponse = `Thank you for sharing your thoughts with us. We understand that "The Crowded Bed & The Empty Throne" addresses deeply personal topics that can evoke strong emotions. Your perspective is valued, and we appreciate you taking the time to reach out. If you'd like to discuss further, please don't hesitate to reply to this email.`;
  } else if (isHowTo) {
    category = 'reader_issue';
    priority = 'low';
    requiresHumanReview = false;
    aiAnalysis = 'Navigation/how-to question. Can likely be resolved with reader guide instructions.';
    suggestedResponse = generateHowToResponse(lowerMessage);
  } else {
    category = 'general';
    priority = 'low';
    requiresHumanReview = false;
    aiAnalysis = 'General inquiry. Review and respond within standard timeframe.';
  }
  
  if (isUrgent && !hasBillingIssue) {
    priority = 'high';
    requiresHumanReview = true;
  }
  
  return { category, priority, requiresHumanReview, suggestedResponse, aiAnalysis };
}

function generateHowToResponse(message: string): string {
  if (message.includes('bookmark')) {
    return `To bookmark a page in the Throne Light Reader:\n\n1. While reading, tap the bookmark icon (🔖) in the top navigation bar\n2. The page will be saved to your bookmarks\n3. Access your bookmarks anytime from the Menu\n\nIf you have any other questions, we're here to help!`;
  }
  if (message.includes('dark mode') || message.includes('light mode')) {
    return `To switch between dark and light mode:\n\n1. Look for the sun/moon icon (☀️/🌙) in the top right corner of the reader\n2. Tap it to toggle between modes\n\nYour preference will be remembered for future reading sessions!`;
  }
  if (message.includes('font') || message.includes('text size')) {
    return `To adjust the text size:\n\n1. Open the Menu using the three-line icon\n2. Look for the font size controls\n3. Tap + or - to increase or decrease the text size\n\nFind a size that's comfortable for you!`;
  }
  if (message.includes('language') || message.includes('translation')) {
    return `To change the reader language:\n\n1. Look for the language selector (flag icon) in the top navigation\n2. Click/tap to see available languages\n3. Select your preferred language\n\nNote: Translation may take a moment to process.`;
  }
  if (message.includes('navigate') || message.includes('menu') || message.includes('chapters')) {
    return `To navigate the book:\n\n1. Tap "Menu" in the top left to open the table of contents\n2. You can jump to any chapter or section\n3. Use the left/right arrows or swipe to move between pages\n4. "My Library" takes you back to your book collection\n\nHappy reading!`;
  }
  return `Thank you for reaching out! Here are some quick tips for using the Throne Light Reader:\n\n• Menu - Access table of contents and navigation\n• My Library - Return to your book collection\n• FAQs - Find answers to common questions\n• Bookmark icon - Save your place\n• Sun/Moon icon - Toggle dark/light mode\n\nIf you need more specific help, please let us know what you're trying to do!`;
}

// Send acknowledgment email
async function sendAcknowledgmentEmail(email: string, ticketId: string, category: string) {
  const responseTime = category === 'billing_refund' ? '24-48 hours' : '48-72 hours';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Georgia', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #111 0%, #1a1a1a 100%); border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <h1 style="margin: 0; color: #c9a961; font-size: 24px; font-weight: 600;">
                We've Received Your Message
              </h1>
              <p style="margin: 10px 0 0; color: #888; font-size: 14px;">
                Throne Light Reader Support
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #e8e8e8; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Thank you for reaching out to us.
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
                Your support request has been received and assigned ticket number:
              </p>
              <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; color: #c9a961; font-size: 18px; font-family: monospace; font-weight: bold;">
                  #${ticketId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                Our team will review your message and respond within <strong style="color: #c9a961;">${responseTime}</strong>.
              </p>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #2a2a2a;">
                If you have additional information to share, simply reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; color: #555; font-size: 12px;">
                © ${new Date().getFullYear()} Throne Light Publishing. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Throne Light Support <support@thronelightpublishing.com>',
        to: email,
        subject: 'We\'ve Received Your Support Request - Throne Light Publishing',
        html,
      }),
    });
  } catch (error) {
    console.error('Failed to send acknowledgment email:', error);
  }
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  currentPage: number;
  totalPages: number;
  currentSection: string;
  isDarkMode: boolean;
  selectedLanguage: string;
  audioEnabled: boolean;
}

interface SupportRequest {
  email: string;
  message: string;
  deviceInfo: DeviceInfo;
}

// Parse browser from user agent
function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
}

// Parse OS from user agent
function parseOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}

export async function POST(request: Request) {
  try {
    const body: SupportRequest = await request.json();
    const { email, message, deviceInfo } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Parse device info into readable format
    const browser = parseBrowser(deviceInfo.userAgent);
    const os = parseOS(deviceInfo.userAgent);
    const deviceType = deviceInfo.isMobile ? 'Mobile' : 'Desktop';
    
    // AI Triage - categorize and analyze the ticket
    const triage = triageTicket(message, email);

    const db = getSupabase();
    if (!db) {
      // Return success anyway to not block user
      return NextResponse.json({ success: true, ticketId: 'pending-no-db' });
    }

    // Insert into database with triage data
    const { data, error } = await db
      .from('reader_support_tickets')
      .insert({
        email,
        message,
        browser,
        os,
        device_type: deviceType,
        screen_resolution: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
        viewport_size: `${deviceInfo.viewportWidth}x${deviceInfo.viewportHeight}`,
        current_page: deviceInfo.currentPage,
        total_pages: deviceInfo.totalPages,
        current_section: deviceInfo.currentSection,
        is_dark_mode: deviceInfo.isDarkMode,
        selected_language: deviceInfo.selectedLanguage,
        audio_enabled: deviceInfo.audioEnabled,
        user_agent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        browser_language: deviceInfo.language,
        status: 'open',
        category: triage.category,
        priority: triage.priority,
        requires_human_review: triage.requiresHumanReview,
        ai_analysis: triage.aiAnalysis,
        suggested_response: triage.suggestedResponse,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      // Still return success to user even if DB fails
      return NextResponse.json({ success: true, ticketId: 'pending' });
    }
    
    // Send acknowledgment email to user
    if (data?.id) {
      sendAcknowledgmentEmail(email, data.id, triage.category);
    }

    return NextResponse.json({ 
      success: true, 
      ticketId: data?.id || 'created' 
    });
  } catch (error) {
    console.error('Support request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit support request' },
      { status: 500 }
    );
  }
}

// GET - Admin only: fetch all support tickets
export async function GET(request: Request) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ tickets: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = db
      .from('reader_support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json({ tickets: [] });
    }

    return NextResponse.json({ tickets: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ tickets: [] });
  }
}

// PATCH - Update ticket status
export async function PATCH(request: Request) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ticketId, status, adminNotes } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'Ticket ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { 
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await db
      .from('reader_support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
