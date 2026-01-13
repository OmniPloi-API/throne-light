import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

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
  // Simple admin check via query param (you should use proper auth in production)
  const adminKey = req.nextUrl.searchParams.get('key');
  if (adminKey !== process.env.ADMIN_API_KEY && adminKey !== 'throne-admin-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, name, email, slug, coupon_code, access_code, is_active')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withAccessCode = partners?.filter(p => p.access_code) || [];
    const withoutAccessCode = partners?.filter(p => !p.access_code) || [];

    return NextResponse.json({
      total: partners?.length || 0,
      withAccessCode: withAccessCode.length,
      withoutAccessCode: withoutAccessCode.length,
      partnersNeedingCodes: withoutAccessCode.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        couponCode: p.coupon_code,
        currentAccessCode: p.access_code,
      })),
      allPartners: partners?.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        slug: p.slug,
        couponCode: p.coupon_code,
        accessCode: p.access_code,
        isActive: p.is_active,
      })),
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
  const adminKey = req.nextUrl.searchParams.get('key');
  if (adminKey !== process.env.ADMIN_API_KEY && adminKey !== 'throne-admin-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const { forceRegenerate } = body; // If true, regenerate ALL access codes
    
    // Get partners
    const { data: partners, error: fetchError } = await supabase
      .from('partners')
      .select('id, name, email, slug, coupon_code, access_code, is_active');
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const updates: Array<{
      id: string;
      name: string;
      email: string;
      couponCode: string;
      oldAccessCode: string | null;
      newAccessCode: string;
    }> = [];

    for (const partner of partners || []) {
      // Skip if already has access code and not forcing regeneration
      if (partner.access_code && !forceRegenerate) {
        continue;
      }

      const newAccessCode = generateAccessCode();
      
      // Update in database
      const { error: updateError } = await supabase
        .from('partners')
        .update({ 
          access_code: newAccessCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (updateError) {
        console.error(`Failed to update partner ${partner.name}:`, updateError);
        continue;
      }

      updates.push({
        id: partner.id,
        name: partner.name,
        email: partner.email,
        couponCode: partner.coupon_code,
        oldAccessCode: partner.access_code,
        newAccessCode,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} partner access codes`,
      updates,
      // Summary for easy copy-paste to send to partners
      summary: updates.map(u => 
        `${u.name} (${u.email}): Access Code = ${u.newAccessCode}, Coupon = ${u.couponCode}`
      ),
    });
  } catch (error) {
    console.error('Error fixing access codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Update a specific partner's access code
 */
export async function PUT(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get('key');
  if (adminKey !== process.env.ADMIN_API_KEY && adminKey !== 'throne-admin-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { partnerId, accessCode } = await req.json();
    
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
    }

    const newAccessCode = accessCode || generateAccessCode();
    
    const { data: partner, error } = await supabase
      .from('partners')
      .update({ 
        access_code: newAccessCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', partnerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        accessCode: partner.access_code,
        couponCode: partner.coupon_code,
      },
    });
  } catch (error) {
    console.error('Error updating access code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
