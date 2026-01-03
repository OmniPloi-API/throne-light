'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/shared/AnimatedSection';
import CrownIcon from '@/components/shared/CrownIcon';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Divine light expansion animation - smooth reveal without flicker
const FeatureReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
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

export default function ScrollSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <section className="relative min-h-screen bg-manuscript-100 py-24 md:py-32">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,97,0.12)_0%,_transparent_50%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4">
            {dict.scrollSection.headlinePart1}
          </h2>
          <h2 className="font-serif text-3xl md:text-5xl text-gold-700">
            {dict.scrollSection.headlinePart2}
          </h2>
        </AnimatedSection>

        {/* Split Layout: Book + Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Book Visual */}
          <AnimatedSection animation="slideLeft">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Book shadow */}
              <div className="absolute -inset-4 bg-gold/5 blur-2xl rounded-lg" />
              
              {/* Book container */}
              <Image
                src="/images/book-cover.jpg"
                alt="The Crowded Bed & The Empty Throne by Eolles"
                width={400}
                height={546}
                className="rounded-lg border border-gold/20 shadow-2xl w-full h-auto"
                unoptimized
              />
            </motion.div>
          </AnimatedSection>

          {/* Right: Content */}
          <div className="space-y-8">
            <FeatureReveal>
              <p className="text-charcoal/80 text-lg leading-relaxed">
                <span className="text-gold-700 font-serif text-xl">{dict.scrollSection.text1Part1}</span>{dict.scrollSection.text1Part2}
              </p>
            </FeatureReveal>

            <FeatureReveal delay={800}>
              <p className="text-charcoal/70 text-lg leading-relaxed">
                {dict.scrollSection.text2}
              </p>
            </FeatureReveal>

            {/* Features with Crown icons */}
            <div className="space-y-6 pt-6">
              {dict.scrollSection.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    <CrownIcon className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h4 className="text-gold-700 font-serif text-lg mb-1">
                      <FeatureReveal delay={500 + index * 200}>{feature.title}</FeatureReveal>
                    </h4>
                    <p className="text-charcoal/60 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <button className="btn-royal mt-6">
                {dict.scrollSection.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
