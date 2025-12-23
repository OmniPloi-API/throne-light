import { NextRequest, NextResponse } from 'next/server';
import { createTrackingEvent, getPartnerById } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { partnerId, type } = await req.json();
    
    if (!partnerId || !type) {
      return NextResponse.json({ error: 'Missing partnerId or type' }, { status: 400 });
    }
    
    const validTypes = ['PAGE_VIEW', 'CLICK_AMAZON', 'CLICK_BOOKBABY', 'CLICK_DIRECT'];
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
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;
    
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
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
