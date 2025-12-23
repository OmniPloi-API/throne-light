'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

interface NavigationProps {
  currentSite: 'book' | 'author' | 'publisher';
}

export default function Navigation({ currentSite }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { language, setLanguage, availableLanguages } = useLanguage();
  const dict = getDictionary(language);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const sites = [
    { id: 'book', name: dict.nav.book, href: '/book', tagline: dict.nav.taglineBook },
    { id: 'author', name: dict.nav.author, href: '/author', tagline: dict.nav.taglineAuthor },
    { id: 'publisher', name: dict.nav.publisher, href: '/publisher', tagline: dict.nav.taglinePublisher },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Fixed Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-onyx/95 backdrop-blur-md border-b border-gold/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Current Site */}
          <button
            onClick={() => {
              if (currentSite === 'author') {
                document.getElementById('frequency')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = `/${currentSite}`;
              }
            }}
            className="group text-left"
          >
            <span className="font-serif text-lg text-gold-600 hover:text-gold-400 transition-colors tracking-wide">
              {sites.find(s => s.id === currentSite)?.name}
            </span>
          </button>

          {/* Language + Constellation Navigation Toggle */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="inline-flex items-center gap-2 rounded-full border border-gold-600 pl-3 pr-2 py-1 text-[11px] font-sans tracking-[0.1em] uppercase text-gold-600 hover:text-onyx hover:bg-gold-600 transition-colors duration-300 min-w-[80px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{availableLanguages.find(l => l.code === language)?.flag}</span>
                  <span>{availableLanguages.find(l => l.code === language)?.code.toUpperCase()}</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-48 py-2 bg-ivory-200/98 backdrop-blur-xl border border-gold-600/20 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gold-600/10 transition-colors ${
                            language === lang.code ? 'text-gold-600 bg-gold-600/5' : 'text-gold-600/70 hover:text-gold-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-sans tracking-wider uppercase">{lang.name}</span>
                              <span className="text-[10px] opacity-60">{lang.nativeName}</span>
                            </div>
                          </div>
                          {language === lang.code && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Constellation Navigation Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 text-gold-600 hover:text-gold-400 transition-colors duration-300"
              aria-label="Open navigation"
            >
              <span className="hidden md:block text-xs uppercase tracking-[0.2em] font-sans">
                {dict.nav.choosePath}
              </span>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-onyx/98 backdrop-blur-lg"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-parchment/70 hover:text-gold transition-colors duration-300"
              aria-label="Close navigation"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Content */}
            <div className="h-full flex flex-col items-center justify-center">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gold/80 text-sm md:text-base uppercase tracking-[0.35em] mb-12 font-sans font-semibold"
              >
                {dict.nav.constellation}
              </motion.p>

              <div className="space-y-8">
                {sites.map((site, index) => (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <Link
                      href={site.href}
                      onClick={() => setIsOpen(false)}
                      className="group block"
                    >
                      <span
                        className={`font-serif text-3xl md:text-5xl transition-colors duration-300 ${
                          currentSite === site.id
                            ? 'text-gold group-hover:text-parchment'
                            : 'text-gold/70 group-hover:text-parchment'
                        }`}
                      >
                        {site.name}
                      </span>
                      <p
                        className={`mt-2 text-sm font-sans transition-colors duration-300 ${
                          currentSite === site.id
                            ? 'text-gold/60 group-hover:text-parchment/80'
                            : 'text-gold/50 group-hover:text-parchment/80'
                        }`}
                      >
                        {site.tagline}
                      </p>
                      {currentSite === site.id && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-16 h-px bg-gold mx-auto mt-4"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-12 left-0 right-0 text-center"
              >
                <p className="text-parchment/30 text-xs uppercase tracking-[0.2em] font-sans mb-4">
                  @lightofeolles
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
