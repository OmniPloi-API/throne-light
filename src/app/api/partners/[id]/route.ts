import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Partner, getPartnerBySlug, getPartnerById } from '@/lib/db';

// GET - Get a single partner by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Try to find by ID first, then by slug (for public partner page compatibility)
  let partner = getPartnerById(id);
  if (!partner) {
    partner = getPartnerBySlug(id);
  }
  
  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }
  
  // Return full partner data
  return NextResponse.json(partner);
}

// PUT - Update a partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const db = readDb();
    const partnerIndex = db.partners.findIndex(p => p.id === id);
    
    if (partnerIndex === -1) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    
    // Update partner with new data
    db.partners[partnerIndex] = {
      ...db.partners[partnerIndex],
      ...body,
      updatedAt: now,
    };
    
    writeDb(db);
    
    return NextResponse.json({ success: true, partner: db.partners[partnerIndex] });
  } catch (error) {
    console.error('Partner update error:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a partner (hard delete)
export async function DELETE(
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
    
    // Remove partner from database
    const deletedPartner = db.partners.splice(partnerIndex, 1)[0];
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      message: `Partner ${deletedPartner.name} has been permanently deleted` 
    });
  } catch (error) {
    console.error('Partner deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
