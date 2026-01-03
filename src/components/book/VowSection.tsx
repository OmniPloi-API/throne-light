'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Scroll, Heart, Check } from 'lucide-react';

const vowContent = `I vow to stop laying in beds where thrones are empty.
If he can climb into my body but won't rise into his purpose I'm gone.

I vow to stop mistaking rotation for revelation.
If I'm on the schedule, I'm not in the scroll.
If I'm in the group chat, I'm not in the covenant.

I vow to never again perform for crumbs while thrones sit vacant.
I'm not a backup plan with a bomb body.
I'm a divine decree in stilettos.

I vow to break every counterfeit that called me "different" but kept me hidden.
Different where? I was still in the lineup.
He just rotated me softer. Lied smoother. Used me slower.

I vow to bury the lie of being chosen.
If I'm not crowned in daylight, don't call me at night.
I'm not the one he vents to. I'm the one he builds with or he gets none.

I vow to stop confusing chemistry for covenant.
If all we share is heat, I'm turning the thermostat off.
Peace is the new sexy.
Clarity is the new climax.

I vow to stop begging for vision in a bed built on vibes.
I don't want to be loved loudly and led nowhere.
I want presence with purpose or silence with dignity.

I vow to remember: the throne is not climbed through seduction.
It is approached through revelation.
So if he won't rise I won't fall.

I vow to sit where heaven seats me.
Not where his ego likes me.
Not where his lust places me.
Not where his indecision keeps me.

I vow to become allergic to emotional slavery.
If I have to earn it, beg for it or decode it it's beneath me.

I vow to rise as the woman who doesn't need to be picked because I already got the memo: I was sent.

This is not self-love.
This is throne memory.

Today, I return to my seat.
As woman. As altar. As fire in human form.

If the throne is empty, I won't warm the bed.
If the vision is absent, I won't offer my oil.
If the crown isn't real, I won't shrink my roar.

This is my vow.
This is my seat.
This is my holy no.
And this is the day I stopped auditioning.`;

export default function VowSection() {
  const [isVowRevealed, setIsVowRevealed] = useState(false);
  const [name, setName] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTakeVow = () => {
    if (name.trim() && isAgreed) {
      setIsSubmitted(true);
    }
  };

  const vowParagraphs = vowContent.split('\n\n');

  return (
    <section className="relative bg-manuscript py-24 md:py-32 overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/images/parchment-texture.png')] bg-repeat opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-12">
          <span className="text-charcoal text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            THE COVENANT
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4">
            A Sacred <span className="text-gold">Declaration</span>
          </h2>
          <p className="text-charcoal/70 font-sans text-lg max-w-2xl mx-auto">
            This vow is a promise you make with yourself, for yourself because you love yourself.
          </p>
        </AnimatedSection>

        {/* Take the Vow Button */}
        {!isVowRevealed && (
          <AnimatedSection animation="fadeInUp" delay={0.2} className="text-center">
            <motion.button
              onClick={() => setIsVowRevealed(true)}
              className="group relative inline-flex items-center gap-3 bg-charcoal hover:bg-charcoal/90 text-parchment px-10 py-5 rounded-lg font-serif text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Scroll className="w-6 h-6 text-gold" />
              <span>Take the Vow</span>
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-gold/0 group-hover:border-gold/50"
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </AnimatedSection>
        )}

        {/* The Vow Scroll */}
        <AnimatePresence>
          {isVowRevealed && !isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              {/* Scroll Container */}
              <div className="relative bg-parchment/80 border border-gold/30 rounded-lg shadow-2xl p-8 md:p-12 mt-8">
                {/* Decorative scroll top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-8 bg-gold/20 rounded-full blur-xl" />
                </div>

                {/* Scroll Header */}
                <div className="text-center mb-10 pb-6 border-b border-charcoal/10">
                  <Scroll className="w-10 h-10 text-gold mx-auto mb-4" />
                  <h3 className="font-serif text-2xl md:text-3xl text-charcoal italic">
                    The Vow of the Unrotated
                  </h3>
                </div>

                {/* Vow Content */}
                <div className="space-y-6 text-center">
                  {vowParagraphs.map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="font-serif text-charcoal/90 text-lg md:text-xl leading-relaxed whitespace-pre-line"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Signature Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="mt-12 pt-8 border-t border-charcoal/20"
                >
                  <div className="max-w-md mx-auto">
                    {/* Name Input */}
                    <div className="mb-6">
                      <label className="block text-charcoal/70 font-sans text-sm uppercase tracking-wide mb-2 text-center">
                        I, the undersigned, declare this vow
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-white/50 border-b-2 border-charcoal/30 focus:border-gold px-4 py-3 text-center font-serif text-xl text-charcoal placeholder:text-charcoal/40 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-8">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-1">
                          <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 border-2 rounded transition-all ${
                            isAgreed 
                              ? 'bg-gold border-gold' 
                              : 'border-charcoal/40 group-hover:border-gold/60'
                          }`}>
                            {isAgreed && (
                              <Check className="w-full h-full text-charcoal p-0.5" />
                            )}
                          </div>
                        </div>
                        <span className="text-charcoal/80 font-sans text-sm leading-relaxed">
                          I am making this vow <strong>with myself</strong>, <strong>for myself</strong>, 
                          because <strong>I love myself</strong>. This is my covenant with my own crown.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      onClick={handleTakeVow}
                      disabled={!name.trim() || !isAgreed}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg font-serif text-lg transition-all duration-300 ${
                        name.trim() && isAgreed
                          ? 'bg-charcoal text-parchment hover:bg-charcoal/90 shadow-lg cursor-pointer'
                          : 'bg-charcoal/30 text-charcoal/50 cursor-not-allowed'
                      }`}
                      whileHover={name.trim() && isAgreed ? { scale: 1.02 } : {}}
                      whileTap={name.trim() && isAgreed ? { scale: 0.98 } : {}}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Seal My Vow</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-8 bg-charcoal rounded-lg p-12 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-gold/20 rounded-full flex items-center justify-center"
              >
                <Heart className="w-10 h-10 text-gold" fill="currentColor" />
              </motion.div>
              <h3 className="font-serif text-2xl md:text-3xl text-parchment mb-4">
                Your Vow is Sealed, <span className="text-gold">{name}</span>
              </h3>
              <p className="text-parchment/70 font-sans text-lg max-w-lg mx-auto">
                You have made a covenant with your crown. Remember this moment.
                The throne awaits the woman who stopped auditioning.
              </p>
              <div className="mt-8 pt-6 border-t border-parchment/20">
                <p className="text-gold/80 font-serif italic text-lg">
                  "This is my vow. This is my seat. This is my holy no."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
