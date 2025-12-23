'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';
import PurchaseModal from './PurchaseModal';

// Divine light expansion animation - smooth reveal without flicker
const DivineReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.span
      className="inline-block"
      initial={{
        clipPath: 'inset(0 50% 0 50%)',
        opacity: 0,
        filter: 'blur(8px)',
      }}
      whileInView={{
        clipPath: 'inset(0 0% 0 0%)',
        opacity: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true }}
      transition={{
        delay: delay / 1000,
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.span>
  );
};

export default function AltarSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <>
      <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
      <section className="relative min-h-screen flex items-center justify-center bg-manuscript-200 py-24 md:py-32 overflow-hidden">
      {/* Gold radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,97,0.15)_0%,_transparent_60%)]" />
      
      {/* Decorative border top */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Crown icon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-gold text-5xl md:text-6xl mb-8"
          >
            ♛
          </motion.div>
        </motion.div>

        {/* Main Headline */}
        <div className="mb-4">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
            <DivineReveal delay={200}>
              {dict.altar.headlinePart1}
            </DivineReveal>
          </h2>
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-gold-700 leading-tight">
            <DivineReveal delay={600}>
              {dict.altar.headlinePart2}
            </DivineReveal>
          </h2>
        </div>

        {/* Supporting Text */}
        <DivineReveal delay={800}>
          <p className="text-charcoal/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            {dict.altar.textPart1}<br />
            {dict.altar.textPart2}<br />
            <span className="text-gold-700">{dict.altar.textPart3}</span>
          </p>
        </DivineReveal>

        {/* Book Visual */}
        <DivineReveal delay={1200}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-12"
          >
            {/* Glow effect */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-8 bg-gold/20 blur-3xl rounded-full"
            />
            
            {/* Book */}
            <Image
              src="/images/book-cover.jpg"
              alt="The Crowded Bed & The Empty Throne by Eolles"
              width={224}
              height={306}
              className="rounded-lg border border-gold/30 shadow-2xl shadow-gold/20 mx-auto w-48 md:w-56 h-auto"
              unoptimized
            />
          </motion.div>
        </DivineReveal>

        {/* Primary CTA */}
        <div className="relative z-10">
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="btn-royal inline-flex items-center gap-3 text-lg px-10 py-5 mb-8"
          >
            <span>{dict.altar.cta}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Secondary Links */}
        <div className="relative z-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <Link
              href="/publisher"
              className="text-charcoal/60 hover:text-gold-700 transition-colors duration-300"
            >
              {dict.altar.linkPublisher}
            </Link>
            <span className="hidden sm:block text-charcoal/30">|</span>
            <Link
              href="/author"
              className="text-charcoal/60 hover:text-gold-700 transition-colors duration-300"
            >
              {dict.altar.linkAuthor}
            </Link>
          </div>
        </div>

        {/* Decorative bottom element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold-600/60 text-xs uppercase tracking-[0.3em] font-sans">
            {dict.altar.sovereignty}
          </span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>
      </div>
    </section>
    </>
  );
}
