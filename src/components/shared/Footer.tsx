'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';
import { getCopyrightYear } from '@/lib/copyright';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

interface FooterProps {
  variant?: 'book' | 'author' | 'publisher';
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/lightofeolles', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@lightofeolles', icon: Youtube },
  { name: 'Twitter', href: 'https://twitter.com/lightofeolles', icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com/lightofeolles', icon: Facebook },
];

export default function Footer({ variant = 'book' }: FooterProps) {
  const { language } = useLanguage();
  const dict = getDictionary(language);

  return (
    <footer className="relative bg-onyx border-t border-gold/10">
      {/* Gold accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h4 className="font-serif text-xl text-gold mb-4">Throne Light</h4>
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
          <p className="text-parchment/30 text-xs font-sans">
            © {getCopyrightYear()} {dict.footer.rights}
          </p>
          <p className="text-parchment/30 text-xs font-sans italic">
            {dict.footer.slogan}
          </p>
        </div>
      </div>
    </footer>
  );
}
