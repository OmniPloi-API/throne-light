'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { CrownRating } from '@/components/shared/CrownIcon';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  country: string;
  countryFlag: string;
}

export default function WitnessesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { scrollXProgress } = useScroll({
    container: containerRef,
  });

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews?diverse=true&limit=6');
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
      setLoading(false);
    }
    fetchReviews();
  }, []);

  // Use real reviews if available, otherwise fall back to dictionary testimonials
  const testimonials = reviews.length > 0 
    ? reviews.map(r => ({ quote: r.content, author: r.name, countryFlag: r.countryFlag, country: r.country }))
    : dict.witnesses.testimonials.map(t => ({ ...t, countryFlag: '🌍', country: '' }));

  return (
    <section className="relative bg-onyx py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 to-onyx" />

      <div className="relative z-10">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-16 px-6">
          <span className="text-gold/40 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.witnesses.label}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-parchment">
            {dict.witnesses.headlinePart1}<span className="text-gold">{dict.witnesses.headlinePart2}</span>
          </h2>
        </AnimatedSection>

        {/* Horizontal Scrolling Carousel */}
        <div
          ref={containerRef}
          className="overflow-x-auto scrollbar-hide pb-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex gap-6 md:gap-8 px-6 md:px-12">
            {/* Leading spacer */}
            <div className="flex-shrink-0 w-4 md:w-24" />

            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="flex-shrink-0 w-[85vw] md:w-[500px] scroll-snap-align-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <Link href="/reviews" className="block h-full">
                  <div className="bg-charcoal/50 border border-gold/10 rounded-lg p-8 md:p-10 h-full flex flex-col hover:border-gold/30 transition-colors cursor-pointer">
                    {/* Crown Rating instead of stars */}
                    <CrownRating count={5} className="mb-6" />

                    {/* Quote */}
                    <blockquote className="flex-grow">
                      <p className="text-parchment/90 text-lg md:text-xl leading-relaxed font-serif italic">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </blockquote>

                    {/* Author with Country Flag */}
                    <footer className="mt-6 pt-6 border-t border-gold/10">
                      <p className="text-gold text-sm font-sans flex items-center gap-2">
                        <span>{testimonial.author}</span>
                        {testimonial.countryFlag && (
                          <span className="text-lg" title={testimonial.country}>{testimonial.countryFlag}</span>
                        )}
                      </p>
                    </footer>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-4 md:w-24" />
          </div>
        </div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-gold/30"
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(201, 169, 97, 0.8)' }}
            />
          ))}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
