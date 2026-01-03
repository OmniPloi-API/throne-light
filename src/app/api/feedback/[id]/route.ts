import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, FeedbackStatus } from '@/lib/db';

// GET - Get a single feedback item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const feedback = (db.partnerFeedback || []).find(f => f.id === id);
  
  if (!feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }
  
  return NextResponse.json(feedback);
}

// PUT - Update feedback status or add admin notes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;
    
    const db = readDb();
    const feedbackIndex = (db.partnerFeedback || []).findIndex(f => f.id === id);
    
    if (feedbackIndex === -1) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    
    if (status) {
      db.partnerFeedback[feedbackIndex].status = status as FeedbackStatus;
      
      if (status === 'REVIEWED' && !db.partnerFeedback[feedbackIndex].reviewedAt) {
        db.partnerFeedback[feedbackIndex].reviewedAt = now;
      }
      if (status === 'COMPLETED') {
        db.partnerFeedback[feedbackIndex].completedAt = now;
      }
    }
    
    if (adminNotes !== undefined) {
      db.partnerFeedback[feedbackIndex].adminNotes = adminNotes;
    }
    
    writeDb(db);
    
    return NextResponse.json({ success: true, feedback: db.partnerFeedback[feedbackIndex] });
  } catch (error) {
    console.error('Feedback update error:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDb();
    const feedbackIndex = (db.partnerFeedback || []).findIndex(f => f.id === id);
    
    if (feedbackIndex === -1) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    db.partnerFeedback.splice(feedbackIndex, 1);
    writeDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
