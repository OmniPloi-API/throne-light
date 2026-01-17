import { NextRequest, NextResponse } from 'next/server';
import { getPartnerById, updatePartner } from '@/lib/db-supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * STRIPE CONNECT SERVICE AGREEMENT TYPES
 * 
 * Countries with FULL Stripe support use 'full' agreement:
 * - Can process card payments directly
 * - Full Stripe Dashboard access
 * 
 * Countries requiring RECIPIENT agreement (cross-border payouts):
 * - Cannot process payments directly
 * - Receive transfers from platform only
 * - Uses Global Payouts for cross-border transfers
 * - 24-hour additional delay on transfers
 * 
 * Reference: https://stripe.com/docs/connect/service-agreement-types
 */

// Countries that have FULL Stripe support (can use 'full' service agreement)
const FULL_SUPPORT_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 
  'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
  'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'NZ', 'SG', 'HK', 
  'JP', 'MY', 'MX', 'BR', 'AE', 'TH', 'IN'
];

// Determine which service agreement type to use based on country
function getServiceAgreementType(countryCode: string): 'full' | 'recipient' {
  const normalizedCountry = countryCode?.toUpperCase() || 'US';
  return FULL_SUPPORT_COUNTRIES.includes(normalizedCountry) ? 'full' : 'recipient';
}

// Check if country requires recipient agreement (cross-border payouts)
function requiresRecipientAgreement(countryCode: string): boolean {
  return getServiceAgreementType(countryCode) === 'recipient';
}

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
    
    // Use Supabase to find partner
    const partner = await getPartnerById(partnerId);
    
    if (!partner) {
      return NextResponse.json({ 
        error: 'Partner not found' 
      }, { status: 404 });
    }
    
    // Check if partner already has a Stripe account
    let stripeAccountId = partner.stripeAccountId;
    
    if (!stripeAccountId) {
      const country = partner.country || 'US';
      const serviceAgreement = getServiceAgreementType(country);
      const isRecipient = serviceAgreement === 'recipient';
      
      console.log(`Creating Stripe account for ${partner.name} in ${country} with ${serviceAgreement} agreement`);
      
      // Create Stripe Connect account with appropriate service agreement
      // For recipient countries (like Nigeria), we use Custom account type
      // For full support countries, we use Express account type
      const accountParams: Stripe.AccountCreateParams = isRecipient ? {
        // RECIPIENT AGREEMENT (for countries like Nigeria)
        // - Cannot process payments, only receive transfers
        // - Uses cross-border/global payouts
        type: 'custom',
        country,
        email: partner.email,
        capabilities: {
          transfers: { requested: true },
        },
        tos_acceptance: {
          service_agreement: 'recipient',
        },
        controller: {
          stripe_dashboard: { type: 'none' },
          fees: { payer: 'application' },
          losses: { payments: 'application' },
          requirement_collection: 'application',
        },
        business_type: 'individual',
        metadata: {
          partner_id: partnerId,
          partner_name: partner.name,
          service_agreement: 'recipient',
          country,
        },
      } : {
        // FULL AGREEMENT (for US, UK, etc.)
        // - Can process card payments
        // - Full Stripe Dashboard access
        type: 'express',
        country,
        email: partner.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          partner_id: partnerId,
          partner_name: partner.name,
          service_agreement: 'full',
          country,
        },
      };
      
      const account = await stripe.accounts.create(accountParams);
      
      stripeAccountId = account.id;
      
      // Save Stripe account ID to partner via Supabase
      await updatePartner(partnerId, { stripeAccountId });
      
      console.log(`Created Stripe Connect account ${stripeAccountId} for partner ${partner.name}`);
    }
    
    // Create onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const country = partner.country || 'US';
    const isRecipient = requiresRecipientAgreement(country);
    
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl || `${baseUrl}/partner?stripe_refresh=true`,
      return_url: returnUrl || `${baseUrl}/partner?stripe_success=true`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });
    
    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      stripeAccountId,
      accountType: isRecipient ? 'recipient' : 'full',
      country,
      // Helpful info for recipient accounts
      ...(isRecipient && {
        notice: 'Your country uses cross-border payouts. Transfers may take an additional 24 hours to process.',
        helpLinks: {
          serviceAgreement: 'https://stripe.com/connect-account/legal/recipient',
          crossBorderInfo: 'https://stripe.com/docs/connect/account-capabilities#transfers-cross-border',
        },
      }),
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
    
    // Use Supabase to find partner
    const partner = await getPartnerById(partnerId);
    
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
    
    // Determine account type from metadata or country
    const isRecipient = account.metadata?.service_agreement === 'recipient' || 
                        requiresRecipientAgreement(partner.country || 'US');
    
    // For recipient accounts, they can't process charges - only receive transfers
    // So we check details_submitted and payouts_enabled instead
    const onboardingComplete = isRecipient 
      ? account.details_submitted === true
      : (account.details_submitted && account.charges_enabled);
      
    const taxFormVerified = account.requirements?.currently_due?.length === 0 || 
      !account.requirements?.currently_due?.some(r => r.includes('tax'));
    
    // Update partner record if status changed via Supabase
    if (partner.stripeOnboardingComplete !== onboardingComplete || partner.taxFormVerified !== taxFormVerified) {
      await updatePartner(partnerId, {
        stripeOnboardingComplete: onboardingComplete,
        taxFormVerified,
      });
    }
    
    return NextResponse.json({
      connected: true,
      stripeAccountId: partner.stripeAccountId,
      accountType: isRecipient ? 'recipient' : 'full',
      onboardingComplete,
      taxFormVerified,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      transfersEnabled: true, // All accounts can receive transfers
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
      // Extra info for recipient accounts
      ...(isRecipient && {
        notice: 'Cross-border payout account. Transfers take 24 additional hours.',
        helpLinks: {
          serviceAgreement: 'https://stripe.com/connect-account/legal/recipient',
          crossBorderInfo: 'https://stripe.com/docs/connect/account-capabilities#transfers-cross-border',
        },
      }),
    });
    
  } catch (error: any) {
    console.error('Stripe Connect status error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check Stripe Connect status' 
    }, { status: 500 });
  }
}
