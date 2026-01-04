import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors when env vars aren't available
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Public client (respects RLS) - lazily initialized
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Service client (bypasses RLS - use only on server) - lazily initialized
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase service role environment variables not configured');
    }
    
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

// Legacy exports for backwards compatibility (will throw if called without env vars)
export const supabase = { get client() { return getSupabase(); } };
export const supabaseAdmin = { get client() { return getSupabaseAdmin(); } };

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
