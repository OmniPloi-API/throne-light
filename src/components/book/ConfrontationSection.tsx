'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function ConfrontationSection() {
  const sectionRef = useRef(null);
  const { language } = useLanguage();
  const dict = getDictionary(language);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'center center'],
  });

  // Scale effect for the main question
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-onyx py-24"
    >
      {/* High contrast background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 to-onyx" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* The Main Question - Sticky effect */}
        <motion.div
          style={{ scale, opacity }}
          className="mb-16"
        >
          <AnimatedSection animation="unblur">
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-parchment leading-tight">
              {dict.confrontation.questionPart1}
              <span className="block text-gold mt-2">{dict.confrontation.questionPart2}</span>
            </h2>
          </AnimatedSection>
        </motion.div>

        {/* Supporting Text - Blur to clarity animation */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-parchment/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            {dict.confrontation.text1Part1}<span className="text-gold italic">{dict.confrontation.text1Part2}</span>{dict.confrontation.text1Part3}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-parchment/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {dict.confrontation.text2Part1}
            <span className="block mt-4 text-gold font-serif text-2xl italic">
              {dict.confrontation.text2Part2}
            </span>
          </p>
        </motion.div>

        {/* Decorative element */}
        <AnimatedSection animation="fadeIn" delay={800}>
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-gold/30" />
            <div className="text-gold text-2xl">♛</div>
            <div className="w-12 h-px bg-gold/30" />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
