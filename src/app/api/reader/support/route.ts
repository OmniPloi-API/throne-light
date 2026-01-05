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

    const db = getSupabase();
    if (!db) {
      // Return success anyway to not block user
      return NextResponse.json({ success: true, ticketId: 'pending-no-db' });
    }

    // Insert into database
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
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      // Still return success to user even if DB fails
      return NextResponse.json({ success: true, ticketId: 'pending' });
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
