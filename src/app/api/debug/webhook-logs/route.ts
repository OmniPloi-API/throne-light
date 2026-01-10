// Debug endpoint to view webhook logs
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message, logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e), logs: [] });
  }
}
