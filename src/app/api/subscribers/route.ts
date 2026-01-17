import { NextRequest, NextResponse } from 'next/server';
import { SubscriberSource } from '@/lib/db';
import { 
  getSubscribers, 
  getSubscribersBySource,
  getSubscriberByEmailAndSource,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber as deleteSubscriberFromDb,
  getSubscriberStats,
  Subscriber
} from '@/lib/db-supabase';
import { enrollSubscriberInCampaign } from '@/lib/email-campaigns-supabase';

// GET - Fetch all subscribers (admin only) - USES SUPABASE
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') as SubscriberSource | null;
    const format = searchParams.get('format'); // 'csv' or 'txt'
    
    // Fetch from Supabase (persistent storage)
    const subscribers: Subscriber[] = source 
      ? await getSubscribersBySource(source)
      : await getSubscribers();
    
    // Export as CSV
    if (format === 'csv') {
      const headers = ['Email', 'Phone', 'First Name', 'Last Name', 'Source', 'Source Detail', 'Country', 'Verified', 'Created At'];
      const rows = subscribers.map(s => [
        s.email,
        s.phone || '',
        s.firstName || '',
        s.lastName || '',
        s.source,
        s.sourceDetail || '',
        s.country || '',
        s.isVerified ? 'Yes' : 'No',
        s.createdAt,
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscribers-${source || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
    
    // Export as plain text
    if (format === 'txt') {
      const lines = subscribers.map(s => {
        const parts = [s.email];
        if (s.phone) parts.push(s.phone);
        if (s.firstName || s.lastName) parts.push(`${s.firstName || ''} ${s.lastName || ''}`.trim());
        return parts.join(' | ');
      });
      
      const txt = lines.join('\n');
      
      return new NextResponse(txt, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="subscribers-${source || 'all'}-${new Date().toISOString().split('T')[0]}.txt"`,
        },
      });
    }
    
    // Get stats by source from Supabase
    const stats = await getSubscriberStats();
    
    return NextResponse.json({ subscribers, stats });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

// POST - Add new subscriber - USES SUPABASE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, firstName, lastName, source, sourceDetail } = body;
    
    if (!email || !source) {
      return NextResponse.json({ error: 'Email and source are required' }, { status: 400 });
    }
    
    // Check if email already exists for this source in Supabase
    const existing = await getSubscriberByEmailAndSource(email, source);
    
    if (existing) {
      // Update existing subscriber
      const updated = await updateSubscriber(existing.id, {
        phone: phone || existing.phone,
        firstName: firstName || existing.firstName,
        lastName: lastName || existing.lastName,
      });
      return NextResponse.json({ success: true, subscriber: updated || existing, updated: true });
    }
    
    // Get geo info from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Create new subscriber in Supabase
    const newSubscriber = await createSubscriber({
      email: email.toLowerCase(),
      phone: phone || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      source,
      sourceDetail: sourceDetail || undefined,
      ipAddress,
      userAgent,
      isVerified: false,
    });
    
    console.log(`Subscriber saved to Supabase with ID: ${newSubscriber.id}`);
    
    // For AUTHOR_MAILING_LIST subscribers, enroll in Light of EOLLES campaign
    if (source === 'AUTHOR_MAILING_LIST') {
      enrollSubscriberInCampaign(newSubscriber.id, email, firstName)
        .then((result) => {
          if (result.success) {
            console.log(`Enrolled ${email} in Light of EOLLES campaign`);
          } else {
            console.error(`Failed to enroll ${email}:`, result.error);
          }
        })
        .catch((err: Error) => {
          console.error('Campaign enrollment error:', err);
        });
    }
    
    return NextResponse.json({ success: true, subscriber: newSubscriber });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 });
  }
}

// DELETE - Remove subscriber - USES SUPABASE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }
    
    const deleted = await deleteSubscriberFromDb(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Subscriber not found or could not be deleted' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
