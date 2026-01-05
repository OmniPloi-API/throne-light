import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, bookId, currentSection, currentPage, sessionId } = body;

    if (!userId || !bookId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Get IP and user agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // If sessionId provided, update existing session
    if (sessionId) {
      const { error } = await supabase
        .from('active_reader_sessions')
        .update({
          last_heartbeat: new Date().toISOString(),
          current_section: currentSection,
          current_page: currentPage,
          is_active: true
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating heartbeat:', error);
      }

      return NextResponse.json({ sessionId, status: 'updated' });
    }

    // Create new session
    const { data, error } = await supabase
      .from('active_reader_sessions')
      .insert({
        user_id: userId,
        email: email || null,
        ip_address: ip,
        user_agent: userAgent,
        book_id: bookId,
        current_section: currentSection,
        current_page: currentPage || 1,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Log activity
    await supabase.from('reader_activity_log').insert({
      user_id: userId,
      email: email || null,
      ip_address: ip,
      book_id: bookId,
      action: 'start',
      section_id: currentSection,
      page_number: currentPage || 1
    });

    return NextResponse.json({ sessionId: data.id, status: 'created' });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// End session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Mark session as inactive
    const { data: session } = await supabase
      .from('active_reader_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .select()
      .single();

    // Log end activity
    if (session) {
      await supabase.from('reader_activity_log').insert({
        user_id: session.user_id,
        email: session.email,
        ip_address: session.ip_address,
        book_id: session.book_id,
        action: 'end',
        section_id: session.current_section,
        page_number: session.current_page
      });
    }

    return NextResponse.json({ status: 'ended' });
  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
