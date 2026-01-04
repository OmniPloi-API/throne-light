'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon, Share2, ExternalLink, BookOpen, Lock, ShoppingCart, Key, X } from 'lucide-react';
import { bookData } from '@/data/books/crowded-bed-empty-throne';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  readUrl: string;
  isPurchased: boolean;
  price: number;
}

export default function ReaderHomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>([]);

  // Load preferences and purchased books
  useEffect(() => {
    setMounted(true);
    const savedDarkMode = localStorage.getItem('reader-dark-mode');
    if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');
    
    // Load purchased book IDs from localStorage (will be replaced with server auth later)
    const savedPurchases = localStorage.getItem('reader-purchased-books');
    if (savedPurchases) {
      try {
        setPurchasedBookIds(JSON.parse(savedPurchases));
      } catch {
        setPurchasedBookIds([]);
      }
    }
  }, []);

  // Save preferences
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('reader-dark-mode', String(isDarkMode));
    }
  }, [isDarkMode, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="text-gold animate-pulse">Loading your library...</div>
      </div>
    );
  }

  const handleShare = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thecrowdedbedandtheemptythrone.com';
    const shareData = {
      title: bookData.title,
      text: `Check out "${bookData.title}" by ${bookData.author}`,
      url: `${baseUrl}/book`, // Dynamic book page URL
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

  // All library books (shown regardless of purchase status)
  const libraryBooks: LibraryBook[] = [
    {
      id: 'crowded-bed-empty-throne',
      title: bookData.title,
      author: bookData.author,
      coverImage: '/images/book-cover.jpg',
      readUrl: '/reader',
      isPurchased: purchasedBookIds.includes('crowded-bed-empty-throne'),
      price: 29.99,
    },
  ];

  const handleBookClick = (book: LibraryBook, e: React.MouseEvent) => {
    if (!book.isPurchased) {
      e.preventDefault();
      setSelectedBook(book);
      setShowUnlockModal(true);
      setRedemptionCode('');
      setCodeError('');
    }
  };

  const handleRedeemCode = async () => {
    if (!redemptionCode.trim()) {
      setCodeError('Please enter a redemption code');
      return;
    }

    setIsValidating(true);
    setCodeError('');

    try {
      // Validate code against server API
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: redemptionCode.trim(),
          bookId: selectedBook?.id 
        }),
      });
      
      const data = await res.json();
      
      if (data.valid) {
        // Valid code - unlock the book
        const newPurchased = [...purchasedBookIds, selectedBook!.id];
        setPurchasedBookIds(newPurchased);
        localStorage.setItem('reader-purchased-books', JSON.stringify(newPurchased));
        
        // Store the discount info if it's a coupon code
        if (data.type === 'coupon' && data.discountPercent) {
          localStorage.setItem('reader-discount', JSON.stringify({
            partnerId: data.partnerId,
            discountPercent: data.discountPercent,
          }));
        }
        
        setShowUnlockModal(false);
        setSelectedBook(null);
      } else {
        setCodeError(data.error || 'Invalid redemption code. Please check and try again.');
      }
    } catch {
      setCodeError('Failed to validate code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePurchase = () => {
    // Redirect to purchase page with book ID
    if (selectedBook) {
      window.location.href = `/checkout?book=${selectedBook.id}&source=reader`;
    }
  };

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
            <Image 
              src="/images/THRONELIGHT-LOGO.png" 
              alt="Throne Light Publishing" 
              width={32} 
              height={32} 
              className="w-8 h-8"
              unoptimized
              priority
            />
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
            isDarkMode ? 'text-gold' : 'text-gold-700'
          }`}>
            My Library
          </h2>
          <p className={`text-sm max-w-md mx-auto ${
            isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
          }`}>
            Your royal collection awaits.
          </p>
          <div className={`w-16 h-px mx-auto mt-6 ${
            isDarkMode ? 'bg-gold/30' : 'bg-gold/40'
          }`} />
        </motion.div>

        {/* Bookshelf */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-serif text-xl ${
              isDarkMode ? 'text-gold' : 'text-gold-700'
            }`}>
              Your Bookshelf
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-gold/20 text-gold' : 'bg-gold/20 text-gold-700'
            }`}>
              {libraryBooks.length} {libraryBooks.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>

          {/* Bookshelf Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {libraryBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                {/* Book Card */}
                <Link 
                  href={book.isPurchased ? book.readUrl : '#'} 
                  className="block"
                  onClick={(e) => handleBookClick(book, e)}
                >
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

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {book.isPurchased ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gold/90' : 'bg-gold'
                        }`}>
                          <BookOpen className="w-3 h-3 text-onyx" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-charcoal/80 border border-parchment/30">
                          <Lock className="w-3 h-3 text-parchment/70" />
                        </div>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDarkMode ? 'bg-onyx/80' : 'bg-charcoal/80'
                    }`}>
                      {book.isPurchased ? (
                        <span className="text-gold font-serif text-sm">Read Now</span>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-gold mb-2" />
                          <span className="text-gold font-serif text-sm">Unlock Book</span>
                        </>
                      )}
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
                  {!book.isPurchased && (
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'
                    }`}>
                      ${book.price.toFixed(2)}
                    </p>
                  )}
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
            href="https://thronelightpublishing.com"
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
            href="https://lightofeolles.com"
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
            © {new Date().getFullYear()} Throne Light Publishing LLC. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Unlock Book Modal */}
      <AnimatePresence>
        {showUnlockModal && selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setShowUnlockModal(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-md rounded-2xl border p-6 ${
                isDarkMode 
                  ? 'bg-onyx border-gold/20' 
                  : 'bg-white border-gold/30'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      width={64}
                      height={96}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className={`font-serif text-lg ${
                      isDarkMode ? 'text-gold' : 'text-gold-700'
                    }`}>
                      Unlock This Book
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
                    }`}>
                      {selectedBook.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-parchment/50 hover:text-parchment hover:bg-charcoal/50' 
                      : 'text-charcoal/50 hover:text-charcoal hover:bg-manuscript'
                  }`}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Redemption Code Section */}
              <div className={`mt-6 p-4 rounded-xl border ${
                isDarkMode ? 'bg-charcoal/30 border-gold/10' : 'bg-manuscript border-gold/20'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Key className={`w-4 h-4 ${isDarkMode ? 'text-gold' : 'text-gold-700'}`} />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-parchment' : 'text-charcoal'
                  }`}>
                    Have a redemption code?
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={redemptionCode}
                    onChange={(e) => setRedemptionCode(e.target.value)}
                    placeholder="Enter your code"
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-onyx border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50' 
                        : 'bg-white border-gold/30 text-charcoal placeholder:text-charcoal/30 focus:border-gold/60'
                    } outline-none`}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
                  />
                  <button
                    onClick={handleRedeemCode}
                    disabled={isValidating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gold/20 text-gold hover:bg-gold/30 disabled:opacity-50' 
                        : 'bg-gold/20 text-gold-700 hover:bg-gold/30 disabled:opacity-50'
                    }`}
                  >
                    {isValidating ? 'Checking...' : 'Redeem'}
                  </button>
                </div>
                {codeError && (
                  <p className="mt-2 text-xs text-red-400">{codeError}</p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-parchment/10' : 'bg-charcoal/10'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'}`}>or</span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-parchment/10' : 'bg-charcoal/10'}`} />
              </div>

              {/* Purchase Section */}
              <button
                onClick={handlePurchase}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'bg-gold text-onyx hover:bg-gold/90' 
                    : 'bg-gold text-white hover:bg-gold/90'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Purchase for ${selectedBook.price.toFixed(2)}</span>
              </button>

              <p className={`mt-4 text-xs text-center ${
                isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'
              }`}>
                One-time purchase. Read forever on any device.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
