import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/adminAuth';

// Generate a random 8-character access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0/O, 1/I/L
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * GET - Check status of partner access codes
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();
    
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, name, email, slug, coupon_code, access_code, is_active, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      partners: partners?.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        slug: p.slug,
        couponCode: p.coupon_code,
        accessCode: p.access_code,
        isActive: p.is_active,
        createdAt: p.created_at,
      })) || [],
    });
  } catch (error) {
    console.error('Error checking access codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Generate and save access codes for partners missing them
 */
export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const { partnerId, forceRegenerate } = body; 
    
    // If partnerId is provided, only update that one
    if (partnerId) {
      const newAccessCode = generateAccessCode();
      const { data, error } = await supabase
        .from('partners')
        .update({ 
          access_code: newAccessCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, partner: data });
    }

    // Otherwise update all missing ones
    const { data: partners, error: fetchError } = await supabase
      .from('partners')
      .select('id, name, email, access_code');
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let updatedCount = 0;
    for (const partner of partners || []) {
      if (partner.access_code && !forceRegenerate) continue;

      const newAccessCode = generateAccessCode();
      await supabase
        .from('partners')
        .update({ access_code: newAccessCode })
        .eq('id', partner.id);
      
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} partner access codes`,
    });
  } catch (error) {
    console.error('Error fixing access codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

