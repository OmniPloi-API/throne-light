'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Divine reveal animation config
const divineReveal = {
  initial: { opacity: 0, filter: 'blur(8px)', clipPath: 'inset(0 50% 0 50%)' },
  whileInView: { opacity: 1, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0%)' },
  viewport: { once: true },
  transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const }
};

export default function MandateSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <section id="mandate" className="relative min-h-screen flex items-center bg-charcoal py-24 md:py-32">
      {/* Subtle texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,97,0.04)_0%,_transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-gold/40 text-xs uppercase tracking-[0.3em] font-sans block mb-6">
            {dict.mandate.label}
          </span>
        </motion.div>

        {/* Main Mission Statement */}
        <motion.div
          {...divineReveal}
          transition={{ ...divineReveal.transition, delay: 0.2 }}
        >
          <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl text-parchment leading-relaxed mb-8">
            {dict.mandate.headlinePart1}
            <span className="block text-gold mt-4">
              {dict.mandate.headlinePart2}
            </span>
          </h2>
        </motion.div>

        {/* Supporting Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-parchment/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            {dict.mandate.description}
          </p>
        </motion.div>

        {/* Throne Light Seal/Crest */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="relative">
              {/* Outer decorative border */}
              <div className="absolute -inset-4 border border-gold/20 rounded-lg" />
              <div className="absolute -inset-8 border border-gold/10 rounded-lg" />
              
              {/* Main seal */}
              <div className="bg-onyx/90 border border-gold/40 rounded-lg p-8 md:p-12 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/THRONELIGHT-LOGO.png" alt="Throne Light Publishing" className="w-20 h-20 mx-auto mb-4" />
                <h3 className="font-serif text-xl md:text-2xl text-gold mb-2">
                  {dict.mandate.sealTitle}
                </h3>
                <div className="w-16 h-px bg-gold/40 mx-auto my-4" />
                <p className="text-parchment/60 text-sm uppercase tracking-[0.2em]">
                  {dict.mandate.sealSubtitle}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Values/Pillars */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {dict.mandate.pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h4 className="font-serif text-xl text-gold mb-2">{pillar.title}</h4>
              <p className="text-parchment/50 text-sm">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
