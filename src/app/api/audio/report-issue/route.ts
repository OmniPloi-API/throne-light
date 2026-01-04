import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, IssueType } from '@/lib/supabase';

interface ReportIssueRequest {
  audio_segment_id: string;
  issue_type: IssueType;
  comment?: string;
  session_id?: string;
  user_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ReportIssueRequest = await req.json();
    const { audio_segment_id, issue_type, comment, session_id, user_id } = body;

    // Validate inputs
    if (!audio_segment_id || !issue_type) {
      return NextResponse.json(
        { error: 'Missing required fields: audio_segment_id, issue_type' },
        { status: 400 }
      );
    }

    // Validate issue_type
    const validIssueTypes: IssueType[] = [
      'wrong_language',
      'glitch',
      'robotic',
      'mispronunciation',
      'wrong_speed',
      'other',
    ];

    if (!validIssueTypes.includes(issue_type)) {
      return NextResponse.json(
        { error: `Invalid issue_type. Must be one of: ${validIssueTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify the audio segment exists
    const { data: segment, error: segmentError } = await supabaseAdmin
      .from('audio_segments')
      .select('id, version_number, book_id, content_hash, language_code, voice_id')
      .eq('id', audio_segment_id)
      .single();

    if (segmentError || !segment) {
      return NextResponse.json(
        { error: 'Audio segment not found' },
        { status: 404 }
      );
    }

    // Insert feedback record
    const { data: feedback, error: insertError } = await supabaseAdmin
      .from('audio_feedback')
      .insert({
        audio_segment_id,
        issue_type,
        comment: comment || null,
        session_id: session_id || null,
        user_id: user_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Feedback insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    // Count total unresolved reports for this segment
    const { count: reportCount, error: countError } = await supabaseAdmin
      .from('audio_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('audio_segment_id', audio_segment_id)
      .eq('resolved', false);

    if (countError) {
      console.error('Count error:', countError);
    }

    // Check if segment should be flagged (3+ reports triggers auto-flag via DB trigger)
    // But we also return this info to the client
    const isFlagged = (reportCount || 0) >= 3;

    // Determine next available version
    const currentVersion = segment.version_number;
    let nextVersion: number | null = null;
    let maxVersionsReached = false;

    if (currentVersion < 3) {
      // Check if next version already exists
      const { data: existingNext } = await supabaseAdmin
        .from('audio_segments')
        .select('id')
        .eq('book_id', segment.book_id)
        .eq('content_hash', segment.content_hash)
        .eq('language_code', segment.language_code)
        .eq('voice_id', segment.voice_id)
        .eq('version_number', currentVersion + 1)
        .single();

      if (existingNext) {
        nextVersion = currentVersion + 1;
      } else {
        // Next version needs to be generated
        nextVersion = currentVersion + 1;
      }
    } else {
      maxVersionsReached = true;
    }

    return NextResponse.json({
      success: true,
      feedback_id: feedback.id,
      total_reports: reportCount,
      flagged_for_review: isFlagged,
      current_version: currentVersion,
      next_version: nextVersion,
      max_versions_reached: maxVersionsReached,
      message: maxVersionsReached
        ? 'Maximum versions reached. Your feedback has been recorded for admin review.'
        : `Feedback recorded. Version ${nextVersion} is available.`,
    });

  } catch (error) {
    console.error('Report issue error:', error);
    return NextResponse.json(
      { error: 'Failed to process report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check report status for a segment
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const segment_id = searchParams.get('segment_id');

  if (!segment_id) {
    return NextResponse.json(
      { error: 'Missing required param: segment_id' },
      { status: 400 }
    );
  }

  const { data: segment, error: segmentError } = await supabaseAdmin
    .from('audio_segments')
    .select('flagged_for_review, version_number')
    .eq('id', segment_id)
    .single();

  if (segmentError || !segment) {
    return NextResponse.json(
      { error: 'Segment not found' },
      { status: 404 }
    );
  }

  const { count: reportCount } = await supabaseAdmin
    .from('audio_feedback')
    .select('*', { count: 'exact', head: true })
    .eq('audio_segment_id', segment_id)
    .eq('resolved', false);

  return NextResponse.json({
    flagged_for_review: segment.flagged_for_review,
    current_version: segment.version_number,
    unresolved_reports: reportCount || 0,
  });
}
