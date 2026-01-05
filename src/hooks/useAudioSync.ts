'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createHash } from 'crypto';

export interface ParagraphData {
  index: number;
  text: string;
  elementId: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  activeParagraphIndex: number;
  currentAudioUrl: string | null;
  currentSegmentId: string | null;
  currentVersion: number;
  autoScrollEnabled: boolean;
  error: string | null;
  prefetchedUrls: Map<number, string>; // Pre-fetched audio URLs by paragraph index
}

interface UseAudioSyncOptions {
  bookId: string;
  languageCode?: string;
  voiceId?: string;
  onParagraphChange?: (index: number) => void;
  onError?: (error: string) => void;
}

interface AudioResponse {
  success: boolean;
  cached: boolean;
  segment_id: string;
  audio_url: string;
  version: number;
  duration_seconds?: number;
  error?: string;
}

interface ReportResponse {
  success: boolean;
  next_version: number | null;
  max_versions_reached: boolean;
  message: string;
}

export function useAudioSync(
  paragraphs: ParagraphData[],
  options: UseAudioSyncOptions
) {
  const {
    bookId,
    languageCode = 'en',
    voiceId = 'shimmer',
    onParagraphChange,
    onError,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    activeParagraphIndex: 0,
    currentAudioUrl: null,
    currentSegmentId: null,
    currentVersion: 1,
    autoScrollEnabled: true,
    error: null,
    prefetchedUrls: new Map(),
  });

  // Track which paragraphs are currently being prefetched
  const prefetchingRef = useRef<Set<number>>(new Set());
  
  // Track previous language to detect changes
  const prevLanguageRef = useRef(languageCode);

  // Reset audio state when language changes
  useEffect(() => {
    if (prevLanguageRef.current !== languageCode) {
      console.log(`Language changed from ${prevLanguageRef.current} to ${languageCode} - resetting audio`);
      
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Clear paragraph highlights
      paragraphs.forEach((p) => {
        const el = document.getElementById(p.elementId);
        if (el) {
          el.classList.remove('audio-active-paragraph', 'audio-playing-now');
        }
      });
      
      // Clear all prefetched URLs and reset state
      prefetchingRef.current.clear();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        activeParagraphIndex: 0,
        currentAudioUrl: null,
        currentSegmentId: null,
        currentVersion: 1,
        prefetchedUrls: new Map(),
        error: null,
      }));
      
      prevLanguageRef.current = languageCode;
    }
  }, [languageCode, paragraphs]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Generate MD5 hash of text (client-side compatible)
  const generateHash = useCallback((text: string): string => {
    // Simple hash for client-side (browser-compatible)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }, []);

  // Fetch audio for a paragraph
  const fetchAudio = useCallback(async (
    paragraphIndex: number,
    version: number = 1
  ): Promise<AudioResponse | null> => {
    if (paragraphIndex < 0 || paragraphIndex >= paragraphs.length) {
      return null;
    }

    const paragraph = paragraphs[paragraphIndex];

    try {
      const response = await fetch('/api/audio/get-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: paragraph.text,
          book_id: bookId,
          language_code: languageCode,
          segment_index: paragraphIndex,
          requested_version: version,
          voice_id: voiceId,
        }),
      });

      const data: AudioResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch audio');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audio';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      return null;
    }
  }, [paragraphs, bookId, languageCode, voiceId, onError]);

  // Update paragraph highlight - keeps highlight on current paragraph while playing
  const updateParagraphHighlight = useCallback((index: number, isPlaying: boolean) => {
    // Remove highlight from all paragraphs first
    paragraphs.forEach((p) => {
      const el = document.getElementById(p.elementId);
      if (el) {
        el.classList.remove('audio-active-paragraph', 'audio-playing-now');
      }
    });

    // Add highlight to current paragraph if playing
    if (isPlaying) {
      const paragraph = paragraphs[index];
      if (paragraph) {
        const element = document.getElementById(paragraph.elementId);
        if (element) {
          element.classList.add('audio-active-paragraph', 'audio-playing-now');
        }
      }
    }
  }, [paragraphs]);

  // Scroll to paragraph
  const scrollToParagraph = useCallback((index: number) => {
    if (!state.autoScrollEnabled) return;

    const paragraph = paragraphs[index];
    if (!paragraph) return;

    const element = document.getElementById(paragraph.elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [paragraphs, state.autoScrollEnabled]);

  // Prefetch next paragraphs while current is playing
  const prefetchNext = useCallback((fromIndex: number) => {
    // Prefetch next 2 paragraphs
    const prefetchCount = 2;
    
    for (let i = 1; i <= prefetchCount; i++) {
      const nextIndex = fromIndex + i;
      
      // Skip if out of bounds or currently prefetching
      if (nextIndex >= paragraphs.length) continue;
      if (prefetchingRef.current.has(nextIndex)) continue;
      
      // Mark as prefetching
      prefetchingRef.current.add(nextIndex);
      
      // Fetch in background (don't await)
      fetchAudio(nextIndex, 1).then((audioData) => {
        prefetchingRef.current.delete(nextIndex);
        
        if (audioData) {
          setState(prev => {
            const newMap = new Map(prev.prefetchedUrls);
            newMap.set(nextIndex, audioData.audio_url);
            return { ...prev, prefetchedUrls: newMap };
          });
        }
      }).catch(() => {
        prefetchingRef.current.delete(nextIndex);
      });
    }
  }, [paragraphs.length, fetchAudio]);

  // Play specific paragraph
  const playParagraph = useCallback(async (index: number, version: number = 1) => {
    if (!audioRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const audioData = await fetchAudio(index, version);

    if (!audioData) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    audioRef.current.src = audioData.audio_url;
    audioRef.current.load();

    setState(prev => ({
      ...prev,
      isLoading: false,
      isPlaying: true,
      activeParagraphIndex: index,
      currentAudioUrl: audioData.audio_url,
      currentSegmentId: audioData.segment_id,
      currentVersion: audioData.version,
    }));

    // Update highlight and scroll
    updateParagraphHighlight(index, true);
    scrollToParagraph(index);
    onParagraphChange?.(index);

    try {
      await audioRef.current.play();
      // Start prefetching next paragraphs as soon as playback begins
      prefetchNext(index);
    } catch (error) {
      console.error('Playback error:', error);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [fetchAudio, scrollToParagraph, onParagraphChange, updateParagraphHighlight, prefetchNext]);

  // Handle audio ended - auto-advance to next paragraph
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = state.activeParagraphIndex + 1;

      if (nextIndex < paragraphs.length) {
        // Check if we have prefetched audio for next paragraph
        const prefetchedUrl = state.prefetchedUrls.get(nextIndex);
        
        if (prefetchedUrl) {
          // Use prefetched audio - instant playback!
          if (audioRef.current) {
            audioRef.current.src = prefetchedUrl;
            audioRef.current.load();
            
            setState(prev => ({
              ...prev,
              activeParagraphIndex: nextIndex,
              currentAudioUrl: prefetchedUrl,
            }));
            
            updateParagraphHighlight(nextIndex, true);
            scrollToParagraph(nextIndex);
            onParagraphChange?.(nextIndex);
            
            audioRef.current.play().catch(console.error);
            
            // Continue prefetching
            prefetchNext(nextIndex);
          }
        } else {
          // Fallback: fetch and play normally
          playParagraph(nextIndex, 1);
        }
      } else {
        // Reached end of content
        updateParagraphHighlight(state.activeParagraphIndex, false);
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        error: 'Audio playback error',
      }));
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.activeParagraphIndex, paragraphs.length, playParagraph, state.prefetchedUrls, updateParagraphHighlight, scrollToParagraph, onParagraphChange, prefetchNext]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      updateParagraphHighlight(state.activeParagraphIndex, false);
    } else if (state.currentAudioUrl) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      updateParagraphHighlight(state.activeParagraphIndex, true);
    } else {
      // Start from current or first paragraph
      playParagraph(state.activeParagraphIndex, 1);
    }
  }, [state.isPlaying, state.currentAudioUrl, state.activeParagraphIndex, playParagraph, updateParagraphHighlight]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      // Remove highlight when paused
      updateParagraphHighlight(state.activeParagraphIndex, false);
    }
  }, [state.activeParagraphIndex, updateParagraphHighlight]);

  // Stop and reset
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Remove all highlights
    updateParagraphHighlight(0, false);
    setState(prev => ({
      ...prev,
      isPlaying: false,
      activeParagraphIndex: 0,
      currentAudioUrl: null,
      currentSegmentId: null,
    }));
  }, [updateParagraphHighlight]);

  // Skip to specific paragraph
  const skipTo = useCallback((index: number) => {
    if (index >= 0 && index < paragraphs.length) {
      playParagraph(index, 1);
    }
  }, [paragraphs.length, playParagraph]);

  // Skip forward/backward
  const skipForward = useCallback(() => {
    skipTo(state.activeParagraphIndex + 1);
  }, [state.activeParagraphIndex, skipTo]);

  const skipBackward = useCallback(() => {
    skipTo(state.activeParagraphIndex - 1);
  }, [state.activeParagraphIndex, skipTo]);

  // Toggle auto-scroll
  const toggleAutoScroll = useCallback(() => {
    setState(prev => ({
      ...prev,
      autoScrollEnabled: !prev.autoScrollEnabled,
    }));
  }, []);

  // Report issue with current audio
  const reportIssue = useCallback(async (
    issueType: string,
    comment?: string
  ): Promise<ReportResponse | null> => {
    if (!state.currentSegmentId) {
      return null;
    }

    // Pause audio while reporting
    pause();

    try {
      const response = await fetch('/api/audio/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_segment_id: state.currentSegmentId,
          issue_type: issueType,
          comment,
          session_id: getSessionId(),
        }),
      });

      const data: ReportResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // If next version is available, play it
      if (data.next_version && !data.max_versions_reached) {
        await playParagraph(state.activeParagraphIndex, data.next_version);
      }

      return data;
    } catch (error) {
      console.error('Report error:', error);
      return null;
    }
  }, [state.currentSegmentId, state.activeParagraphIndex, pause, playParagraph]);

  return {
    // State
    ...state,
    audioRef,
    totalParagraphs: paragraphs.length,

    // Controls
    togglePlay,
    pause,
    stop,
    skipTo,
    skipForward,
    skipBackward,
    toggleAutoScroll,
    reportIssue,
    playParagraph,
  };
}

// Helper to get/create session ID for anonymous feedback tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('audio-session-id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('audio-session-id', sessionId);
  }
  return sessionId;
}

export default useAudioSync;
