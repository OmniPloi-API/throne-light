import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

// PATCH - Update review status (approve/reject) or send verification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, adminNotes } = body;
    
    const db = readDb();
    const reviewIndex = db.reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    const review = db.reviews[reviewIndex];
    
    switch (action) {
      case 'approve':
        review.status = 'APPROVED';
        review.approvedAt = new Date().toISOString();
        review.isVerifiedPurchase = true; // Admin approval = verified
        if (adminNotes) review.adminNotes = adminNotes;
        break;
        
      case 'reject':
        review.status = 'REJECTED';
        review.rejectedAt = new Date().toISOString();
        if (adminNotes) review.adminNotes = adminNotes;
        break;
        
      case 'send_verification':
        review.verificationSentAt = new Date().toISOString();
        // In production, this would trigger an email to the reviewer
        // For now, we just mark it as sent
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    db.reviews[reviewIndex] = review;
    writeDb(db);
    
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE - Remove a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = readDb();
    
    const reviewIndex = db.reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    db.reviews.splice(reviewIndex, 1);
    writeDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
