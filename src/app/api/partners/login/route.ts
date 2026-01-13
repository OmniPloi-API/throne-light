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
    const codeUpper = accessCode.toUpperCase().trim();
    
    // First, try to find by access_code
    let { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .ilike('access_code', codeUpper)
      .eq('is_active', true)
      .maybeSingle();
    
    // If not found, try coupon_code
    if (!partner) {
      const result = await supabase
        .from('partners')
        .select('*')
        .ilike('coupon_code', codeUpper)
        .eq('is_active', true)
        .maybeSingle();
      partner = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('Partner login DB error:', error);
    }
    
    if (!partner) {
      console.log('Partner login failed - no partner found for code:', codeUpper);
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
