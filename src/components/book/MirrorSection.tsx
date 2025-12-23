'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

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

export default function MirrorSection() {
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const dict = getDictionary(language);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Background shifts as user scrolls - manuscript theme
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['rgba(239, 231, 216, 1)', 'rgba(232, 220, 200, 1)', 'rgba(220, 207, 181, 1)']
  );

  return (
    <motion.section
      ref={sectionRef}
      style={{ backgroundColor }}
      className="relative min-h-screen flex items-center py-24 md:py-32"
    >
      {/* Section header */}
      <div className="absolute top-16 left-0 right-0 text-center">
        <AnimatedSection animation="fadeIn" delay={200}>
          <span className="text-gold-600/60 text-xs uppercase tracking-[0.3em] font-sans">
            {dict.mirror.label}
          </span>
        </AnimatedSection>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Left Column - Blur to clarity animation */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-charcoal/80 text-lg md:text-xl leading-relaxed font-sans">
              {dict.mirror.text1Part1}<span className="text-gold-700">{dict.mirror.text1Part2}</span>{dict.mirror.text1Part3}
            </p>
          </motion.div>

          {/* Right Column - Blur to clarity animation */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-charcoal/80 text-lg md:text-xl leading-relaxed font-sans">
              {dict.mirror.text2Part1}<span className="text-gold-700">{dict.mirror.text2Part2}</span>{dict.mirror.text2Part3}
            </p>
          </motion.div>
        </div>

        {/* Pull Quote */}
        <div className="mt-16 md:mt-24">
          <blockquote className="pull-quote">
            <DivineReveal delay={600}>
              &ldquo;{dict.mirror.quote}&rdquo;
            </DivineReveal>
          </blockquote>
        </div>

        {/* Divider */}
        <AnimatedSection animation="fadeIn" delay={900}>
          <div className="divider-throne mt-16" />
        </AnimatedSection>
      </div>
    </motion.section>
  );
}
