import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

// POST - Reactivate a partner
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDb();
    const partnerIndex = db.partners.findIndex(p => p.id === id);
    
    if (partnerIndex === -1) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    
    // Reactivate the partner
    db.partners[partnerIndex].isActive = true;
    db.partners[partnerIndex].deactivatedAt = undefined;
    db.partners[partnerIndex].updatedAt = now;
    
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      message: `Partner ${db.partners[partnerIndex].name} has been reactivated`,
      partner: db.partners[partnerIndex]
    });
  } catch (error) {
    console.error('Partner reactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate partner' },
      { status: 500 }
    );
  }
}
