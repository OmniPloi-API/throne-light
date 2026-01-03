import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

/**
 * One-time migration to update existing partners with new Stripe Connect fields
 * POST /api/admin/migrate-partners
 */
export async function POST() {
  try {
    const db = readDb();
    let updatedCount = 0;
    
    // Update each existing partner
    for (const partner of db.partners) {
      let updated = false;
      
      // Set default country if not present
      if (!partner.country) {
        partner.country = 'US';
        updated = true;
      }
      
      // Set default payout method if not present
      if (!partner.payoutMethod) {
        partner.payoutMethod = 'STRIPE';
        updated = true;
      }
      
      // Initialize Stripe Connect fields if not present
      if (partner.stripeOnboardingComplete === undefined) {
        partner.stripeOnboardingComplete = false;
        updated = true;
      }
      
      if (partner.taxFormVerified === undefined) {
        partner.taxFormVerified = false;
        updated = true;
      }
      
      // Set updatedAt if we made changes
      if (updated) {
        partner.updatedAt = new Date().toISOString();
        updatedCount++;
        console.log(`Updated partner: ${partner.name} (${partner.email})`);
      }
    }
    
    writeDb(db);
    
    return NextResponse.json({
      success: true,
      message: `Migration complete. Updated ${updatedCount} partner records.`,
      totalPartners: db.partners.length,
      updatedCount,
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Check migration status
 * GET /api/admin/migrate-partners
 */
export async function GET() {
  try {
    const db = readDb();
    
    const stats = {
      totalPartners: db.partners.length,
      withCountry: db.partners.filter(p => p.country).length,
      withStripeAccount: db.partners.filter(p => p.stripeAccountId).length,
      onboardingComplete: db.partners.filter(p => p.stripeOnboardingComplete).length,
      taxFormVerified: db.partners.filter(p => p.taxFormVerified).length,
      needsMigration: db.partners.filter(p => 
        !p.country || 
        p.stripeOnboardingComplete === undefined || 
        p.taxFormVerified === undefined
      ).length,
    };
    
    return NextResponse.json({
      message: 'Migration status check',
      ...stats,
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      error: 'Status check failed' 
    }, { status: 500 });
  }
}
