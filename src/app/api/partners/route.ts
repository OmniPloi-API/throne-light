import { NextRequest, NextResponse } from 'next/server';
import { 
  getPartners, 
  getPartnerByEmail, 
  getPartnerBySlug, 
  createPartner,
  generateId,
  Partner 
} from '@/lib/db-supabase';

// Generate a random access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  try {
    const partners = await getPartners();
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    
    // Check for duplicates
    const existingEmail = await getPartnerByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Partner email already exists' }, { status: 409 });
    }
    
    const existingSlug = await getPartnerBySlug(slug);
    if (existingSlug) {
      return NextResponse.json({ error: 'Partner slug already exists' }, { status: 409 });
    }

    // Generate unique access code
    const accessCode = generateAccessCode();

    const partner = await createPartner({
      name,
      email: email.toLowerCase(),
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      couponCode: couponCode.toUpperCase(),
      accessCode,
      amazonUrl: amazonUrl || undefined,
      bookBabyUrl: bookBabyUrl || undefined,
      commissionPercent,
      clickBounty,
      discountPercent,
      partnerType: partnerType as 'REV_SHARE' | 'FLAT_FEE',
      autoWithdrawEnabled,
      stripeOnboardingComplete: false,
      taxFormVerified: false,
      country: country.toUpperCase(),
      payoutMethod: 'STRIPE',
      isActive: true,
    });
    
    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
