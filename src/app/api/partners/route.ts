import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, generateAccessCode, Partner } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.partners);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { 
    name, 
    email, 
    slug, 
    couponCode,
    amazonUrl,
    bookBabyUrl,
    commissionPercent = 20,
    clickBounty = 0.10,
    discountPercent = 20,
    partnerType = 'REV_SHARE',
    autoWithdrawEnabled = false,
    country = 'US',
  } = body;
  
  if (!name || !email || !slug || !couponCode) {
    return NextResponse.json({ 
      error: 'Missing required fields: name, email, slug, couponCode' 
    }, { status: 400 });
  }
  
  const db = readDb();
  
  // Check for duplicates
  if (db.partners.find((p) => p.email === email)) {
    return NextResponse.json({ error: 'Partner email already exists' }, { status: 409 });
  }
  if (db.partners.find((p) => p.slug === slug)) {
    return NextResponse.json({ error: 'Partner slug already exists' }, { status: 409 });
  }
  if (db.partners.find((p) => p.couponCode === couponCode)) {
    return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
  }

  // Generate unique access code
  let accessCode = generateAccessCode();
  while (db.partners.find((p) => p.accessCode === accessCode)) {
    accessCode = generateAccessCode();
  }

  const partner: Partner = {
    id: generateId(),
    name,
    email,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    couponCode: couponCode.toUpperCase(),
    accessCode,
    amazonUrl: amazonUrl || null,
    bookBabyUrl: bookBabyUrl || null,
    commissionPercent,
    clickBounty,
    discountPercent,
    partnerType: partnerType as 'REV_SHARE' | 'FLAT_FEE',
    autoWithdrawEnabled,
    // Stripe Connect fields (pending onboarding)
    stripeOnboardingComplete: false,
    taxFormVerified: false,
    // Location & Payout
    country: country.toUpperCase(),
    payoutMethod: 'STRIPE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  db.partners.push(partner);
  writeDb(db);
  return NextResponse.json(partner, { status: 201 });
}
