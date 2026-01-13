import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Find partner by email (case-insensitive)
    const { data: partner, error } = await supabase
      .from('partners')
      .select('id, name, email, access_code, coupon_code')
      .ilike('email', email.toLowerCase())
      .single();
    
    if (error || !partner) {
      // For security, don't reveal if the email exists
      // Just return success anyway
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive your access code.'
      });
    }
    
    // In production, you would send an email here
    // For now, we'll just log it and return success
    console.log(`Access code request for ${email}: ${partner.access_code || partner.coupon_code}`);
    
    // TODO: Implement actual email sending using Resend or similar
    // The partner already exists in Supabase, so we can send their actual code
    
    return NextResponse.json({ 
      success: true,
      message: 'Access code sent to your email'
    });
    
  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
