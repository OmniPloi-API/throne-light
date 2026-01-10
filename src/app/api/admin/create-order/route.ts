// Admin endpoint to manually create an order (for testing/fixing missing orders)
import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db-supabase';
import { requireAdminAuth } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    
    const { 
      partnerId,
      stripeSessionId,
      stripeChargeId,
      totalAmount,
      commissionEarned = 0,
      customerEmail,
      customerName,
    } = body;

    if (!totalAmount) {
      return NextResponse.json({ error: 'totalAmount is required' }, { status: 400 });
    }

    // Calculate maturity date (16 days from now)
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + 16);

    const order = await createOrder({
      partnerId: partnerId || undefined,
      stripeSessionId: stripeSessionId || `manual_${Date.now()}`,
      stripeChargeId: stripeChargeId || undefined,
      stripePaymentIntentId: stripeChargeId || undefined,
      totalAmount: parseFloat(totalAmount),
      commissionEarned: parseFloat(commissionEarned),
      customerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
      status: 'COMPLETED',
      maturityDate: maturityDate.toISOString(),
      isMatured: false,
      refundStatus: 'NONE',
    });

    return NextResponse.json({ 
      success: true, 
      order,
      message: `Order created successfully with ID: ${order.id}`
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }, { status: 500 });
  }
}
