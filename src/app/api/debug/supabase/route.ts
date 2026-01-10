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

    // Test insert using the EXACT same flow as the webhook's createOrder function
    const { createOrder } = await import('@/lib/db-supabase');
    
    try {
      const maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + 16);
      
      // This mimics exactly what the webhook passes
      const order = await createOrder({
        partnerId: undefined, // Direct sale, no partner
        stripeSessionId: 'test_webhook_' + Date.now(),
        stripeChargeId: 'pi_test_' + Date.now(),
        stripePaymentIntentId: 'pi_test_' + Date.now(),
        totalAmount: 29.99,
        commissionEarned: 0,
        customerEmail: 'test@debug.com',
        customerName: 'Debug Test',
        status: 'COMPLETED',
        maturityDate: maturityDate.toISOString(),
        isMatured: false,
        refundStatus: 'NONE',
      });
      
      // Clean up test order
      await supabase.from('orders').delete().eq('id', order.id);
      supabaseDiag.testInsertError = `SUCCESS via createOrder - id: ${order.id}, amount: ${order.totalAmount}`;
    } catch (e) {
      supabaseDiag.testInsertError = `createOrder FAILED: ${e instanceof Error ? e.message : String(e)}`;
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
