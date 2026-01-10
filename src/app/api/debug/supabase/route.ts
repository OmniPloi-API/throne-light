// Debug endpoint to check Supabase connectivity - DELETE AFTER DEBUGGING
import { NextResponse } from 'next/server';

interface SupabaseDiagnostics {
  connected: boolean;
  ordersTableExists: boolean;
  orderCount: number;
  error: string | null;
  testInsertError: string | null;
  tableColumns: string[] | null;
}

export async function GET() {
  const supabaseDiag: SupabaseDiagnostics = { 
    connected: false, 
    ordersTableExists: false, 
    orderCount: 0, 
    error: null,
    testInsertError: null,
    tableColumns: null,
  };

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    
    supabaseDiag.connected = true;

    // Check if orders table exists and get count
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

    // Test insert with a fake order to see what error we get
    const { v4: uuidv4 } = await import('uuid');
    const testOrderId = uuidv4();
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + 16);
    
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        id: testOrderId,
        stripe_session_id: 'test_session_' + Date.now(),
        total_amount: 29.99,
        commission_earned: 0,
        customer_email: 'test@debug.com',
        status: 'COMPLETED',
        maturity_date: maturityDate.toISOString(),
        is_matured: false,
        refund_status: 'NONE',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      supabaseDiag.testInsertError = `${insertError.message} (code: ${insertError.code}, details: ${insertError.details})`;
    } else {
      // Clean up test order
      await supabase.from('orders').delete().eq('id', testOrderId);
      supabaseDiag.testInsertError = 'SUCCESS - test order created and deleted';
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
