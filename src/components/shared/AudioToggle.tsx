'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();
  const dict = getDictionary(language);

  useEffect(() => {
    // Create a single ambient audio element for the entire app lifecycle
    const audio = new Audio('/audio/EOLLES - THE KING HAS TO RISE.mp3');
    audio.loop = true; // loops only after full track playback
    audio.volume = 0.3;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);

    // Gentle autoplay attempt on first load (may be blocked by browser)
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // Autoplay blocked - wait for user interaction
        setIsPlaying(false);
      });

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, []);

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

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      onClick={toggleAudio}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
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
