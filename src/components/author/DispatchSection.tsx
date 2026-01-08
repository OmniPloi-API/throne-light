'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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

export default function DispatchSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <section id="dispatch" className="relative min-h-screen bg-ivory-200 py-24 md:py-32">
      {/* Abstract fire/light imagery - subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(201,169,97,0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(201,169,97,0.08)_0%,_transparent_40%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <span className="text-gold-600/60 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.dispatch.label}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal">
            <span className="text-gold-600">{dict.dispatch.headline}</span>
          </h2>
        </AnimatedSection>

        {/* Editorial Layout - Two Columns (Divine reveal, no looping flicker) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            <DivineReveal>
              <p className="text-charcoal/80 text-lg md:text-xl leading-relaxed font-sans first-letter:text-5xl first-letter:font-serif first-letter:text-gold-600 first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                {dict.dispatch.text1Part1}
              </p>
            </DivineReveal>
            <DivineReveal delay={400}>
              <p className="text-charcoal/70 text-lg leading-relaxed">
                {dict.dispatch.text2}
              </p>
            </DivineReveal>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <DivineReveal>
              <p className="text-charcoal/80 text-lg md:text-xl leading-relaxed font-sans">
                {dict.dispatch.text3Part1}<span className="text-gold-600">{dict.dispatch.text3Part2}</span>{dict.dispatch.text3Part3}
              </p>
            </DivineReveal>
            <DivineReveal delay={400}>
              <p className="text-charcoal/70 text-lg leading-relaxed">
                {dict.dispatch.text4}
              </p>
            </DivineReveal>
          </div>
        </div>

        {/* Pull Quote */}
        <div className="mt-20">
          <blockquote className="relative max-w-3xl mx-auto text-center">
            {/* Decorative quotes */}
            <span className="absolute -top-8 left-0 text-gold-500/30 text-8xl font-serif">&ldquo;</span>
            <p className="font-serif text-2xl md:text-4xl text-charcoal italic leading-relaxed">
              <DivineReveal delay={400}>
                {dict.dispatch.quotePart1}
              </DivineReveal>
              <span className="block text-gold-600 mt-2">
                <DivineReveal delay={800}>
                  {dict.dispatch.quotePart2}
                </DivineReveal>
              </span>
            </p>
            <span className="absolute -bottom-12 right-0 text-gold-500/30 text-8xl font-serif">&rdquo;</span>
          </blockquote>
        </div>

        {/* Divider with crown */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 flex items-center justify-center gap-6"
        >
          <div className="w-24 h-px bg-gradient-to-r from-transparent to-gold-500/40" />
          <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={32} height={32} className="w-8 h-8" />
          <div className="w-24 h-px bg-gradient-to-l from-transparent to-gold-500/40" />
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 text-center"
        >
          <p className="text-charcoal/60 text-lg max-w-2xl mx-auto">
            {dict.dispatch.mission}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
