import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

// POST - Deactivate a partner (soft delete)
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
    
    // Deactivate the partner
    db.partners[partnerIndex].isActive = false;
    db.partners[partnerIndex].deactivatedAt = now;
    db.partners[partnerIndex].updatedAt = now;
    
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      message: `Partner ${db.partners[partnerIndex].name} has been deactivated`,
      partner: db.partners[partnerIndex]
    });
  } catch (error) {
    console.error('Partner deactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate partner' },
      { status: 500 }
    );
  }
}
