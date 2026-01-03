'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function RemnantSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const dict = getDictionary(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'AUTHOR_MAILING_LIST',
          sourceDetail: 'Receive The Message signup',
        }),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
    setIsLoading(false);
  };

  return (
    <section className="relative min-h-screen flex items-center bg-ivory-200 py-24 md:py-32 overflow-hidden">
      {/* Background imagery - abstract crowd of women / light in darkness */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-ivory-300 via-ivory-200/90 to-ivory/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(201,169,97,0.25)_0%,_transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Crown Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              filter: ['drop-shadow(0 0 20px rgba(201,169,97,0.3))', 'drop-shadow(0 0 40px rgba(201,169,97,0.5))', 'drop-shadow(0 0 20px rgba(201,169,97,0.3))']
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-gold text-5xl mb-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/THRONELIGHT-CROWN.png" alt="Crown" width="64" height="64" className="w-16 h-16 mx-auto" style={{ display: 'block' }} />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-serif text-4xl md:text-6xl text-charcoal mb-4">
            {dict.remnant.headlinePart1}<span className="text-gold-600">{dict.remnant.headlinePart2}</span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-charcoal/70 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10">
            {dict.remnant.description}
          </p>
        </motion.div>

        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="max-w-md mx-auto"
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.remnant.emailPlaceholder}
                    className="w-full px-6 py-4 bg-white/70 border border-gold/30 rounded-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all shadow-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 btn-royal py-4 relative overflow-hidden"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    dict.remnant.button
                  )}
                </motion.button>

                <p className="mt-4 text-charcoal/40 text-xs">
                  {dict.remnant.privacy}
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 border border-gold/40 rounded-2xl p-8 shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-gold text-4xl mb-4"
                >
                  <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12" />
                </motion.div>
                <h3 className="font-serif text-2xl text-gold-600 mb-2">
                  {dict.remnant.successTitle}
                </h3>
                <p className="text-charcoal/70">
                  {dict.remnant.successDesc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="w-12 h-px bg-gold-500/30" />
          <span className="text-charcoal/30 text-xs uppercase tracking-[0.2em]">{dict.remnant.footerText}</span>
          <div className="w-12 h-px bg-gold-500/30" />
        </motion.div>
      </div>
    </section>
  );
}
