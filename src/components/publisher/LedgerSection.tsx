'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Mail, Instagram, Youtube, Twitter, Facebook } from 'lucide-react';
import { getCopyrightYear } from '@/lib/copyright';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';
import PurchaseModal from '@/components/book/PurchaseModal';

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 2.5c-2.3 0-4 1.7-4 4.2v.4c0 .3-.1.6-.3.9-.3.5-.8.8-1.3 1-1 .3-1.4.8-1.4 1.2 0 .6.6 1 1.4 1.2.2.1.4.3.4.5 0 .2-.1.4-.2.6-.2.4-.6.8-1.2 1-.2.1-.3.3-.3.5 0 .3.3.6.7.7.4.1.8.2 1.2.3.3.1.6.3.7.6.4.8 1.2 2.3 3.2 2.3h.2c2 0 2.8-1.5 3.2-2.3.1-.3.4-.5.7-.6.4-.1.8-.2 1.2-.3.4-.1.7-.4.7-.7 0-.2-.1-.4-.3-.5-.6-.2-1-.6-1.2-1-.1-.2-.2-.4-.2-.6 0-.3.2-.4.4-.5.8-.2 1.4-.6 1.4-1.2 0-.4-.4-.9-1.4-1.2-.6-.2-1-.5-1.3-1-.2-.3-.3-.6-.3-.9v-.4c0-2.5-1.7-4.2-4-4.2Z"
      fill="currentColor"
    />
  </svg>
);

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/lightofeolles', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@lightofeolles', icon: Youtube },
  { name: 'Twitter', href: 'https://twitter.com/lightofeolles', icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com/lightofeolles', icon: Facebook },
  { name: 'Snapchat', href: 'https://www.snapchat.com/add/lightofeolles', icon: SnapchatIcon },
];

export default function LedgerSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <>
      <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
    <section className="relative bg-onyx py-24 md:py-32 border-t border-gold/10">
      {/* Subtle gold accent at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Contact Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-gold/40 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.ledger.label}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-parchment">
            {dict.ledger.headline}
          </h2>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="text-parchment/60 mb-6">
            {dict.ledger.inquiries}
          </p>
          <motion.a
            href="mailto:info@thronelightpublishing.com"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-3 text-gold text-lg md:text-xl hover:text-gold-300 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>info@thronelightpublishing.com</span>
          </motion.a>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16"
        >
          <Link 
            href="/book"
            className="text-parchment/50 hover:text-gold transition-colors duration-300"
          >
            {dict.ledger.links.book}
          </Link>
          <span className="hidden md:block text-parchment/20">•</span>
          <Link 
            href="/author"
            className="text-parchment/50 hover:text-gold transition-colors duration-300"
          >
            {dict.ledger.links.author}
          </Link>
          <span className="hidden md:block text-parchment/20">•</span>
          <button 
            onClick={() => setIsPurchaseModalOpen(true)}
            className="text-parchment/50 hover:text-gold transition-colors duration-300"
          >
            {dict.ledger.links.amazon}
          </button>
          <span className="hidden md:block text-parchment/20">•</span>
          <Link 
            href="/partner/login"
            className="text-parchment/50 hover:text-gold transition-colors duration-300"
          >
            Partners
          </Link>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center gap-4 mb-16"
        >
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
        </motion.div>

        {/* Publisher Seal */}
        <div className="text-center mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/THRONELIGHT-LOGO.png" 
            alt="Throne Light Publishing" 
            width="150"
            height="150"
          />
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center pt-8 border-t border-parchment/10"
        >
          <p className="text-parchment/30 text-sm mb-2">
            © {getCopyrightYear()} {dict.ledger.copyright}
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Link 
              href="/privacy" 
              className="text-parchment/30 text-xs hover:text-gold transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-parchment/20">•</span>
            <Link 
              href="/terms" 
              className="text-parchment/30 text-xs hover:text-gold transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-parchment/20 text-xs italic">
            {dict.ledger.slogan}
          </p>
        </motion.div>
      </div>
    </section>
    </>
  );
}
