import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { partnerId, currentCode } = await req.json();
    
    if (!partnerId) {
      return NextResponse.json({ 
        error: 'Partner ID is required' 
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Verify the partner exists and current code matches
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('id, name, email, access_code, coupon_code')
      .eq('id', partnerId)
      .single();
    
    if (fetchError || !partner) {
      return NextResponse.json({ 
        error: 'Partner not found' 
      }, { status: 404 });
    }
    
    // Verify current access code matches
    const storedCode = partner.access_code || partner.coupon_code;
    if (currentCode && currentCode !== storedCode) {
      return NextResponse.json({ 
        error: 'Current access code is incorrect' 
      }, { status: 401 });
    }
    
    // Generate new access code
    const newAccessCode = generateAccessCode();
    
    // Update partner with new access code
    const { error: updateError } = await supabase
      .from('partners')
      .update({ 
        access_code: newAccessCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);
    
    if (updateError) {
      console.error('Error updating access code:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update access code' 
      }, { status: 500 });
    }
    
    // Send email notification with new code
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://thronelightpublishing.com'}/api/partners/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: partner.email }),
      });
    } catch (emailError) {
      console.error('Failed to send new access code email:', emailError);
      // Continue anyway - the code was changed successfully
    }
    
    console.log(`Access code changed for partner ${partner.name} (${partner.id})`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Access code changed successfully. A new code has been sent to your email.',
      newCode: newAccessCode
    });
    
  } catch (error) {
    console.error('Change access code error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
