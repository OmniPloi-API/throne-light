import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Country coordinates for map markers (approximate center points)
const COUNTRY_COORDINATES: Record<string, { latitude: number; longitude: number; code: string }> = {
  'United States': { latitude: 39.8283, longitude: -98.5795, code: 'US' },
  'USA': { latitude: 39.8283, longitude: -98.5795, code: 'US' },
  'South Africa': { latitude: -30.5595, longitude: 22.9375, code: 'ZA' },
  'Nigeria': { latitude: 9.0820, longitude: 8.6753, code: 'NG' },
  'Ghana': { latitude: 7.9465, longitude: -1.0232, code: 'GH' },
  'Botswana': { latitude: -22.3285, longitude: 24.6849, code: 'BW' },
  'United Kingdom': { latitude: 55.3781, longitude: -3.4360, code: 'GB' },
  'UK': { latitude: 55.3781, longitude: -3.4360, code: 'GB' },
  'Cameroon': { latitude: 7.3697, longitude: 12.3547, code: 'CM' },
  'France': { latitude: 46.2276, longitude: 2.2137, code: 'FR' },
  'Germany': { latitude: 51.1657, longitude: 10.4515, code: 'DE' },
  'Australia': { latitude: -25.2744, longitude: 133.7751, code: 'AU' },
  'Canada': { latitude: 56.1304, longitude: -106.3468, code: 'CA' },
  'India': { latitude: 20.5937, longitude: 78.9629, code: 'IN' },
  'Kenya': { latitude: -0.0236, longitude: 37.9062, code: 'KE' },
  'Brazil': { latitude: -14.2350, longitude: -51.9253, code: 'BR' },
  'Mexico': { latitude: 23.6345, longitude: -102.5528, code: 'MX' },
  'Japan': { latitude: 36.2048, longitude: 138.2529, code: 'JP' },
  'China': { latitude: 35.8617, longitude: 104.1954, code: 'CN' },
  'Netherlands': { latitude: 52.1326, longitude: 5.2913, code: 'NL' },
  'Spain': { latitude: 40.4637, longitude: -3.7492, code: 'ES' },
  'Italy': { latitude: 41.8719, longitude: 12.5674, code: 'IT' },
  'Sweden': { latitude: 60.1282, longitude: 18.6435, code: 'SE' },
  'Norway': { latitude: 60.4720, longitude: 8.4689, code: 'NO' },
  'Denmark': { latitude: 56.2639, longitude: 9.5018, code: 'DK' },
  'Ireland': { latitude: 53.1424, longitude: -7.6921, code: 'IE' },
  'New Zealand': { latitude: -40.9006, longitude: 174.8860, code: 'NZ' },
  'Singapore': { latitude: 1.3521, longitude: 103.8198, code: 'SG' },
  'UAE': { latitude: 23.4241, longitude: 53.8478, code: 'AE' },
  'United Arab Emirates': { latitude: 23.4241, longitude: 53.8478, code: 'AE' },
};

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();

    // Get sales by location from sales_locations table
    const { data: salesLocationsData } = await supabase
      .from('sales_locations')
      .select('city, country, country_code, latitude, longitude, amount')
      .not('latitude', 'is', null);

    // Also get tracking events with country data (this is where Consumer Analysis gets its data)
    const { data: trackingEvents } = await supabase
      .from('tracking_events')
      .select('country, city, event_type, ip_address')
      .not('country', 'is', null);

    // Get orders for revenue data
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount, created_at');

    // Calculate total revenue from orders
    const totalOrdersRevenue = (ordersData || []).reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);
    const totalOrdersCount = ordersData?.length || 0;

    // Aggregate sales by location from sales_locations
    const salesByLocation: Record<string, {
      city: string;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      count: number;
      totalAmount: number;
    }> = {};

    salesLocationsData?.forEach((sale) => {
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

    // Also aggregate by country from tracking events (for countries view)
    const countriesFromEvents: Record<string, {
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      visitorCount: number;
      saleCount: number;
    }> = {};

    trackingEvents?.forEach((event) => {
      const country = event.country;
      if (!country) return;
      
      const coords = COUNTRY_COORDINATES[country];
      if (!coords) return;

      if (!countriesFromEvents[country]) {
        countriesFromEvents[country] = {
          country,
          countryCode: coords.code,
          latitude: coords.latitude,
          longitude: coords.longitude,
          visitorCount: 0,
          saleCount: 0
        };
      }
      countriesFromEvents[country].visitorCount++;
      if (event.event_type === 'SALE' || event.event_type === 'CLICK_DIRECT') {
        countriesFromEvents[country].saleCount++;
      }
    });

    // Add countries from events to salesByLocation if not already present
    Object.values(countriesFromEvents).forEach((countryData) => {
      const key = `${countryData.latitude},${countryData.longitude}`;
      if (!salesByLocation[key] && countryData.saleCount > 0) {
        salesByLocation[key] = {
          city: '',
          country: countryData.country,
          countryCode: countryData.countryCode,
          latitude: countryData.latitude,
          longitude: countryData.longitude,
          count: countryData.saleCount,
          totalAmount: 0
        };
      }
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

    // Get summary stats - use orders for revenue, tracking events for countries
    const totalSalesFromLocations = Object.values(salesByLocation).reduce((sum, loc) => sum + loc.count, 0);
    const totalSales = Math.max(totalSalesFromLocations, totalOrdersCount);
    const totalRevenue = totalOrdersRevenue; // Use orders table for accurate revenue
    const totalActiveReaders = readersData?.length || 0;
    
    // Get unique countries from tracking events (same source as Consumer Analysis)
    const countriesFromTrackingEvents = (trackingEvents || []).map(e => e.country).filter(Boolean);
    const countriesFromReaderSessions = Object.values(readersByLocation).map(r => r.country).filter(Boolean);
    const allCountries = [...countriesFromTrackingEvents, ...countriesFromReaderSessions];
    const uniqueCountries = new Set(allCountries).size;

    return NextResponse.json({
      sales: Object.values(salesByLocation),
      readers: Object.values(readersByLocation),
      countriesData: Object.values(countriesFromEvents),
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
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

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
