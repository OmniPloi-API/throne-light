import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client (bypasses RLS - use only on server)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types for audio system
export interface AudioSegment {
  id: string;
  book_id: string;
  content_hash: string;
  segment_index: number;
  language_code: string;
  voice_id: string;
  version_number: number;
  storage_path: string;
  duration_seconds?: number;
  flagged_for_review: boolean;
  generation_cost_cents?: number;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export interface AudioFeedback {
  id: string;
  audio_segment_id: string;
  user_id?: string;
  session_id?: string;
  issue_type: 'wrong_language' | 'glitch' | 'robotic' | 'mispronunciation' | 'wrong_speed' | 'other';
  comment?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export type IssueType = AudioFeedback['issue_type'];
