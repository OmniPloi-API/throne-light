import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

// GET - Get feedback widget visibility setting
export async function GET() {
  const db = readDb();
  return NextResponse.json({
    feedbackWidgetEnabled: db.siteSettings?.feedbackWidgetEnabled ?? true,
  });
}

// PUT - Update feedback widget visibility setting (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackWidgetEnabled } = body;
    
    if (typeof feedbackWidgetEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'feedbackWidgetEnabled must be a boolean' },
        { status: 400 }
      );
    }
    
    const db = readDb();
    db.siteSettings = db.siteSettings || { feedbackWidgetEnabled: true };
    db.siteSettings.feedbackWidgetEnabled = feedbackWidgetEnabled;
    db.siteSettings.feedbackWidgetUpdatedAt = new Date().toISOString();
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      feedbackWidgetEnabled: db.siteSettings.feedbackWidgetEnabled 
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
