import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/adminAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Get all pending refund requests
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const db = readDb();
    
    // Get orders with pending refund status
    const pendingRefunds = db.orders.filter(o => 
      o.refundStatus === 'VERIFIED_PENDING' || 
      o.refundStatus === 'REQUESTED'
    );
    
    // Enrich with partner info
    const enrichedRefunds = pendingRefunds.map(order => {
      const partner = db.partners.find(p => p.id === order.partnerId);
      return {
        ...order,
        partnerName: partner?.name || 'Direct Sale',
        partnerEmail: partner?.email,
      };
    });
    
    return NextResponse.json(enrichedRefunds);
  } catch (error) {
    console.error('Get refunds error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Approve or reject a refund
export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const { orderId, action, reason } = await req.json();
    
    if (!orderId || !action) {
      return NextResponse.json({ 
        error: 'Order ID and action are required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const order = db.orders.find(o => o.id === orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if already disputed - don't allow refund
    if (order.refundStatus === 'DISPUTED') {
      return NextResponse.json({ 
        error: 'Cannot process refund - active chargeback detected. Handle in Stripe dashboard.' 
      }, { status: 400 });
    }
    
    if (action === 'approve') {
      // Execute refund via Stripe
      try {
        if (order.stripePaymentIntentId) {
          await stripe.refunds.create({
            payment_intent: order.stripePaymentIntentId,
          });
        } else if (order.stripeChargeId) {
          await stripe.refunds.create({
            charge: order.stripeChargeId,
          });
        }
        
        // Update order status
        order.status = 'REFUNDED';
        order.refundStatus = 'APPROVED';
        order.refundApprovedAt = new Date().toISOString();
        
        writeDb(db);
        
        console.log(`Refund approved and executed for order ${orderId}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Refund approved and processed via Stripe' 
        });
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        return NextResponse.json({ 
          error: `Stripe error: ${stripeError.message}` 
        }, { status: 500 });
      }
    } else if (action === 'reject') {
      order.refundStatus = 'REJECTED';
      order.refundRejectedAt = new Date().toISOString();
      order.refundReason = reason || 'Refund request denied by administrator';
      
      writeDb(db);
      
      console.log(`Refund rejected for order ${orderId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Refund request rejected' 
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Refund action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
