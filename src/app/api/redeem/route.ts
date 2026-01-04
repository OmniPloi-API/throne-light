import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, bookId } = await req.json();
    
    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Redemption code is required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    const normalizedCode = code.toUpperCase().trim();
    
    // Check if code matches any active partner's coupon code
    const partner = db.partners.find(
      p => p.couponCode.toUpperCase() === normalizedCode && (p.isActive !== false)
    );
    
    if (partner) {
      return NextResponse.json({
        valid: true,
        type: 'coupon',
        partnerId: partner.id,
        partnerName: partner.name,
        discountPercent: partner.discountPercent,
        message: `${partner.discountPercent}% discount applied via ${partner.name}'s code!`
      });
    }
    
    // Check if code is a direct redemption code (e.g., from a purchase or giveaway)
    // These would be stored in a separate collection or have a specific format
    if (normalizedCode.startsWith('THRONE-')) {
      // This is a direct unlock code - validate against redemption codes collection
      // For now, accept THRONE- prefixed codes as valid unlock codes
      return NextResponse.json({
        valid: true,
        type: 'unlock',
        message: 'Book unlocked successfully!'
      });
    }
    
    // Check if it matches a partner's access code (for partner testing)
    const partnerByAccess = db.partners.find(
      p => p.accessCode?.toUpperCase() === normalizedCode && (p.isActive !== false)
    );
    
    if (partnerByAccess) {
      return NextResponse.json({
        valid: true,
        type: 'partner_access',
        partnerId: partnerByAccess.id,
        partnerName: partnerByAccess.name,
        discountPercent: 100, // Full access for partners
        message: `Partner access granted for ${partnerByAccess.name}!`
      });
    }
    
    return NextResponse.json({ 
      valid: false, 
      error: 'Invalid redemption code. Please check and try again.' 
    });
    
  } catch (error) {
    console.error('Redemption validation error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate code' 
    }, { status: 500 });
  }
}
