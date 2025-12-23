'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon, Share2, ExternalLink, BookOpen } from 'lucide-react';
import { bookData } from '@/data/books/crowded-bed-empty-throne';

export default function ReaderHomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('reader-dark-mode');
    if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('reader-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleShare = async () => {
    const shareData = {
      title: bookData.title,
      text: `Check out "${bookData.title}" by ${bookData.author}`,
      url: 'https://thronelight.com/book', // This will be the book page URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  // Purchased books (currently just the one)
  const purchasedBooks = [
    {
      id: 'crowded-bed-empty-throne',
      title: bookData.title,
      author: bookData.author,
      coverImage: '/images/book-cover.jpg',
      readUrl: '/reader',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-onyx text-parchment' : 'bg-ivory text-charcoal'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b transition-colors ${
        isDarkMode 
          ? 'bg-onyx/95 backdrop-blur-sm border-gold/20' 
          : 'bg-white/95 backdrop-blur-sm border-gold/30'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <span className="text-gold text-2xl">♛</span>
            <div>
              <h1 className={`font-serif text-lg ${
                isDarkMode ? 'text-parchment' : 'text-charcoal'
              }`}>
                Throne Light Reader
              </h1>
              <p className={`text-xs ${
                isDarkMode ? 'text-parchment/50' : 'text-charcoal/50'
              }`}>
                Your Royal Library
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-gold' 
                  : 'hover:bg-manuscript text-gold-700'
              }`}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className={`font-serif text-3xl md:text-4xl mb-4 ${
            isDarkMode ? 'text-parchment' : 'text-charcoal'
          }`}>
            My Library
          </h2>
          <p className={`text-sm max-w-md mx-auto ${
            isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
          }`}>
            Your purchased books await. Continue your royal journey.
          </p>
          <div className={`w-16 h-px mx-auto mt-6 ${
            isDarkMode ? 'bg-gold/30' : 'bg-gold/40'
          }`} />
        </motion.div>

        {/* Bookshelf */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-serif text-xl ${
              isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'
            }`}>
              Purchased Books
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-gold/20 text-gold' : 'bg-gold/20 text-gold-700'
            }`}>
              {purchasedBooks.length} {purchasedBooks.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>

          {/* Bookshelf Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {purchasedBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                {/* Book Card */}
                <Link href={book.readUrl} className="block">
                  <div className={`relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 ${
                    isDarkMode ? 'bg-charcoal' : 'bg-manuscript'
                  }`}>
                    {/* Book Cover */}
                    <Image
                      src="/images/book-cover.jpg"
                      alt={book.title}
                      width={200}
                      height={300}
                      className="object-cover w-full h-full"
                      priority
                      unoptimized
                    />

                    {/* Owned Badge */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gold/90' : 'bg-gold'
                      }`}>
                        <BookOpen className="w-3 h-3 text-onyx" />
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDarkMode ? 'bg-onyx/80' : 'bg-charcoal/80'
                    }`}>
                      <span className="text-gold font-serif text-sm">Read Now</span>
                    </div>
                  </div>
                </Link>

                {/* Book Info */}
                <div className="mt-3 text-center">
                  <p className={`font-serif text-sm truncate ${
                    isDarkMode ? 'text-parchment/90' : 'text-charcoal/90'
                  }`}>
                    {book.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gold/60' : 'text-gold-700/60'
                  }`}>
                    by <span className="uppercase">{book.author}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decorative Shelf Line */}
          <div className={`mt-8 h-2 rounded-full ${
            isDarkMode ? 'bg-gradient-to-r from-transparent via-gold/20 to-transparent' : 'bg-gradient-to-r from-transparent via-gold/30 to-transparent'
          }`} />
        </section>

        {/* Actions Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-8 rounded-2xl ${
            isDarkMode ? 'bg-charcoal/30 border border-gold/10' : 'bg-manuscript border border-gold/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className={`font-serif text-lg mb-2 ${
                isDarkMode ? 'text-parchment' : 'text-charcoal'
              }`}>
                Share the Crown
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
              }`}>
                Know a queen who needs this word? Share the book with a friend.
              </p>
            </div>

            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30' 
                  : 'bg-gold/20 hover:bg-gold/30 text-gold-700 border border-gold/40'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share This Book</span>
            </button>
          </div>
        </motion.section>

        {/* Links Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
        >
          <a
            href="https://thronelight.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm transition-colors ${
              isDarkMode 
                ? 'text-parchment/50 hover:text-gold' 
                : 'text-charcoal/50 hover:text-gold-700'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Publisher</span>
          </a>
          <span className={`${isDarkMode ? 'text-parchment/20' : 'text-charcoal/20'}`}>•</span>
          <a
            href="https://eolles.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm transition-colors ${
              isDarkMode 
                ? 'text-parchment/50 hover:text-gold' 
                : 'text-charcoal/50 hover:text-gold-700'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>About the Author</span>
          </a>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className={`py-8 mt-16 border-t ${
        isDarkMode ? 'border-gold/10' : 'border-gold/20'
      }`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`text-xs ${
            isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'
          }`}>
            Throne Light Reader • Where Queens Find Crowns
          </p>
          <p className={`text-xs mt-2 ${
            isDarkMode ? 'text-parchment/30' : 'text-charcoal/30'
          }`}>
            © {new Date().getFullYear()} Throne Light Publishing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
