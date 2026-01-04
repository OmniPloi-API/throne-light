import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Get a single feedback item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    
    const { data: feedback, error } = await supabase
      .from('partner_feedback')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    // Transform to match frontend expectations
    return NextResponse.json({
      id: feedback.id,
      feedbackNumber: feedback.feedback_number,
      partnerName: feedback.partner_name,
      partnerEmail: feedback.partner_id,
      pageUrl: feedback.page_url,
      sectionName: feedback.section_name,
      screenshotBase64: feedback.screenshot_url,
      rawFeedback: feedback.raw_feedback,
      aiProcessedInstructions: feedback.processed_feedback,
      status: feedback.status,
      adminNotes: feedback.admin_notes,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
      reviewedAt: feedback.reviewed_at,
      completedAt: feedback.completed_at,
    });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
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
    const supabase = getSupabaseAdmin();
    
    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      
      if (status === 'REVIEWED') {
        updateData.reviewed_at = new Date().toISOString();
      }
      if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }
    
    const { data: feedback, error } = await supabase
      .from('partner_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Feedback update error:', error);
      return NextResponse.json({ error: 'Feedback not found or update failed' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      feedback: {
        id: feedback.id,
        feedbackNumber: feedback.feedback_number,
        status: feedback.status,
        adminNotes: feedback.admin_notes,
      }
    });
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
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('partner_feedback')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Feedback delete error:', error);
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
