import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { accessCode } = await req.json();
    
    if (!accessCode) {
      return NextResponse.json({ 
        error: 'Access code is required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    
    // Find partner by access code (case-insensitive)
    const partner = db.partners.find((p: any) => 
      p.accessCode?.toUpperCase() === accessCode.toUpperCase() ||
      p.couponCode?.toUpperCase() === accessCode.toUpperCase()
    );
    
    if (!partner) {
      return NextResponse.json({ 
        error: 'Invalid access code' 
      }, { status: 401 });
    }
    
    // Return partner info (excluding sensitive data)
    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        slug: partner.slug,
        couponCode: partner.couponCode,
        accessCode: partner.accessCode,
        commissionPercent: partner.commissionPercent,
        clickBounty: partner.clickBounty,
        discountPercent: partner.discountPercent,
        amazonUrl: partner.amazonUrl,
        bookBabyUrl: partner.bookBabyUrl,
      }
    });
    
  } catch (error) {
    console.error('Partner login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
