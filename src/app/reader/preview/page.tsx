'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Moon, Sun, X } from 'lucide-react';
import Link from 'next/link';

export default function ReaderPreviewPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Preview pages

  const previewContent = [
    {
      page: 1,
      title: "The Crowded Bed & The Empty Throne",
      content: `A Preview

This is a preview of the Throne Light Reader experience. 

The full book will be available here after purchase, featuring:

• Beautiful, distraction-free reading
• Dark and light modes
• Offline access on your device
• Synced progress across devices
• Exclusive bonus content

Purchase the digital edition to unlock the complete book and experience the full revelation.`
    },
    {
      page: 2,
      title: "Coming Soon",
      content: `The Throne Light Reader

Your sacred reading sanctuary is being prepared.

When you purchase the digital edition, you'll receive:

✓ Instant access to the complete book
✓ A beautiful, ad-free reading experience
✓ The ability to highlight and bookmark passages
✓ Exclusive author commentary and insights
✓ Future updates and bonus content

This reader is designed for those ready to receive the full transmission.`
    },
    {
      page: 3,
      title: "Ready to Begin?",
      content: `Claim Your Crown

The full book awaits those who are ready to step into their sovereignty.

Purchase the digital edition for $9.99 and begin your journey immediately.

Or choose the premium physical edition to hold this prophetic gift in your hands.

The throne is calling. Will you answer?`
    }
  ];

  const currentContent = previewContent[currentPage - 1];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-charcoal' : 'bg-manuscript'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b transition-colors ${
        isDarkMode 
          ? 'bg-onyx border-gold/20' 
          : 'bg-ivory border-gold/30'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/book"
            className={`flex items-center gap-2 text-sm transition-colors ${
              isDarkMode 
                ? 'text-parchment/60 hover:text-parchment' 
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <X className="w-4 h-4" />
            <span>Close Preview</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className={`text-xs ${isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'}`}>
              Preview Mode
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-charcoal/50 text-gold hover:bg-charcoal' 
                  : 'bg-manuscript text-gold-700 hover:bg-manuscript-200'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[60vh]"
        >
          {/* Page Title */}
          <h1 className={`font-serif text-3xl md:text-4xl mb-8 ${
            isDarkMode ? 'text-parchment' : 'text-charcoal'
          }`}>
            {currentContent.title}
          </h1>

          {/* Page Content */}
          <div className={`font-serif text-lg leading-relaxed whitespace-pre-line ${
            isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'
          }`}>
            {currentContent.content}
          </div>

          {/* Purchase CTA on last page */}
          {currentPage === totalPages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Link
                href="/book"
                className="btn-royal inline-flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Purchase Full Book</span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Navigation Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t transition-colors ${
        isDarkMode 
          ? 'bg-onyx/95 backdrop-blur-sm border-gold/20' 
          : 'bg-ivory/95 backdrop-blur-sm border-gold/30'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'text-parchment hover:bg-charcoal/50'
                : 'text-charcoal hover:bg-manuscript-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Previous</span>
          </button>

          <span className={`text-sm ${isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'}`}>
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'text-parchment hover:bg-charcoal/50'
                : 'text-charcoal hover:bg-manuscript-200'
            }`}
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
