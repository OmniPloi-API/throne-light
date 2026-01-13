import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { accessCode } = await req.json();
    
    if (!accessCode) {
      return NextResponse.json({ 
        error: 'Access code is required' 
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    const codeUpper = accessCode.toUpperCase();
    
    // Find partner by access code OR coupon code (case-insensitive)
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .or(`access_code.ilike.${codeUpper},coupon_code.ilike.${codeUpper}`)
      .eq('is_active', true)
      .single();
    
    if (error || !partner) {
      console.log('Partner login failed for code:', codeUpper, error?.message);
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
        couponCode: partner.coupon_code,
        accessCode: partner.access_code,
        commissionPercent: partner.commission_percent,
        clickBounty: partner.click_bounty,
        discountPercent: partner.discount_percent,
        amazonUrl: partner.amazon_url,
        bookBabyUrl: partner.book_baby_url,
      }
    });
    
  } catch (error) {
    console.error('Partner login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
