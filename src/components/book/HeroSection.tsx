'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ParticleField } from '@/components/shared';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';
import PurchaseModal from './PurchaseModal';

// Divine light expansion animation - smooth reveal without flicker
const DivineReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.span
      className="inline-block py-1"
      initial={{ 
        clipPath: 'inset(-10% 50% -10% 50%)',
        opacity: 0,
        filter: 'blur(8px)'
      }}
      animate={{ 
        clipPath: 'inset(-10% 0% -10% 0%)',
        opacity: 1,
        filter: 'blur(0px)'
      }}
      transition={{ 
        delay: delay / 1000,
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.span>
  );
};

export default function HeroSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <>
      <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-manuscript">
      {/* Silk drapes background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5ede0] via-[#efe5d5] to-[#e8dcc8]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(201, 169, 97, 0.03) 40px,
              rgba(201, 169, 97, 0.03) 80px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 100px,
              rgba(255, 255, 255, 0.1) 100px,
              rgba(255, 255, 255, 0.1) 102px
            ),
            radial-gradient(ellipse at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.08) 0%, transparent 70%)
          `
        }} />
        {/* Flowing silk wave effect */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23c9a96120' d='M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          opacity: 0.3
        }} />
      </div>
      
      {/* Particle effects - dust motes in light */}
      <ParticleField count={30} />
      
      {/* Subtle radial gradient for throne light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,97,0.15)_0%,_transparent_70%)]" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
        {/* Book Cover - Floating Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative inline-block"
          >
            {/* Book glow effect */}
            <div className="absolute -inset-8 bg-gold/10 blur-3xl rounded-full" />
            
            {/* Book cover image */}
            <Image
              src="/images/book-cover.jpg"
              alt="The Crowded Bed & The Empty Throne by Eolles"
              width={320}
              height={437}
              className="rounded-lg shadow-2xl shadow-gold/20 border border-gold/20 w-64 md:w-80 h-auto"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>

        {/* Headline - Divine Light Expansion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-charcoal leading-normal pb-2 mb-6">
            <DivineReveal delay={800}>
              {dict.hero.headlinePart1}
            </DivineReveal>
            <br />
            <span className="text-gold-700">
              <DivineReveal delay={2200}>
                {dict.hero.headlinePart2}
              </DivineReveal>
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 1 }}
          className="font-sans text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {dict.hero.subheadlinePart1}
          <br />
          <span className="text-gold-700">{dict.hero.subheadlinePart2}</span>
        </motion.p>

        {/* CTA Button */}
        <div>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="btn-royal inline-flex items-center gap-3"
          >
            <span>{dict.hero.cta}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-charcoal/40"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-sans">{dict.hero.scroll}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
