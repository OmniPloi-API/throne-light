// Debug endpoint to check Supabase connectivity - DELETE AFTER DEBUGGING
import { NextResponse } from 'next/server';

interface SupabaseDiagnostics {
  connected: boolean;
  ordersTableExists: boolean;
  orderCount: number;
  error: string | null;
}

export async function GET() {
  const supabaseDiag: SupabaseDiagnostics = { 
    connected: false, 
    ordersTableExists: false, 
    orderCount: 0, 
    error: null 
  };

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    
    supabaseDiag.connected = true;

    const { error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      supabaseDiag.error = error.message;
      supabaseDiag.ordersTableExists = false;
    } else {
      supabaseDiag.ordersTableExists = true;
      supabaseDiag.orderCount = count || 0;
    }
  } catch (e) {
    supabaseDiag.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY_SET: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_WEBHOOK_SECRET_SET: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    supabase: supabaseDiag,
  });
}
