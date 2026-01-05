import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, Subscriber, SubscriberSource } from '@/lib/db';
import { sendNewsletterConfirmation } from '@/lib/email';

// GET - Fetch all subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    const db = readDb();
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') as SubscriberSource | null;
    const format = searchParams.get('format'); // 'csv' or 'txt'
    
    let subscribers = db.subscribers || [];
    
    // Filter by source if provided
    if (source) {
      subscribers = subscribers.filter(s => s.source === source);
    }
    
    // Sort by most recent first
    subscribers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
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
    
    // Get stats by source
    const stats = {
      total: db.subscribers?.length || 0,
      bySource: {} as Record<string, number>,
    };
    
    (db.subscribers || []).forEach(s => {
      stats.bySource[s.source] = (stats.bySource[s.source] || 0) + 1;
    });
    
    return NextResponse.json({ subscribers, stats });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

// POST - Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, firstName, lastName, source, sourceDetail } = body;
    
    if (!email || !source) {
      return NextResponse.json({ error: 'Email and source are required' }, { status: 400 });
    }
    
    const db = readDb();
    
    // Check if email already exists for this source
    const existing = (db.subscribers || []).find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.source === source
    );
    
    if (existing) {
      // Update existing subscriber
      existing.phone = phone || existing.phone;
      existing.firstName = firstName || existing.firstName;
      existing.lastName = lastName || existing.lastName;
      existing.updatedAt = new Date().toISOString();
      writeDb(db);
      return NextResponse.json({ success: true, subscriber: existing, updated: true });
    }
    
    // Get geo info from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    const newSubscriber: Subscriber = {
      id: generateId(),
      email: email.toLowerCase(),
      phone: phone || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      source,
      sourceDetail: sourceDetail || undefined,
      ipAddress,
      userAgent,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!db.subscribers) {
      db.subscribers = [];
    }
    db.subscribers.push(newSubscriber);
    writeDb(db);
    
    // Send confirmation email (non-blocking)
    sendNewsletterConfirmation(email, source).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });
    
    return NextResponse.json({ success: true, subscriber: newSubscriber });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 });
  }
}

// DELETE - Remove subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }
    
    const db = readDb();
    const index = (db.subscribers || []).findIndex(s => s.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }
    
    db.subscribers.splice(index, 1);
    writeDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
