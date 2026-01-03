'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection, { ParticleField } from '@/components/shared/AnimatedSection';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function VoiceSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ivory">
      {/* Subtle particles */}
      <ParticleField count={20} />
      
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,97,0.15)_0%,_transparent_60%)]" />
      
      {/* Dark vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(255,254,249,0.7)_100%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Dark Circle with Glowing Crown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
            {/* Soft outer glow */}
            <motion.div
              animate={{ 
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-4 rounded-full bg-gold/10 blur-xl"
            />
            
            {/* Champagne circle container */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#f5e6d3] to-[#e8d4be] border-2 border-gold/20 overflow-hidden shadow-xl">
              {/* Soft inner glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4)_0%,_transparent_70%)]" />
              
              {/* Floating Crown Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-28 h-28 md:w-36 md:h-36"
                >
                  {/* Radiant glow behind crown */}
                  <motion.div
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-white/60 rounded-full blur-xl"
                  />
                  
                  {/* Crown image with glow effect */}
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(255,255,255,0.3))',
                        'drop-shadow(0 0 15px rgba(255,255,255,0.9)) drop-shadow(0 0 35px rgba(255,255,255,0.5))',
                        'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                      ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src="/images/Light-of-Eolles-Crown.png?v=2"
                      alt="Light of Eolles Crown"
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Subtle shimmer overlay */}
              <motion.div
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-gold-600 tracking-wide mb-4">
            {dict.authorHero.name}
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="font-serif text-xl md:text-2xl text-charcoal/80 mb-2">
            Prophetic Visionary. Sovereign Entity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <p className="text-charcoal/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed mt-6">
            Appointed by assignment. Forged in silence.<br />
            A voice for the women who are prepared to reign.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="mt-12">
          <button
            onClick={() => {
              document.getElementById('dispatch')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-royal"
          >
            Message From Above
          </button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-charcoal/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
