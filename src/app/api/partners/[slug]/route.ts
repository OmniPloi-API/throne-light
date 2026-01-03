import { NextRequest, NextResponse } from 'next/server';
import { getPartnerBySlug, getPartnerById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Try to find by slug first, then by ID (for checkout page compatibility)
  let partner = getPartnerBySlug(slug);
  if (!partner) {
    partner = getPartnerById(slug);
  }
  
  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }
  
  // Return public partner info (exclude sensitive data)
  return NextResponse.json({
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    couponCode: partner.couponCode,
    discountPercent: partner.discountPercent,
    amazonUrl: partner.amazonUrl,
    bookBabyUrl: partner.bookBabyUrl,
  });
}
