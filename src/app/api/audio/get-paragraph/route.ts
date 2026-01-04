import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import OpenAI from 'openai';
import { getSupabaseAdmin, AudioSegment } from '@/lib/supabase';

// Lazy OpenAI client initialization
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not configured');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Voice speed variants for different versions
const VERSION_SPEEDS: Record<number, number> = {
  1: 1.0,   // Normal speed
  2: 0.98,  // Slightly slower
  3: 1.02,  // Slightly faster
};

// Available voices
type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
const DEFAULT_VOICE: OpenAIVoice = 'shimmer';

interface GetAudioRequest {
  text: string;
  book_id: string;
  language_code: string;
  segment_index: number;
  requested_version?: number;
  voice_id?: OpenAIVoice;
}

export async function POST(req: NextRequest) {
  try {
    const body: GetAudioRequest = await req.json();
    const { 
      text, 
      book_id, 
      language_code = 'en', 
      segment_index, 
      requested_version = 1,
      voice_id = DEFAULT_VOICE 
    } = body;

    // Validate inputs
    if (!text || !book_id || segment_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: text, book_id, segment_index' },
        { status: 400 }
      );
    }

    // Validate version number
    const version = Math.min(Math.max(requested_version, 1), 3);

    // Step 1: Generate MD5 hash of the text
    const contentHash = createHash('md5').update(text).digest('hex');

    // Step 2: Check cache for existing audio
    const { data: existingSegment, error: lookupError } = await getSupabaseAdmin()
      .from('audio_segments')
      .select('*')
      .eq('book_id', book_id)
      .eq('content_hash', contentHash)
      .eq('language_code', language_code)
      .eq('voice_id', voice_id)
      .eq('version_number', version)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine
      console.error('Cache lookup error:', lookupError);
    }

    // Step 3: Cache HIT - Return signed URL
    if (existingSegment) {
      // Increment play count asynchronously
      getSupabaseAdmin()
        .from('audio_segments')
        .update({ play_count: (existingSegment as AudioSegment).play_count + 1 })
        .eq('id', existingSegment.id)
        .then(() => {});

      // Generate signed URL for the audio file
      const { data: signedUrlData, error: signedUrlError } = await getSupabaseAdmin()
        .storage
        .from('audio-cache')
        .createSignedUrl(existingSegment.storage_path, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        return NextResponse.json(
          { error: 'Failed to generate audio URL' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        cached: true,
        segment_id: existingSegment.id,
        audio_url: signedUrlData.signedUrl,
        version: version,
        duration_seconds: existingSegment.duration_seconds,
      });
    }

    // Step 4: Cache MISS - Generate new audio with OpenAI TTS
    const speed = VERSION_SPEEDS[version] || 1.0;

    // Generate audio using OpenAI TTS
    const mp3Response = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: voice_id,
      input: text,
      speed: speed,
      response_format: 'mp3',
    });

    // Convert response to buffer
    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());

    // Calculate approximate cost (OpenAI TTS-1 is $0.015 per 1K characters)
    const costCents = Math.ceil((text.length / 1000) * 1.5);

    // Generate storage path
    const storagePath = `${book_id}/${language_code}/${voice_id}/v${version}/${contentHash}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await getSupabaseAdmin()
      .storage
      .from('audio-cache')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    // Insert record into database
    const { data: newSegment, error: insertError } = await getSupabaseAdmin()
      .from('audio_segments')
      .insert({
        book_id,
        content_hash: contentHash,
        segment_index,
        language_code,
        voice_id,
        version_number: version,
        storage_path: storagePath,
        generation_cost_cents: costCents,
        play_count: 1,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Audio was uploaded but DB insert failed - still return the audio
    }

    // Generate signed URL for the new audio
    const { data: signedUrlData, error: signedUrlError } = await getSupabaseAdmin()
      .storage
      .from('audio-cache')
      .createSignedUrl(storagePath, 3600);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate audio URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cached: false,
      segment_id: newSegment?.id,
      audio_url: signedUrlData.signedUrl,
      version: version,
      generation_cost_cents: costCents,
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if audio exists without generating
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const book_id = searchParams.get('book_id');
  const content_hash = searchParams.get('content_hash');
  const language_code = searchParams.get('language_code') || 'en';
  const voice_id = searchParams.get('voice_id') || DEFAULT_VOICE;

  if (!book_id || !content_hash) {
    return NextResponse.json(
      { error: 'Missing required params: book_id, content_hash' },
      { status: 400 }
    );
  }

  // Check all versions
  const { data: segments, error } = await getSupabaseAdmin()
    .from('audio_segments')
    .select('version_number, flagged_for_review')
    .eq('book_id', book_id)
    .eq('content_hash', content_hash)
    .eq('language_code', language_code)
    .eq('voice_id', voice_id);

  if (error) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  const versions = segments?.map(s => s.version_number) || [];
  const nextAvailable = versions.length < 3 ? Math.max(...versions, 0) + 1 : null;

  return NextResponse.json({
    cached_versions: versions,
    next_available_version: nextAvailable,
    max_versions_reached: versions.length >= 3,
  });
}
