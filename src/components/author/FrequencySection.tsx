'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Audio visualizer bars
function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = 12;
  
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gold rounded-full"
          animate={isPlaying ? {
            height: [16, 40 + Math.random() * 24, 16],
          } : { height: 16 }}
          transition={{
            duration: 0.5 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

export default function FrequencySection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const { language } = useLanguage();
  const dict = getDictionary(language);
  
  const tracks = dict.frequency.tracks;

  return (
    <section id="frequency" className="relative min-h-screen bg-ivory-300 py-24 md:py-32 overflow-hidden">
      {/* Dark atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ivory-200 to-ivory-300" />
      
      {/* Subtle gold glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-gold-600/60 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.frequency.label}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4">
            {dict.frequency.headline}
          </h2>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            {dict.frequency.description}
          </p>
        </motion.div>

        {/* Audio Player Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="relative bg-onyx/90 border border-gold/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-2xl"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/40 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/40 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/40 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/40 rounded-br-2xl" />

            {/* Visualizer */}
            <div className="mb-8">
              <AudioVisualizer isPlaying={isPlaying} />
            </div>

            {/* Track Info */}
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl md:text-3xl text-parchment mb-2">
                {tracks[currentTrack].title}
              </h3>
              <p className="text-gold/60 text-sm">
                Eolles • {tracks[currentTrack].duration}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-parchment/10 rounded-full mb-8 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gold rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '35%' }}
                transition={{ duration: isPlaying ? 180 : 0 }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length)}
                className="text-parchment/50 hover:text-gold transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gold text-onyx flex items-center justify-center shadow-lg shadow-gold/30"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </motion.button>
              
              <button
                onClick={() => setCurrentTrack((prev) => (prev + 1) % tracks.length)}
                className="text-parchment/50 hover:text-gold transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Track List */}
            <div className="mt-10 pt-8 border-t border-parchment/10">
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <button
                    key={track.title}
                    onClick={() => {
                      setCurrentTrack(index);
                      setIsPlaying(true);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      currentTrack === index
                        ? 'bg-gold/10 text-gold'
                        : 'text-parchment/60 hover:bg-parchment/5 hover:text-parchment'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs w-6">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-serif">{track.title}</span>
                    </div>
                    <span className="text-sm">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spotify/External Link */}
            <div className="mt-8 text-center">
              <p className="text-parchment/50 text-xs mb-4">{dict.frequency.comingSoon}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
