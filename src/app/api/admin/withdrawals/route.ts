import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/adminAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Get all withdrawal requests
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const db = readDb();
    
    // Enrich withdrawal requests with partner info
    const enrichedRequests = db.withdrawalRequests.map(req => {
      const partner = db.partners.find(p => p.id === req.partnerId);
      return {
        ...req,
        partnerName: partner?.name || 'Unknown',
        partnerEmail: partner?.email || 'Unknown',
        partnerCountry: partner?.country || 'US',
        stripeAccountId: partner?.stripeAccountId,
      };
    });
    
    // Sort by status and date
    enrichedRequests.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
    
    return NextResponse.json(enrichedRequests);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Approve or reject a withdrawal request
export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const { requestId, action, notes } = await req.json();
    
    if (!requestId || !action) {
      return NextResponse.json({ 
        error: 'Request ID and action are required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const request = db.withdrawalRequests.find(r => r.id === requestId);
    
    if (!request) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }
    
    if (request.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Request has already been processed' 
      }, { status: 400 });
    }
    
    const partner = db.partners.find(p => p.id === request.partnerId);
    
    if (action === 'approve') {
      request.status = 'APPROVED';
      request.approvedAt = new Date().toISOString();
      request.adminNotes = notes;
      
      // Try to execute Stripe transfer if partner has Stripe account
      if (partner?.stripeAccountId && request.payoutMethod === 'STRIPE') {
        try {
          // Transfer the NET amount (after fees) to partner's Stripe Connect account
          const transfer = await stripe.transfers.create({
            amount: Math.round(request.amountToDeposit * 100), // Convert to cents
            currency: 'usd',
            destination: partner.stripeAccountId,
            metadata: {
              withdrawal_request_id: request.id,
              partner_id: partner.id,
              gross_amount: request.amountRequested.toString(),
              fees_deducted: request.totalFees.toString(),
            },
          });
          
          request.stripeTransferId = transfer.id;
          request.status = 'PAID';
          request.paidAt = new Date().toISOString();
          
          // Update partner's lastPayoutMonth to track monthly fee
          partner.lastPayoutMonth = new Date().toISOString().slice(0, 7);
          
          console.log(`Stripe transfer ${transfer.id} completed: $${request.amountToDeposit} to ${partner.name}`);
        } catch (stripeError: any) {
          console.error('Stripe transfer error:', stripeError);
          request.status = 'FAILED';
          request.failedAt = new Date().toISOString();
          request.failureReason = stripeError.message;
        }
      }
      
      writeDb(db);
      
      return NextResponse.json({ 
        success: true, 
        message: request.status === 'PAID' 
          ? `Payment of $${request.amountToDeposit.toFixed(2)} sent to ${partner?.name} via Stripe Connect.`
          : `Withdrawal approved for ${partner?.name}. Process payout manually.`,
        request,
      });
    } else if (action === 'reject') {
      request.status = 'REJECTED';
      request.rejectedAt = new Date().toISOString();
      request.adminNotes = notes || 'Withdrawal request denied';
      
      writeDb(db);
      
      console.log(`Withdrawal rejected for partner ${partner?.name}: ${notes}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal request rejected' 
      });
    } else if (action === 'mark_paid') {
      if (request.status === 'PENDING' || request.status === 'REJECTED') {
        return NextResponse.json({ 
          error: 'Request must be approved before marking as paid' 
        }, { status: 400 });
      }
      
      request.status = 'PAID';
      request.paidAt = new Date().toISOString();
      request.adminNotes = notes || 'Payment completed manually';
      
      // Update partner's lastPayoutMonth
      if (partner) {
        partner.lastPayoutMonth = new Date().toISOString().slice(0, 7);
      }
      
      writeDb(db);
      
      console.log(`Withdrawal of $${request.amountToDeposit} marked as paid for partner ${partner?.name}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `Payment of $${request.amountToDeposit.toFixed(2)} marked as complete` 
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Withdrawal action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
