import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: Fetch all flagged audio segments with their reports
export async function GET(req: NextRequest) {
  try {
    // Get flagged segments with aggregated report info
    const { data: flaggedSegments, error } = await getSupabaseAdmin()
      .from('audio_segments')
      .select(`
        id,
        book_id,
        content_hash,
        segment_index,
        language_code,
        voice_id,
        version_number,
        storage_path,
        flagged_for_review,
        play_count,
        created_at
      `)
      .eq('flagged_for_review', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch flagged segments' }, { status: 500 });
    }

    // Get feedback counts for each segment
    const segmentsWithReports = await Promise.all(
      (flaggedSegments || []).map(async (segment) => {
        const { data: feedback, error: feedbackError } = await getSupabaseAdmin()
          .from('audio_feedback')
          .select('id, issue_type, comment, resolved, created_at')
          .eq('audio_segment_id', segment.id)
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error('Feedback fetch error:', feedbackError);
          return { ...segment, reports: [], report_count: 0, unresolved_count: 0, issue_types: [] };
        }

        const unresolvedCount = feedback?.filter(f => !f.resolved).length || 0;
        const issueTypes = Array.from(new Set(feedback?.map(f => f.issue_type) || []));

        return {
          ...segment,
          reports: feedback || [],
          report_count: feedback?.length || 0,
          unresolved_count: unresolvedCount,
          issue_types: issueTypes,
        };
      })
    );

    // Sort by unresolved count descending
    segmentsWithReports.sort((a, b) => b.unresolved_count - a.unresolved_count);

    return NextResponse.json({
      success: true,
      flagged_segments: segmentsWithReports,
      total: segmentsWithReports.length,
    });

  } catch (error) {
    console.error('Flagged segments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flagged segments' },
      { status: 500 }
    );
  }
}

// POST: Resolve reports or unflag a segment
export async function POST(req: NextRequest) {
  try {
    const { action, segment_id, feedback_ids } = await req.json();

    if (!action || !segment_id) {
      return NextResponse.json(
        { error: 'Missing required fields: action, segment_id' },
        { status: 400 }
      );
    }

    if (action === 'unflag') {
      // Unflag the segment
      const { error } = await getSupabaseAdmin()
        .from('audio_segments')
        .update({ flagged_for_review: false })
        .eq('id', segment_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to unflag segment' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Segment unflagged' });
    }

    if (action === 'resolve_all') {
      // Resolve all feedback for this segment
      const { error } = await getSupabaseAdmin()
        .from('audio_feedback')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('audio_segment_id', segment_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to resolve feedback' }, { status: 500 });
      }

      // Also unflag the segment
      await getSupabaseAdmin()
        .from('audio_segments')
        .update({ flagged_for_review: false })
        .eq('id', segment_id);

      return NextResponse.json({ success: true, message: 'All feedback resolved and segment unflagged' });
    }

    if (action === 'resolve_selected' && feedback_ids?.length > 0) {
      // Resolve selected feedback
      const { error } = await getSupabaseAdmin()
        .from('audio_feedback')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .in('id', feedback_ids);

      if (error) {
        return NextResponse.json({ error: 'Failed to resolve selected feedback' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `${feedback_ids.length} report(s) resolved` });
    }

    if (action === 'delete_segment') {
      // Delete the segment (this will cascade delete feedback due to FK constraint)
      const { error } = await getSupabaseAdmin()
        .from('audio_segments')
        .delete()
        .eq('id', segment_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Segment deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
