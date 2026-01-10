// Admin endpoint to manage device activations
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: View device activations for a license (by email or license code)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const licenseCode = searchParams.get('code');
  
  if (!email && !licenseCode) {
    return NextResponse.json({ error: 'Provide email or code parameter' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // First find the license
  let licenseQuery = supabase.from('reader_licenses').select('*');
  if (email) {
    licenseQuery = licenseQuery.eq('email', email);
  } else if (licenseCode) {
    licenseQuery = licenseQuery.eq('license_code', licenseCode);
  }

  const { data: licenses, error: licenseError } = await licenseQuery;

  if (licenseError) {
    return NextResponse.json({ error: licenseError.message }, { status: 500 });
  }

  if (!licenses || licenses.length === 0) {
    return NextResponse.json({ error: 'License not found', licenses: [] }, { status: 404 });
  }

  // Get device activations for each license
  const results = await Promise.all(licenses.map(async (license) => {
    const { data: activations, error: actError } = await supabase
      .from('device_activations')
      .select('*')
      .eq('license_id', license.id)
      .order('activated_at', { ascending: false });

    return {
      license: {
        id: license.id,
        email: license.email,
        code: license.license_code,
        maxDevices: license.max_devices,
        isActive: license.is_active,
      },
      activations: activations || [],
      activeCount: activations?.filter(a => a.is_active).length || 0,
      error: actError?.message,
    };
  }));

  return NextResponse.json({ results });
}

// DELETE: Clear device activations for a license
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const licenseId = searchParams.get('licenseId');
  const deviceId = searchParams.get('deviceId'); // Optional: clear specific device
  const clearAll = searchParams.get('clearAll') === 'true';

  if (!licenseId) {
    return NextResponse.json({ error: 'licenseId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (clearAll) {
    // Deactivate all devices for this license
    const { error } = await supabase
      .from('device_activations')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq('license_id', licenseId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'All devices deactivated' });
  } else if (deviceId) {
    // Deactivate specific device
    const { error } = await supabase
      .from('device_activations')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq('id', deviceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Device deactivated' });
  } else {
    return NextResponse.json({ error: 'Provide deviceId or clearAll=true' }, { status: 400 });
  }
}
