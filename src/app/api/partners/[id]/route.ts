import { NextRequest, NextResponse } from 'next/server';
import { 
  getPartnerById, 
  getPartnerBySlug, 
  updatePartner, 
  deletePartner 
} from '@/lib/db-supabase';

// GET - Get a single partner by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ID first, then by slug (for public partner page compatibility)
    let partner = await getPartnerById(id);
    if (!partner) {
      partner = await getPartnerBySlug(id);
    }
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    // Return full partner data
    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

// PUT - Update a partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const partner = await getPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    const updatedPartner = await updatePartner(id, body);
    
    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error) {
    console.error('Partner update error:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// PATCH - Partially update a partner (same as PUT but semantic)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const partner = await getPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    const updatedPartner = await updatePartner(id, body);
    
    return NextResponse.json({ success: true, partner: updatedPartner });
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
    
    const partner = await getPartnerById(id);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    const deleted = await deletePartner(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Partner ${partner.name} has been permanently deleted` 
    });
  } catch (error) {
    console.error('Partner deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
