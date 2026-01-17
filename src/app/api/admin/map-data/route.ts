import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// US City coordinates for accurate map markers
const US_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // Florida
  'jensen beach': { latitude: 27.2545, longitude: -80.2295 },
  'miami': { latitude: 25.7617, longitude: -80.1918 },
  'orlando': { latitude: 28.5383, longitude: -81.3792 },
  'jacksonville': { latitude: 30.3322, longitude: -81.6557 },
  'tampa': { latitude: 27.9506, longitude: -82.4572 },
  'fort lauderdale': { latitude: 26.1224, longitude: -80.1373 },
  'gallatin': { latitude: 36.3884, longitude: -86.4469 },
  
  // Nebraska
  'omaha': { latitude: 41.2565, longitude: -95.9345 },
  'lincoln': { latitude: 40.8258, longitude: -96.6852 },
  
  // Illinois
  'chicago': { latitude: 41.8781, longitude: -87.6298 },
  'quincy': { latitude: 39.9356, longitude: -91.4099 },
  
  // Virginia
  'ashburn': { latitude: 39.0438, longitude: -77.4874 },
  'richmond': { latitude: 37.5407, longitude: -77.4360 },
  
  // New York
  'new york': { latitude: 40.7128, longitude: -74.0060 },
  'brooklyn': { latitude: 40.6782, longitude: -73.9442 },
  'manhattan': { latitude: 40.7831, longitude: -73.9712 },
  'buffalo': { latitude: 42.8864, longitude: -78.8784 },
  
  // California
  'los angeles': { latitude: 34.0522, longitude: -118.2437 },
  'san francisco': { latitude: 37.7749, longitude: -122.4194 },
  'san diego': { latitude: 32.7157, longitude: -117.1611 },
  'san jose': { latitude: 37.3382, longitude: -121.8863 },
  
  // Texas
  'houston': { latitude: 29.7604, longitude: -95.3698 },
  'dallas': { latitude: 32.7767, longitude: -96.7970 },
  'austin': { latitude: 30.2672, longitude: -97.7431 },
  'san antonio': { latitude: 29.4241, longitude: -98.4936 },
  
  // Georgia
  'atlanta': { latitude: 33.7490, longitude: -84.3880 },
  
  // Washington
  'seattle': { latitude: 47.6062, longitude: -122.3321 },
  
  // Massachusetts
  'boston': { latitude: 42.3601, longitude: -71.0589 },
  
  // Pennsylvania
  'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
  'pittsburgh': { latitude: 40.4406, longitude: -79.9959 },
  
  // Arizona
  'phoenix': { latitude: 33.4484, longitude: -112.0740 },
  
  // Colorado
  'denver': { latitude: 39.7392, longitude: -104.9903 },
  
  // Tennessee
  'nashville': { latitude: 36.1627, longitude: -86.7816 },
  'memphis': { latitude: 35.1495, longitude: -90.0490 },
  
  // Michigan
  'detroit': { latitude: 42.3314, longitude: -83.0458 },
  
  // Ohio
  'columbus': { latitude: 39.9612, longitude: -82.9988 },
  'cleveland': { latitude: 41.4993, longitude: -81.6944 },
  
  // North Carolina
  'charlotte': { latitude: 35.2271, longitude: -80.8431 },
  'raleigh': { latitude: 35.7796, longitude: -78.6382 },
  
  // Minnesota
  'minneapolis': { latitude: 44.9778, longitude: -93.2650 },
  
  // Missouri
  'st louis': { latitude: 38.6270, longitude: -90.1994 },
  'kansas city': { latitude: 39.0997, longitude: -94.5786 },
  
  // Nevada
  'las vegas': { latitude: 36.1699, longitude: -115.1398 },
  
  // Oregon
  'portland': { latitude: 45.5152, longitude: -122.6784 },
  
  // Maryland
  'baltimore': { latitude: 39.2904, longitude: -76.6122 },
  
  // Wisconsin
  'milwaukee': { latitude: 43.0389, longitude: -87.9065 },
  
  // Indiana
  'indianapolis': { latitude: 39.7684, longitude: -86.1581 },
};

// Nigeria city coordinates
const NIGERIA_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'lagos': { latitude: 6.5244, longitude: 3.3792 },
  'abuja': { latitude: 9.0765, longitude: 7.3986 },
  'kano': { latitude: 12.0022, longitude: 8.5920 },
  'ibadan': { latitude: 7.3775, longitude: 3.9470 },
  'port harcourt': { latitude: 4.8156, longitude: 7.0498 },
};

// Country coordinates for map markers (capital city locations for accuracy)
const COUNTRY_COORDINATES: Record<string, { latitude: number; longitude: number; code: string }> = {
  // Americas
  'United States': { latitude: 38.9072, longitude: -77.0369, code: 'US' }, // Washington DC
  'USA': { latitude: 38.9072, longitude: -77.0369, code: 'US' },
  'Canada': { latitude: 45.4215, longitude: -75.6972, code: 'CA' }, // Ottawa
  'Mexico': { latitude: 19.4326, longitude: -99.1332, code: 'MX' }, // Mexico City
  'Brazil': { latitude: -15.7975, longitude: -47.8919, code: 'BR' }, // Brasilia
  'Argentina': { latitude: -34.6037, longitude: -58.3816, code: 'AR' }, // Buenos Aires
  'Colombia': { latitude: 4.7110, longitude: -74.0721, code: 'CO' }, // Bogota
  'Chile': { latitude: -33.4489, longitude: -70.6693, code: 'CL' }, // Santiago
  'Peru': { latitude: -12.0464, longitude: -77.0428, code: 'PE' }, // Lima
  'Jamaica': { latitude: 18.0179, longitude: -76.8099, code: 'JM' }, // Kingston
  'Trinidad and Tobago': { latitude: 10.6918, longitude: -61.2225, code: 'TT' }, // Port of Spain
  
  // Europe
  'United Kingdom': { latitude: 51.5074, longitude: -0.1278, code: 'GB' }, // London
  'UK': { latitude: 51.5074, longitude: -0.1278, code: 'GB' },
  'France': { latitude: 48.8566, longitude: 2.3522, code: 'FR' }, // Paris
  'Germany': { latitude: 52.5200, longitude: 13.4050, code: 'DE' }, // Berlin
  'Netherlands': { latitude: 52.3676, longitude: 4.9041, code: 'NL' }, // Amsterdam
  'Spain': { latitude: 40.4168, longitude: -3.7038, code: 'ES' }, // Madrid
  'Italy': { latitude: 41.9028, longitude: 12.4964, code: 'IT' }, // Rome
  'Sweden': { latitude: 59.3293, longitude: 18.0686, code: 'SE' }, // Stockholm
  'Norway': { latitude: 59.9139, longitude: 10.7522, code: 'NO' }, // Oslo
  'Denmark': { latitude: 55.6761, longitude: 12.5683, code: 'DK' }, // Copenhagen
  'Ireland': { latitude: 53.3498, longitude: -6.2603, code: 'IE' }, // Dublin
  'Belgium': { latitude: 50.8503, longitude: 4.3517, code: 'BE' }, // Brussels
  'Switzerland': { latitude: 46.9480, longitude: 7.4474, code: 'CH' }, // Bern
  'Austria': { latitude: 48.2082, longitude: 16.3738, code: 'AT' }, // Vienna
  'Poland': { latitude: 52.2297, longitude: 21.0122, code: 'PL' }, // Warsaw
  'Portugal': { latitude: 38.7223, longitude: -9.1393, code: 'PT' }, // Lisbon
  'Greece': { latitude: 37.9838, longitude: 23.7275, code: 'GR' }, // Athens
  'Finland': { latitude: 60.1699, longitude: 24.9384, code: 'FI' }, // Helsinki
  'Czech Republic': { latitude: 50.0755, longitude: 14.4378, code: 'CZ' }, // Prague
  'Romania': { latitude: 44.4268, longitude: 26.1025, code: 'RO' }, // Bucharest
  'Hungary': { latitude: 47.4979, longitude: 19.0402, code: 'HU' }, // Budapest
  
  // Africa
  'South Africa': { latitude: -25.7479, longitude: 28.2293, code: 'ZA' }, // Pretoria
  'Nigeria': { latitude: 9.0765, longitude: 7.3986, code: 'NG' }, // Abuja
  'Ghana': { latitude: 5.6037, longitude: -0.1870, code: 'GH' }, // Accra
  'Kenya': { latitude: -1.2921, longitude: 36.8219, code: 'KE' }, // Nairobi
  'Ethiopia': { latitude: 9.0320, longitude: 38.7420, code: 'ET' }, // Addis Ababa
  'Egypt': { latitude: 30.0444, longitude: 31.2357, code: 'EG' }, // Cairo
  'Morocco': { latitude: 33.9716, longitude: -6.8498, code: 'MA' }, // Rabat
  'Tanzania': { latitude: -6.1659, longitude: 35.7516, code: 'TZ' }, // Dodoma
  'Uganda': { latitude: 0.3476, longitude: 32.5825, code: 'UG' }, // Kampala
  'Cameroon': { latitude: 3.8480, longitude: 11.5021, code: 'CM' }, // Yaounde
  'Botswana': { latitude: -24.6282, longitude: 25.9231, code: 'BW' }, // Gaborone
  'Zimbabwe': { latitude: -17.8252, longitude: 31.0335, code: 'ZW' }, // Harare
  'Zambia': { latitude: -15.3875, longitude: 28.3228, code: 'ZM' }, // Lusaka
  'Rwanda': { latitude: -1.9403, longitude: 29.8739, code: 'RW' }, // Kigali
  'Senegal': { latitude: 14.7167, longitude: -17.4677, code: 'SN' }, // Dakar
  'Ivory Coast': { latitude: 6.8276, longitude: -5.2893, code: 'CI' }, // Yamoussoukro
  "Côte d'Ivoire": { latitude: 6.8276, longitude: -5.2893, code: 'CI' },
  
  // Asia
  'India': { latitude: 28.6139, longitude: 77.2090, code: 'IN' }, // New Delhi
  'China': { latitude: 39.9042, longitude: 116.4074, code: 'CN' }, // Beijing
  'Japan': { latitude: 35.6762, longitude: 139.6503, code: 'JP' }, // Tokyo
  'South Korea': { latitude: 37.5665, longitude: 126.9780, code: 'KR' }, // Seoul
  'Indonesia': { latitude: -6.2088, longitude: 106.8456, code: 'ID' }, // Jakarta
  'Philippines': { latitude: 14.5995, longitude: 120.9842, code: 'PH' }, // Manila
  'Thailand': { latitude: 13.7563, longitude: 100.5018, code: 'TH' }, // Bangkok
  'Vietnam': { latitude: 21.0285, longitude: 105.8542, code: 'VN' }, // Hanoi
  'Malaysia': { latitude: 3.1390, longitude: 101.6869, code: 'MY' }, // Kuala Lumpur
  'Singapore': { latitude: 1.3521, longitude: 103.8198, code: 'SG' },
  'Pakistan': { latitude: 33.6844, longitude: 73.0479, code: 'PK' }, // Islamabad
  'Bangladesh': { latitude: 23.8103, longitude: 90.4125, code: 'BD' }, // Dhaka
  'Sri Lanka': { latitude: 6.9271, longitude: 79.8612, code: 'LK' }, // Colombo
  
  // Middle East
  'UAE': { latitude: 24.4539, longitude: 54.3773, code: 'AE' }, // Abu Dhabi
  'United Arab Emirates': { latitude: 24.4539, longitude: 54.3773, code: 'AE' },
  'Saudi Arabia': { latitude: 24.7136, longitude: 46.6753, code: 'SA' }, // Riyadh
  'Israel': { latitude: 31.7683, longitude: 35.2137, code: 'IL' }, // Jerusalem
  'Turkey': { latitude: 39.9334, longitude: 32.8597, code: 'TR' }, // Ankara
  'Qatar': { latitude: 25.2854, longitude: 51.5310, code: 'QA' }, // Doha
  'Kuwait': { latitude: 29.3759, longitude: 47.9774, code: 'KW' }, // Kuwait City
  
  // Oceania
  'Australia': { latitude: -35.2809, longitude: 149.1300, code: 'AU' }, // Canberra
  'New Zealand': { latitude: -41.2866, longitude: 174.7756, code: 'NZ' }, // Wellington
};

// Helper function to get city coordinates
function getCityCoordinates(city: string | null, country: string | null): { latitude: number; longitude: number } | null {
  if (!city) return null;
  
  const cityLower = city.toLowerCase().trim();
  
  // Check US cities first
  if (US_CITY_COORDINATES[cityLower]) {
    return US_CITY_COORDINATES[cityLower];
  }
  
  // Check Nigeria cities
  if (country === 'Nigeria' && NIGERIA_CITY_COORDINATES[cityLower]) {
    return NIGERIA_CITY_COORDINATES[cityLower];
  }
  
  return null;
}

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
    // Include SALE and CLICK_DIRECT events for sales mapping
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

    // Aggregate SALE events by city (with city-level coordinates when available)
    const salesFromEvents: Record<string, {
      city: string;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      count: number;
    }> = {};

    trackingEvents?.forEach((event) => {
      const country = event.country;
      if (!country) return;
      
      const countryCoords = COUNTRY_COORDINATES[country];
      if (!countryCoords) return;

      // Count for countries view
      if (!countriesFromEvents[country]) {
        countriesFromEvents[country] = {
          country,
          countryCode: countryCoords.code,
          latitude: countryCoords.latitude,
          longitude: countryCoords.longitude,
          visitorCount: 0,
          saleCount: 0
        };
      }
      countriesFromEvents[country].visitorCount++;
      
      // For SALE events, try to use city-level coordinates
      if (event.event_type === 'SALE' || event.event_type === 'CLICK_DIRECT') {
        countriesFromEvents[country].saleCount++;
        
        // Try to get city-level coordinates
        const cityCoords = getCityCoordinates(event.city, country);
        
        if (cityCoords && event.city) {
          // Use city-level coordinates
          const key = `${cityCoords.latitude},${cityCoords.longitude}`;
          if (!salesFromEvents[key]) {
            salesFromEvents[key] = {
              city: event.city,
              country,
              countryCode: countryCoords.code,
              latitude: cityCoords.latitude,
              longitude: cityCoords.longitude,
              count: 0
            };
          }
          salesFromEvents[key].count++;
        } else {
          // Fall back to country-level coordinates
          const key = `${countryCoords.latitude},${countryCoords.longitude}`;
          if (!salesFromEvents[key]) {
            salesFromEvents[key] = {
              city: event.city || '',
              country,
              countryCode: countryCoords.code,
              latitude: countryCoords.latitude,
              longitude: countryCoords.longitude,
              count: 0
            };
          }
          salesFromEvents[key].count++;
        }
      }
    });

    // Add sales from tracking events to salesByLocation (with city-level precision)
    Object.values(salesFromEvents).forEach((saleData) => {
      const key = `${saleData.latitude},${saleData.longitude}`;
      if (!salesByLocation[key]) {
        salesByLocation[key] = {
          city: saleData.city,
          country: saleData.country,
          countryCode: saleData.countryCode,
          latitude: saleData.latitude,
          longitude: saleData.longitude,
          count: saleData.count,
          totalAmount: 0
        };
      } else {
        // Add to existing location count
        salesByLocation[key].count += saleData.count;
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
