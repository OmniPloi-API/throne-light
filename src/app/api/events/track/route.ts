import { NextRequest, NextResponse } from 'next/server';
import { createTrackingEvent, getPartnerById } from '@/lib/db';

// Simple geo-location lookup (can be enhanced with IP-API, MaxMind, etc.)
async function getGeoLocation(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    // Skip localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Development' };
    }
    
    // Use free IP-API service (rate limited to 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    if (response.ok) {
      const data = await response.json();
      return { 
        country: data.country || 'Unknown', 
        city: data.city || 'Unknown' 
      };
    }
  } catch (error) {
    console.log('Geo-location lookup failed:', error);
  }
  return { country: 'Unknown', city: 'Unknown' };
}

export async function POST(req: NextRequest) {
  try {
    const { partnerId, type } = await req.json();
    
    if (!partnerId || !type) {
      return NextResponse.json({ error: 'Missing partnerId or type' }, { status: 400 });
    }
    
    const validTypes = ['PAGE_VIEW', 'CLICK_AMAZON', 'CLICK_BOOKBABY', 'CLICK_DIRECT', 'PENDING_SALE', 'SALE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }
    
    const partner = getPartnerById(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    // Extract metadata from request
    const userAgent = req.headers.get('user-agent') || undefined;
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || undefined);
    
    // Get geo-location from IP
    const geo = ipAddress ? await getGeoLocation(ipAddress) : { country: undefined, city: undefined };
    
    // Simple device detection
    let device = 'Desktop';
    if (userAgent) {
      if (/iPhone|iPad|iPod/i.test(userAgent)) device = 'iPhone';
      else if (/Android/i.test(userAgent)) device = 'Android';
      else if (/Mobile/i.test(userAgent)) device = 'Mobile';
    }
    
    const event = createTrackingEvent({
      partnerId,
      type,
      ipAddress,
      userAgent,
      device,
      country: geo.country,
      city: geo.city,
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
