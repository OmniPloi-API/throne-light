'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function FoundationSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-onyx">
      {/* Cinematic video-like background - parchment/gold texture */}
      <div className="absolute inset-0">
        {/* Animated gradient simulating slow-motion gold ink */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 50%, rgba(201,169,97,0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 50%, rgba(201,169,97,0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 50%, rgba(201,169,97,0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/50 via-transparent to-charcoal" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Publisher Logo/Seal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="relative inline-block">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-8 border border-gold/20 rounded-full"
            />
            {/* Inner seal */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-b from-charcoal to-onyx border-2 border-gold/50 flex items-center justify-center shadow-2xl shadow-gold/30 p-3">
              <div className="text-center flex flex-col items-center justify-center w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/THRONELIGHT-LOGO.png" 
                  alt="Throne Light Publishing" 
                  style={{ maxWidth: '100%', maxHeight: '70%', objectFit: 'contain' }}
                />
                <span className="text-gold/60 text-[8px] uppercase tracking-[0.3em] block mt-1">Est. 2025</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-parchment leading-tight mb-4">
            We Don&apos;t Distribute Books.
          </h1>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-gold leading-tight">
            We Deliver Purpose.
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8"
        >
          <p className="font-serif text-xl md:text-2xl text-parchment/70 mb-2">
            Throne Light Publishing
          </p>
          <p className="text-parchment/60 max-w-lg mx-auto leading-relaxed">
            Exists to enthrone voices, not just print them.<br />
            Awakening royalty through revelation.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="mt-12">
          <button
            onClick={() => {
              document.getElementById('mandate')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-royal"
          >
            Enter The Light
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
            className="flex flex-col items-center gap-2 text-parchment/30"
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
