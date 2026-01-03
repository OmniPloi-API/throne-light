import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import { calculateNetPayout, getMinWithdrawal } from '@/lib/payout-calculator';

export async function POST(req: NextRequest) {
  try {
    const { partnerId, amount } = await req.json();
    
    if (!partnerId || !amount) {
      return NextResponse.json({ 
        error: 'Partner ID and amount are required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const partner = db.partners.find(p => p.id === partnerId);
    
    if (!partner) {
      return NextResponse.json({ 
        error: 'Partner not found' 
      }, { status: 404 });
    }
    
    // Check if partner is FLAT_FEE (no payouts)
    if (partner.partnerType === 'FLAT_FEE') {
      return NextResponse.json({ 
        error: 'Flat-fee partners are not eligible for commission payouts.' 
      }, { status: 400 });
    }
    
    // HARD STOP: Check tax form verification
    if (!partner.taxFormVerified) {
      return NextResponse.json({ 
        error: 'Payouts are blocked. Please complete your tax form (W-9 or W-8BEN) in the Stripe Connect portal first.',
        requiresOnboarding: true,
      }, { status: 403 });
    }
    
    // HARD STOP: Check Stripe Connect onboarding
    if (!partner.stripeOnboardingComplete || !partner.stripeAccountId) {
      return NextResponse.json({ 
        error: 'Please complete your Stripe Connect setup to receive payouts.',
        requiresOnboarding: true,
      }, { status: 403 });
    }
    
    // Get country and calculate minimum withdrawal
    const countryCode = partner.country || 'US';
    const minWithdrawal = getMinWithdrawal(countryCode);
    
    if (amount < minWithdrawal) {
      return NextResponse.json({ 
        error: `Minimum withdrawal for your region is $${minWithdrawal.toFixed(2)}.` 
      }, { status: 400 });
    }
    
    // Calculate available balance (matured commissions only)
    const now = new Date();
    const partnerOrders = db.orders.filter(o => 
      o.partnerId === partnerId && 
      o.status === 'COMPLETED' && 
      o.refundStatus !== 'APPROVED'
    );
    
    // Get matured orders (past 16 days)
    const maturedOrders = partnerOrders.filter((o: any) => {
      const createdAt = new Date(o.createdAt);
      const maturityDate = new Date(createdAt.getTime() + 16 * 24 * 60 * 60 * 1000);
      return now >= maturityDate;
    });
    
    const maturedCommission = maturedOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
    
    // Calculate click bounty (instant, no maturity)
    const events = db.events.filter(e => e.partnerId === partnerId);
    const amazonClicks = events.filter(e => e.type === 'CLICK_AMAZON').length;
    const bookBabyClicks = events.filter(e => e.type === 'CLICK_BOOKBABY').length;
    const clickBountyEarned = (amazonClicks + bookBabyClicks) * (partner.clickBounty || 0.10);
    
    const availableBalance = maturedCommission + clickBountyEarned;
    
    // Check for pending withdrawal requests
    const pendingRequests = db.withdrawalRequests.filter(
      w => w.partnerId === partnerId && (w.status === 'PENDING' || w.status === 'APPROVED')
    );
    const pendingAmount = pendingRequests.reduce((sum, w) => sum + w.amountRequested, 0);
    
    const actualAvailable = availableBalance - pendingAmount;
    
    if (amount > actualAvailable) {
      return NextResponse.json({ 
        error: `Insufficient available balance. Available: $${actualAvailable.toFixed(2)}` 
      }, { status: 400 });
    }
    
    // Calculate net payout with fees
    const payoutCalc = calculateNetPayout(
      amount,
      countryCode,
      partner.lastPayoutMonth
    );
    
    if (payoutCalc.error) {
      return NextResponse.json({ 
        error: payoutCalc.error 
      }, { status: 400 });
    }
    
    // Create withdrawal request with full fee breakdown
    const withdrawalRequest = {
      id: generateId(),
      partnerId,
      amountRequested: payoutCalc.amountRequested,
      payoutFee: payoutCalc.payoutFee,
      monthlyFee: payoutCalc.monthlyFee,
      crossBorderFee: payoutCalc.crossBorderFee,
      totalFees: payoutCalc.totalFees,
      amountToDeposit: payoutCalc.amountToDeposit,
      status: 'PENDING' as const,
      payoutMethod: partner.payoutMethod || 'STRIPE',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    db.withdrawalRequests.push(withdrawalRequest);
    writeDb(db);
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Please allow 2-3 business days for processing.',
      request: withdrawalRequest,
      feeBreakdown: {
        amountRequested: payoutCalc.amountRequested,
        payoutFee: payoutCalc.payoutFee,
        monthlyFee: payoutCalc.monthlyFee,
        crossBorderFee: payoutCalc.crossBorderFee,
        totalFees: payoutCalc.totalFees,
        amountToDeposit: payoutCalc.amountToDeposit,
      },
    });
    
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Get withdrawal requests for a partner
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    
    if (!partnerId) {
      return NextResponse.json({ 
        error: 'Partner ID is required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const requests = db.withdrawalRequests.filter(w => w.partnerId === partnerId);
    
    return NextResponse.json(requests);
    
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
