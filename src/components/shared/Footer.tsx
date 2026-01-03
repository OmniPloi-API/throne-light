'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook, Download, X, Apple, Monitor } from 'lucide-react';
import { getCopyrightYear } from '@/lib/copyright';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

interface FooterProps {
  variant?: 'book' | 'author' | 'publisher';
}

// Native app download URLs - update these when hosting is set up
const DOWNLOAD_URLS = {
  mac: '/downloads/ThroneLight-Reader.dmg', // Will be hosted on CDN or GitHub Releases
  windows: '/downloads/ThroneLight-Reader.exe',
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/lightofeolles', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@lightofeolles', icon: Youtube },
  { name: 'Twitter', href: 'https://twitter.com/lightofeolles', icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com/lightofeolles', icon: Facebook },
];

export default function Footer({ variant = 'book' }: FooterProps) {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [mounted, setMounted] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [detectedOS, setDetectedOS] = useState<'mac' | 'windows' | 'other'>('other');

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;

    // Detect OS for download recommendation
    const ua = navigator.userAgent;
    if (/Mac|iPhone|iPad|iPod/.test(ua)) {
      setDetectedOS('mac');
    } else if (/Win/.test(ua)) {
      setDetectedOS('windows');
    } else {
      setDetectedOS('other');
    }
  }, []);

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleDownload = (platform: 'mac' | 'windows') => {
    const url = DOWNLOAD_URLS[platform];
    window.open(url, '_blank');
  };

  return (
    <footer className="relative bg-onyx border-t border-gold/10">
      {/* Gold accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/CROWN-LOGO-500PX.png"
                alt="Throne Light"
                width={32}
                height={32}
                className="object-contain"
              />
              <h4 className="font-serif text-xl text-gold">Throne Light Publishing</h4>
            </div>
            <p className="text-parchment/50 text-sm font-sans leading-relaxed">
              {dict.footer.taglinePart1}<br />
              {dict.footer.taglinePart2}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] text-parchment/40 mb-4 font-sans">
              {dict.footer.constellation}
            </h5>
            <nav className="space-y-3">
              <Link 
                href="/book" 
                className="block text-parchment/70 hover:text-gold transition-colors duration-300 text-sm"
              >
                {dict.nav.taglineBook}
              </Link>
              <Link 
                href="/author" 
                className="block text-parchment/70 hover:text-gold transition-colors duration-300 text-sm"
              >
                {dict.nav.taglineAuthor}
              </Link>
              <Link 
                href="/publisher" 
                className="block text-parchment/70 hover:text-gold transition-colors duration-300 text-sm"
              >
                {dict.nav.taglinePublisher}
              </Link>
              <Link 
                href="/support" 
                className="block text-parchment/70 hover:text-gold transition-colors duration-300 text-sm"
              >
                Customer Support
              </Link>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] text-parchment/40 mb-4 font-sans">
              {dict.footer.connect}
            </h5>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full border border-parchment/20 flex items-center justify-center text-parchment/50 hover:border-gold hover:text-gold transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
            <p className="mt-4 text-parchment/40 text-sm">
              @lightofeolles
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-parchment/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <p className="text-parchment/30 text-xs font-sans">
              © {getCopyrightYear()} {dict.footer.rights}
            </p>
            <div className="flex items-center gap-3">
              <Link 
                href="/privacy" 
                className="text-parchment/30 text-xs font-sans hover:text-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-parchment/20">•</span>
              <Link 
                href="/terms" 
                className="text-parchment/30 text-xs font-sans hover:text-gold transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
          
          {/* ThroneLight Reader Download */}
          <motion.button
            onClick={handleDownloadClick}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors group"
          >
            <Download className="w-4 h-4 text-gold" />
            <span className="text-sm text-parchment/70 group-hover:text-gold transition-colors">
              Get ThroneLight Reader
            </span>
            <span className="text-xs text-parchment/40">Free</span>
          </motion.button>
          
          <p className="text-parchment/30 text-xs font-sans italic">
            {dict.footer.slogan}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showDownloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={() => setShowDownloadModal(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl border border-gold/20 bg-onyx p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="absolute top-0 right-0 p-2 text-parchment/50 hover:text-parchment transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-center pr-8">
                  <h3 className="font-serif text-xl text-gold">Download ThroneLight Reader</h3>
                  <p className="mt-2 text-sm text-parchment/60">
                    Your royal library awaits. Download the free reader app for your device.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* macOS Download */}
                <button
                  onClick={() => handleDownload('mac')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    detectedOS === 'mac'
                      ? 'border-gold bg-gold/10 hover:bg-gold/15'
                      : 'border-parchment/20 hover:border-parchment/40 hover:bg-parchment/5'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-parchment font-medium">macOS</div>
                    <div className="text-xs text-parchment/50">Download .dmg installer</div>
                  </div>
                  {detectedOS === 'mac' && (
                    <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">Recommended</span>
                  )}
                  <Download className="w-5 h-5 text-parchment/40" />
                </button>

                {/* Windows Download */}
                <button
                  onClick={() => handleDownload('windows')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    detectedOS === 'windows'
                      ? 'border-gold bg-gold/10 hover:bg-gold/15'
                      : 'border-parchment/20 hover:border-parchment/40 hover:bg-parchment/5'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-parchment font-medium">Windows</div>
                    <div className="text-xs text-parchment/50">Download .exe installer</div>
                  </div>
                  {detectedOS === 'windows' && (
                    <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">Recommended</span>
                  )}
                  <Download className="w-5 h-5 text-parchment/40" />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-parchment/10">
                <p className="text-xs text-parchment/40 text-center">
                  The reader app includes &quot;The Crowded Bed &amp; The Empty Throne&quot; on your bookshelf.
                  <br />Purchase or redeem a code to unlock the full book.
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  href="/reader/home"
                  className="flex-1 px-4 py-3 rounded-xl border border-parchment/20 text-center text-sm text-parchment/60 hover:text-parchment hover:border-parchment/30 transition-colors"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Use Web Reader Instead
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
