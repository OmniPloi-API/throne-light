import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Create Stripe Connect Express onboarding link for a partner
 * POST /api/partners/stripe-connect
 */
export async function POST(req: NextRequest) {
  try {
    const { partnerId, returnUrl, refreshUrl } = await req.json();
    
    if (!partnerId) {
      return NextResponse.json({ 
        error: 'Partner ID is required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const partner = db.partners.find(p => p.id === partnerId);
    
    if (!partner) {
      return NextResponse.json({ 
        error: 'Partner not found' 
      }, { status: 404 });
    }
    
    // Check if partner already has a Stripe account
    let stripeAccountId = partner.stripeAccountId;
    
    if (!stripeAccountId) {
      // Create new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: partner.country || 'US',
        email: partner.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          partner_id: partnerId,
          partner_name: partner.name,
        },
      });
      
      stripeAccountId = account.id;
      
      // Save Stripe account ID to partner
      partner.stripeAccountId = stripeAccountId;
      writeDb(db);
      
      console.log(`Created Stripe Connect account ${stripeAccountId} for partner ${partner.name}`);
    }
    
    // Create onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl || `${baseUrl}/partner?stripe_refresh=true`,
      return_url: returnUrl || `${baseUrl}/partner?stripe_success=true`,
      type: 'account_onboarding',
      collect: 'eventually_due', // Collect tax info upfront
    });
    
    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      stripeAccountId,
    });
    
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create Stripe Connect link' 
    }, { status: 500 });
  }
}

/**
 * Check Stripe Connect account status
 * GET /api/partners/stripe-connect?partnerId=xxx
 */
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
    const partner = db.partners.find(p => p.id === partnerId);
    
    if (!partner) {
      return NextResponse.json({ 
        error: 'Partner not found' 
      }, { status: 404 });
    }
    
    if (!partner.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        taxFormVerified: false,
        message: 'Stripe Connect not set up yet',
      });
    }
    
    // Fetch account status from Stripe
    const account = await stripe.accounts.retrieve(partner.stripeAccountId);
    
    const onboardingComplete = account.details_submitted && account.charges_enabled;
    const taxFormVerified = account.requirements?.currently_due?.length === 0 || 
      !account.requirements?.currently_due?.some(r => r.includes('tax'));
    
    // Update partner record if status changed
    let updated = false;
    if (partner.stripeOnboardingComplete !== onboardingComplete) {
      partner.stripeOnboardingComplete = onboardingComplete;
      updated = true;
    }
    if (partner.taxFormVerified !== taxFormVerified) {
      partner.taxFormVerified = taxFormVerified;
      updated = true;
    }
    if (updated) {
      writeDb(db);
    }
    
    return NextResponse.json({
      connected: true,
      stripeAccountId: partner.stripeAccountId,
      onboardingComplete,
      taxFormVerified,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
    });
    
  } catch (error: any) {
    console.error('Stripe Connect status error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check Stripe Connect status' 
    }, { status: 500 });
  }
}
