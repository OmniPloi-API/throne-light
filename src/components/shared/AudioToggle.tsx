'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Fade out duration in seconds
const FADE_OUT_DURATION = 2;
// Loop point: 2 minutes 14 seconds = 134 seconds
const LOOP_POINT_SECONDS = 134;
// Base volume
const BASE_VOLUME = 0.3;

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFadingRef = useRef(false);
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const pathname = usePathname();
  
  // Hide AudioToggle on author page - audio is controlled by the player there
  const isAuthorPage = pathname === '/author';

  // Fade out and loop function
  const fadeOutAndLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isFadingRef.current) return;

    isFadingRef.current = true;

    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const fadeSteps = 20;
    const fadeStepDuration = (FADE_OUT_DURATION * 1000) / fadeSteps;
    const volumeStep = BASE_VOLUME / fadeSteps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, BASE_VOLUME - (volumeStep * currentStep));
      audio.volume = newVolume;

      if (currentStep >= fadeSteps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        // Reset to beginning and restore volume
        audio.currentTime = 0;
        audio.volume = BASE_VOLUME;
        isFadingRef.current = false;
      }
    }, fadeStepDuration);
  }, []);

  useEffect(() => {
    if (isAuthorPage) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      isFadingRef.current = false;
      setIsPlaying(false);
      setIsLoaded(false);
      return;
    }

    const audio = new Audio(encodeURI('/audio/EOLLES - THE KING HAS TO RISE.mp3'));
    audio.loop = false; // We handle looping manually with fade
    audio.volume = BASE_VOLUME;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    // Check for loop point during playback
    const handleTimeUpdate = () => {
      if (!isFadingRef.current && audio.currentTime >= LOOP_POINT_SECONDS - FADE_OUT_DURATION) {
        fadeOutAndLoop();
      }
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // No autoplay - let users read in peace and choose to play music
    setIsPlaying(false);

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [fadeOutAndLoop, isAuthorPage]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay blocked - user interaction required
        console.log('Audio autoplay blocked');
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Don't render on author page - audio is controlled by the player there
  if (isAuthorPage) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      onClick={toggleAudio}
      className={`fixed bottom-20 right-6 z-50 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
        isPlaying
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-parchment/20 bg-onyx/50 text-parchment/50 hover:border-gold/50 hover:text-gold/70'
      }`}
      aria-label={isPlaying ? dict.audio.mute : dict.audio.play}
    >
      {/* Subtle one-time reveal ring when audio is off (no looping flicker) */}
      {!isPlaying && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full border border-gold/30"
        />
      )}
      
      {/* Sound wave animation when playing */}
      {isPlaying && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gold/10"
        />
      )}
      
      {isPlaying ? (
        <Volume2 className="w-5 h-5 relative z-10" />
      ) : (
        <VolumeX className="w-5 h-5 relative z-10" />
      )}
    </motion.button>
  );
}
