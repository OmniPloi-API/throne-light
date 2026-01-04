# Lazy Generation TTS System - Setup Guide

This document explains how to set up the Text-to-Speech audio system for Throne Light Reader.

## Overview

The TTS system uses a "Lazy Generation" approach:
- **Generate once, serve many**: Audio is cached and reused across users
- **Paragraph-level sync**: Audio is generated per paragraph for precise scrolling
- **Waterfall fallback**: Users can report issues and get alternative versions (max 3)
- **Community cache**: If User A generates Spanish audio, User B gets it for free

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# OpenAI API (Required for TTS generation)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (Required for caching and feedback)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys

### 2. Run the Migration

Execute the SQL migration in `supabase/migrations/001_audio_segments.sql`:

1. Go to your Supabase Dashboard → SQL Editor
2. Paste the contents of the migration file
3. Click "Run"

This creates:
- `audio_segments` table (the cache)
- `audio_feedback` table (user reports)
- Auto-flagging trigger (3+ reports = flagged)
- RLS policies for security

### 3. Create Storage Bucket

1. Go to Storage in your Supabase Dashboard
2. Create a new bucket named `audio-cache`
3. Set it to **Public** (for signed URL access)
4. Add this policy for uploads (SQL Editor):

```sql
CREATE POLICY "Service role can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-cache');

CREATE POLICY "Anyone can read audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-cache');
```

## API Endpoints

### GET/POST `/api/audio/get-paragraph`

Generates or retrieves cached audio for a paragraph.

**POST Body:**
```json
{
  "text": "The paragraph text to convert to speech",
  "book_id": "crowded-bed-empty-throne",
  "language_code": "en",
  "segment_index": 0,
  "requested_version": 1,
  "voice_id": "shimmer"
}
```

**Response:**
```json
{
  "success": true,
  "cached": true,
  "segment_id": "uuid",
  "audio_url": "https://signed-url...",
  "version": 1,
  "duration_seconds": 12.5
}
```

### POST `/api/audio/report-issue`

Reports a problem with audio quality.

**POST Body:**
```json
{
  "audio_segment_id": "uuid",
  "issue_type": "robotic",
  "comment": "Optional description"
}
```

**Issue Types:**
- `wrong_language`
- `glitch`
- `robotic`
- `mispronunciation`
- `wrong_speed`
- `other`

**Response:**
```json
{
  "success": true,
  "next_version": 2,
  "max_versions_reached": false,
  "message": "Feedback recorded. Version 2 is available."
}
```

### GET/POST `/api/audio/flagged`

Admin endpoint for managing flagged audio segments.

## Voice Options

Available OpenAI TTS voices:
- `shimmer` (default) - Warm, expressive female voice
- `alloy` - Neutral, versatile
- `echo` - Warm male voice
- `fable` - British accent
- `onyx` - Deep male voice
- `nova` - Professional female voice

## Version Speed Variants

When users report issues, they get a slightly different version:
- **Version 1**: Speed 1.0 (normal)
- **Version 2**: Speed 0.98 (slightly slower)
- **Version 3**: Speed 1.02 (slightly faster)

## Cost Estimation

OpenAI TTS-1 pricing: $0.015 per 1,000 characters

Example for a 50,000-word book (~250,000 characters):
- First generation: ~$3.75
- All subsequent users: $0 (cached)

## Frontend Components

### ReaderAudioPlayer

Floating audio controls with:
- Play/Pause
- Skip forward/backward
- Mute toggle
- Progress indicator
- Thumbs down for reporting issues

### useAudioSync Hook

Manages:
- Audio fetching and caching
- Paragraph scrolling on audio end
- Version waterfall on reports

## Usage in Reader

```tsx
import ReaderAudioPlayer from '@/components/reader/ReaderAudioPlayer';
import { ParagraphData } from '@/hooks/useAudioSync';

// Build paragraph data
const paragraphs: ParagraphData[] = content.map((text, index) => ({
  index,
  text,
  elementId: `para-${sectionId}-${index}`,
}));

// Render player
<ReaderAudioPlayer
  paragraphs={paragraphs}
  bookId="crowded-bed-empty-throne"
  languageCode="en"
  voiceId="shimmer"
  isDarkMode={true}
/>
```

## Admin Dashboard

Flagged segments appear in the admin panel at `/admin` (coming soon).

Actions available:
- **Unflag**: Mark as false positive
- **Resolve All**: Mark all reports as resolved
- **Delete Segment**: Remove from cache (will regenerate on next request)

## Troubleshooting

### "Failed to generate audio"
- Check `OPENAI_API_KEY` is valid
- Verify you have TTS access on your OpenAI account

### "Failed to upload audio file"
- Check Supabase storage bucket exists
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### "Invalid redemption code"
- Ensure the migration was run successfully
- Check RLS policies are in place

## Architecture Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Reader    │────▶│  /api/audio/     │────▶│   Supabase DB   │
│  Component  │     │  get-paragraph   │     │ audio_segments  │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │                         │
                            │ (cache miss)            │ (cache hit)
                            ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │   OpenAI TTS     │     │ Supabase Storage│
                    │   tts-1 API      │────▶│   audio-cache   │
                    └──────────────────┘     └─────────────────┘
```

## Future Enhancements

- [ ] Pre-generate popular sections overnight
- [ ] Support for background music mixing
- [ ] Narrator selection (multiple voices per book)
- [ ] Audiobook-style chapter transitions
- [ ] Download full chapter audio as MP3
