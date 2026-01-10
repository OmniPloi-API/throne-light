// Admin endpoint to clean up duplicate orders
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get all orders
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, stripe_session_id, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Find duplicates (keep first, delete rest)
    const seen = new Map<string, string>();
    const duplicateIds: string[] = [];

    for (const order of orders || []) {
      const sessionId = order.stripe_session_id;
      if (seen.has(sessionId)) {
        duplicateIds.push(order.id);
      } else {
        seen.set(sessionId, order.id);
      }
    }

    if (duplicateIds.length === 0) {
      return NextResponse.json({ message: 'No duplicates found', deleted: 0 });
    }

    // Delete duplicates
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .in('id', duplicateIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${duplicateIds.length} duplicate orders`,
      deleted: duplicateIds.length,
      deletedIds: duplicateIds,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
