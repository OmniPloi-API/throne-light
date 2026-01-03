'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, X, Mail, Phone, Bell } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Audio visualizer bars - using deterministic values to avoid hydration mismatch
const barHeights = [48, 56, 44, 60, 52, 64, 40, 58, 46, 54, 50, 62];
const barDurations = [0.55, 0.68, 0.52, 0.75, 0.6, 0.72, 0.5, 0.65, 0.58, 0.7, 0.54, 0.78];

function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = 12;
  
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gold rounded-full"
          animate={isPlaying ? {
            height: [16, barHeights[i], 16],
          } : { height: 16 }}
          transition={{
            duration: barDurations[i],
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
  // Music is coming soon - never actually plays
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { language } = useLanguage();
  const dict = getDictionary(language);
  
  const tracks = dict.frequency.tracks;

  const handlePlayClick = () => {
    setShowComingSoonModal(true);
  };

  const handleTrackClick = (index: number) => {
    setCurrentTrack(index);
    setShowComingSoonModal(true);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // TODO: Send to backend/email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset and close after 2 seconds
    setTimeout(() => {
      setShowComingSoonModal(false);
      setSubmitted(false);
      setEmail('');
      setPhone('');
    }, 2000);
  };

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

            {/* Visualizer - static since music is coming soon */}
            <div className="mb-8">
              <AudioVisualizer isPlaying={false} />
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

            {/* Progress Bar - static since music is coming soon */}
            <div className="relative h-1 bg-parchment/10 rounded-full mb-8 overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-gold rounded-full w-0" />
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
                onClick={handlePlayClick}
                className="w-16 h-16 rounded-full bg-gold text-onyx flex items-center justify-center shadow-lg shadow-gold/30"
              >
                <Play className="w-7 h-7 ml-1" />
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
                    onClick={() => handleTrackClick(index)}
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

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowComingSoonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-onyx border border-gold/30 rounded-2xl p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="font-serif text-2xl text-gold mb-2">You&apos;re on the List!</h3>
                  <p className="text-parchment/60 text-sm">
                    We&apos;ll notify you when these songs are released.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative text-center">
                    <button
                      onClick={() => setShowComingSoonModal(false)}
                      className="absolute top-0 right-0 p-2 text-parchment/50 hover:text-parchment transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-gold ml-1" />
                    </div>
                    <h3 className="font-serif text-2xl text-gold mb-2">Coming Soon</h3>
                    <p className="text-parchment/60 text-sm mb-2">
                      <span className="text-parchment font-medium">&ldquo;{tracks[currentTrack].title}&rdquo;</span> is currently in production.
                    </p>
                    <p className="text-parchment/50 text-xs">
                      Be the first to know when these songs drop on streaming platforms.
                    </p>
                  </div>

                  <form onSubmit={handleNotifySubmit} className="mt-8 space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-parchment/60 text-sm mb-2">
                        <Mail className="w-4 h-4" />
                        Email Address <span className="text-gold">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-charcoal/50 border border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-parchment/60 text-sm mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number <span className="text-parchment/40">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-lg bg-charcoal/50 border border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full py-4 rounded-xl bg-gold text-onyx font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Notify Me When Released</span>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-parchment/30 text-xs text-center mt-4">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
