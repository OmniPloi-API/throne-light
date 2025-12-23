'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Package, Smartphone, ExternalLink, Crown } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PurchaseFormat = 'digital' | 'physical' | null;

export default function PurchaseModal({ isOpen, onClose }: PurchaseModalProps) {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [selectedFormat, setSelectedFormat] = useState<PurchaseFormat>(null);

  const handleClose = () => {
    setSelectedFormat(null);
    onClose();
  };

  const handleDigitalPurchase = async () => {
    try {
      // TODO: Collect email before checkout
      const response = await fetch('/api/checkout/digital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'customer@example.com' }), // Replace with actual email
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        // Stripe not set up yet, show reader
        window.open('/reader', '_blank');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      // Fallback to reader
      window.open('/reader', '_blank');
    }
  };

  const handlePhysicalPurchase = async (retailer: 'amazon' | 'direct') => {
    if (retailer === 'amazon') {
      window.open('https://a.co/d/iCOaWms', '_blank');
    } else {
      try {
        // TODO: Collect email and shipping before checkout
        const response = await fetch('/api/checkout/physical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'customer@example.com' }), // Replace with actual email
        });
        
        const data = await response.json();
        
        if (data.url) {
          window.location.href = data.url; // Redirect to Stripe checkout
        } else {
          // Stripe not set up yet, fallback to Amazon
          window.open('https://a.co/d/iCOaWms', '_blank');
        }
      } catch (error) {
        console.error('Purchase error:', error);
        // Fallback to Amazon
        window.open('https://a.co/d/iCOaWms', '_blank');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-ivory border border-gold/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-b from-manuscript to-ivory px-6 py-8 text-center border-b border-gold/20">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-gold text-4xl mb-4"
              >
                ♛
              </motion.div>
              
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-2">
                {dict.purchase?.title || 'Claim Your Crown'}
              </h2>
              <p className="text-charcoal/60 text-sm">
                {dict.purchase?.subtitle || 'Choose how you want to receive'}
              </p>
            </div>

            {/* Format Selection */}
            <div className="p-6">
              {!selectedFormat ? (
                <div className="grid gap-4">
                  {/* Digital Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFormat('digital')}
                    className="group relative flex items-start gap-4 p-5 bg-white border-2 border-gold/20 rounded-xl hover:border-gold/60 transition-all duration-300 text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <Smartphone className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-lg text-charcoal">
                          {dict.purchase?.digitalTitle || 'Digital Edition'}
                        </h3>
                        <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full font-sans uppercase tracking-wider">
                          {dict.purchase?.instantAccess || 'Instant'}
                        </span>
                      </div>
                      <p className="text-charcoal/60 text-sm mb-2">
                        {dict.purchase?.digitalDesc || 'Read on the Throne Light Reader app. Secure, beautiful, yours forever.'}
                      </p>
                      <p className="text-gold font-semibold">$9.99</p>
                    </div>
                    <svg className="w-5 h-5 text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Physical Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFormat('physical')}
                    className="group relative flex items-start gap-4 p-5 bg-white border-2 border-charcoal/10 rounded-xl hover:border-gold/40 transition-all duration-300 text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                      <Package className="w-6 h-6 text-charcoal/60 group-hover:text-gold transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-charcoal mb-1">
                        {dict.purchase?.physicalTitle || 'Physical Book'}
                      </h3>
                      <p className="text-charcoal/60 text-sm mb-2">
                        {dict.purchase?.physicalDesc || 'Premium paperback delivered to your throne. Perfect for your royal library.'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-charcoal/40 font-semibold line-through text-sm">$39.99</p>
                        <p className="text-gold font-semibold">$35.99</p>
                        <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full font-sans">10% OFF</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-charcoal/20 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              ) : selectedFormat === 'digital' ? (
                /* Digital Purchase Flow */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setSelectedFormat(null)}
                    className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal text-sm mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {dict.purchase?.back || 'Back to options'}
                  </button>

                  <div className="bg-gradient-to-br from-gold/5 to-gold/10 border border-gold/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="font-serif text-xl text-charcoal mb-2">
                      {dict.purchase?.readerTitle || 'Throne Light Reader'}
                    </h3>
                    <p className="text-charcoal/60 text-sm mb-4">
                      {dict.purchase?.readerDesc || 'Your purchase includes lifetime access to the secure Throne Light Reader app with:'}
                    </p>
                    <ul className="text-left text-sm text-charcoal/70 space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <span className="text-gold">✓</span> {dict.purchase?.feature1 || 'Beautiful dark & light reading modes'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold">✓</span> {dict.purchase?.feature2 || 'Offline access on your device'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold">✓</span> {dict.purchase?.feature3 || 'Synced progress & bookmarks'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gold">✓</span> {dict.purchase?.feature4 || 'Exclusive bonus content'}
                      </li>
                    </ul>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDigitalPurchase}
                      className="w-full btn-royal inline-flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>{dict.purchase?.buyDigital || 'Purchase Digital — $9.99'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* Physical Purchase Flow */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setSelectedFormat(null)}
                    className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal text-sm mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {dict.purchase?.back || 'Back to options'}
                  </button>

                  <div className="space-y-3">
                    {/* Amazon Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePhysicalPurchase('amazon')}
                      className="w-full flex items-center justify-between p-4 bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-xl hover:bg-[#FF9900]/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF9900]/20 flex items-center justify-center">
                          <span className="text-[#FF9900] text-lg">📖</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-charcoal">{dict.purchase?.amazon || 'Buy on Amazon'}</p>
                          <p className="text-charcoal/60 text-xs">{dict.purchase?.amazonDesc || 'Prime shipping available'}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-charcoal/40" />
                    </motion.button>

                    {/* Direct Purchase Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePhysicalPurchase('direct')}
                      className="w-full flex items-center justify-between p-4 bg-gold/5 border border-gold/20 rounded-xl hover:bg-gold/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                          <span className="text-gold text-lg">♛</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-charcoal">{dict.purchase?.direct || 'Buy Direct'}</p>
                          <p className="text-charcoal/60 text-xs">{dict.purchase?.directDesc || 'Support the author directly'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-charcoal/40 text-xs line-through">$39.99</span>
                        <span className="text-gold text-sm font-semibold">$35.99</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-manuscript/50 border-t border-gold/10 text-center">
              <p className="text-charcoal/40 text-xs">
                {dict.purchase?.secure || '🔒 Secure checkout powered by Stripe'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
