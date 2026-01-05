import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get sales by location (aggregated)
    const { data: salesData, error: salesError } = await supabase
      .from('sales_locations')
      .select('city, country, country_code, latitude, longitude, amount')
      .not('latitude', 'is', null);

    // Aggregate sales by location
    const salesByLocation: Record<string, {
      city: string;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      count: number;
      totalAmount: number;
    }> = {};

    salesData?.forEach((sale) => {
      const key = `${sale.latitude},${sale.longitude}`;
      if (!salesByLocation[key]) {
        salesByLocation[key] = {
          city: sale.city || 'Unknown',
          country: sale.country || 'Unknown',
          countryCode: sale.country_code || '',
          latitude: sale.latitude,
          longitude: sale.longitude,
          count: 0,
          totalAmount: 0
        };
      }
      salesByLocation[key].count++;
      salesByLocation[key].totalAmount += parseFloat(sale.amount) || 0;
    });

    // Clean up stale reader sessions
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from('active_reader_sessions')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('last_heartbeat', fiveMinutesAgo);

    // Get active readers with location
    const { data: readersData, error: readersError } = await supabase
      .from('active_reader_sessions')
      .select('id, user_id, email, city, country, country_code, latitude, longitude, current_section, current_page, last_heartbeat')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .gte('last_heartbeat', fiveMinutesAgo);

    // Aggregate readers by location
    const readersByLocation: Record<string, {
      city: string;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      count: number;
      readers: Array<{
        id: string;
        email: string | null;
        section: string | null;
        page: number;
      }>;
    }> = {};

    readersData?.forEach((reader) => {
      const key = `${reader.latitude},${reader.longitude}`;
      if (!readersByLocation[key]) {
        readersByLocation[key] = {
          city: reader.city || 'Unknown',
          country: reader.country || 'Unknown',
          countryCode: reader.country_code || '',
          latitude: reader.latitude,
          longitude: reader.longitude,
          count: 0,
          readers: []
        };
      }
      readersByLocation[key].count++;
      readersByLocation[key].readers.push({
        id: reader.id,
        email: reader.email,
        section: reader.current_section,
        page: reader.current_page
      });
    });

    // Get summary stats
    const totalSales = Object.values(salesByLocation).reduce((sum, loc) => sum + loc.count, 0);
    const totalRevenue = Object.values(salesByLocation).reduce((sum, loc) => sum + loc.totalAmount, 0);
    const totalActiveReaders = readersData?.length || 0;
    const uniqueCountries = new Set([
      ...Object.values(salesByLocation).map(s => s.countryCode),
      ...Object.values(readersByLocation).map(r => r.countryCode)
    ].filter(Boolean)).size;

    return NextResponse.json({
      sales: Object.values(salesByLocation),
      readers: Object.values(readersByLocation),
      summary: {
        totalSales,
        totalRevenue,
        totalActiveReaders,
        uniqueCountries,
        salesLocations: Object.keys(salesByLocation).length,
        readerLocations: Object.keys(readersByLocation).length
      }
    });
  } catch (error) {
    console.error('Map data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Manually add a location (for testing or manual entries)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, city, country, countryCode, latitude, longitude, amount, userId, email } = body;

    const supabase = getSupabaseAdmin();

    if (type === 'sale') {
      const { error } = await supabase
        .from('sales_locations')
        .insert({
          city,
          country,
          country_code: countryCode,
          latitude,
          longitude,
          amount: amount || 0,
          user_id: userId,
          email
        });

      if (error) throw error;
      return NextResponse.json({ status: 'Sale location added' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Add location error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
