'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

export default function ArchiveSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  
  const catalog = [
    {
      title: dict.archive.catalog[0].title,
      author: dict.archive.catalog[0].author,
      description: dict.archive.catalog[0].description,
      year: '2025',
      status: dict.archive.catalog[0].status,
      viewBook: dict.archive.catalog[0].viewBook,
      href: '/book',
    },
  ];

  return (
    <section className="relative min-h-screen bg-onyx py-24 md:py-32">
      {/* Museum-like atmosphere */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-charcoal/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-charcoal/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-gold/40 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.archive.label}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-parchment">
            {dict.archive.headline}
          </h2>
        </motion.div>

        {/* Catalog Grid - Gallery Style */}
        <div className="grid gap-12">
          {catalog.map((book, index) => (
            <motion.div
              key={book.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.5 }}
                className="group relative"
              >
                <Link href={book.href}>
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-charcoal/30 border border-gold/10 rounded-2xl p-8 md:p-12 hover:border-gold/30 transition-all duration-500">
                    {/* Book Image - Gallery Style */}
                    <div className="relative">
                      {/* Frame effect */}
                      <div className="absolute -inset-4 border border-gold/10 rounded-lg" />
                      
                      {/* Book container */}
                      <motion.div
                        whileHover={{ rotateY: 5 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <Image
                          src="/images/book-cover.jpg"
                          alt="The Crowded Bed & The Empty Throne by Eolles"
                          width={400}
                          height={546}
                          className="rounded-lg border border-gold/20 shadow-2xl shadow-gold/10 w-full h-auto"
                          unoptimized
                        />
                      </motion.div>
                    </div>

                    {/* Book Info */}
                    <div className="space-y-6">
                      <div>
                        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-2">
                          {book.status}
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-parchment group-hover:text-gold transition-colors duration-300">
                          {book.title}
                        </h3>
                        <p className="text-parchment/50 mt-2">
                          by <span className="text-gold">{book.author}</span> • {book.year}
                        </p>
                      </div>

                      <p className="text-parchment/70 text-lg leading-relaxed">
                        {book.description}
                      </p>

                      <div className="flex items-center gap-4 text-gold">
                        <span className="text-sm uppercase tracking-[0.2em]">{book.viewBook}</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 text-center"
        >
          <div className="inline-block border border-parchment/10 rounded-lg px-8 py-6">
            <p className="text-parchment/30 text-sm uppercase tracking-[0.2em]">
              {dict.archive.comingSoon}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
