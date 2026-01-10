// Admin endpoint to convert all PENDING_SALE events to SALE
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Find all PENDING_SALE events
    const { data: pendingEvents, error: findError } = await supabase
      .from('tracking_events')
      .select('id, partner_id, created_at')
      .eq('event_type', 'PENDING_SALE');

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      return NextResponse.json({ message: 'No PENDING_SALE events found', converted: 0 });
    }

    // Update all to SALE
    const { error: updateError } = await supabase
      .from('tracking_events')
      .update({ event_type: 'SALE' })
      .eq('event_type', 'PENDING_SALE');

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Converted ${pendingEvents.length} PENDING_SALE events to SALE`,
      converted: pendingEvents.length,
      eventIds: pendingEvents.map(e => e.id),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
