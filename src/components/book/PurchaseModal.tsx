'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  const [hasPurchased, setHasPurchased] = useState(false);

  // Check if user has already purchased on mount
  useEffect(() => {
    const purchased = localStorage.getItem('throne-light-purchased');
    setHasPurchased(purchased === 'true');
  }, [isOpen]);

  const handleClose = () => {
    setSelectedFormat(null);
    onClose();
  };

  const handleDigitalPurchase = async () => {
    // Check if user has already purchased
    if (hasPurchased) {
      // User already owns the book, redirect to reader home
      window.location.href = '/reader/home';
      return;
    }
    
    try {
      // Proceed to Stripe checkout
      const response = await fetch('/api/checkout/digital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'customer@example.com' }), // Replace with actual email
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else if (data.error) {
        console.error('Checkout error:', data.error);
        alert('Stripe checkout is not yet configured. Please contact support or try again later.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Unable to process purchase. Please try again.');
    }
  };

  const handlePhysicalPurchase = async (retailer: 'amazon' | 'direct') => {
    if (retailer === 'amazon') {
      window.open('https://www.amazon.com/ap/signin?openid.pape.max_auth_age=900&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcheckout%2Fentry%2Fbuynow%3FclientName%3DOffersX_OfferDisplay_DetailPage%26ASIN%3DB0G1TTMC2T%26storeID%3D%26qid%3D%26anti-csrftoken-a2z%3DhDcpG2jOjXbHaNcczXOE%252Bh01KkM2MRmysMC0VohBDHW0AAAAAGlXItswNDE4OTcyMy01MGZiLTQ4NzQtODZmYi03YzJiZTc4MmIxMDE%253D%26sellingCustomerID%3D%26sourceCustomerOrgListID%3D%26dropdown-selection-ubb%3Dadd-new%26viewID%3Dglance%26ctaDeviceType%3Ddesktop%26isAddon%3D0%26ref_%3Ddp_start-bbf_1_glance_chw%26dropdown-selection%3Dadd-new%26nodeID%3D%26items%255B0.base%255D%255Bquantity%255D%3D1%26sr%3D%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BdisplayString%255D%3D%252435.00%26tagActionCode%3D%26usePrimeHandler%3D0%26ctaPageType%3Ddetail%26quantity%3D1%26smokeTestEnabled%3Dfalse%26rsid%3D132-7857833-0393815%26isBuyNow%3D1%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255Bamount%255D%3D35.0%26pageLoadTimestampUTC%3D2026-01-02T01%253A43%253A55.508979180Z%26isEligibilityLogicDisabled%3D1%26items%255B0.base%255D%255Basin%255D%3DB0G1TTMC2T%26referrer%3Ddetail%26isMerchantExclusive%3D0%26merchantID%3DATVPDKIKX0DER%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BcurrencyCode%255D%3DUSD%26items%255B0.base%255D%255BofferListingId%255D%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26sourceCustomerOrgListItemID%3D%26submit.buy-now%3DSubmit%2BQuery%26pipelineType%3DChewbacca%26rebateId%3D%26offerListingID%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26session-id%3D132-7857833-0393815%26wlPopCommand%3D%26isUnrec%3D1&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amazon_checkout_us&openid.mode=checkid_setup&language=en_US&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0', '_blank');
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
          window.open('https://www.amazon.com/ap/signin?openid.pape.max_auth_age=900&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcheckout%2Fentry%2Fbuynow%3FclientName%3DOffersX_OfferDisplay_DetailPage%26ASIN%3DB0G1TTMC2T%26storeID%3D%26qid%3D%26anti-csrftoken-a2z%3DhDcpG2jOjXbHaNcczXOE%252Bh01KkM2MRmysMC0VohBDHW0AAAAAGlXItswNDE4OTcyMy01MGZiLTQ4NzQtODZmYi03YzJiZTc4MmIxMDE%253D%26sellingCustomerID%3D%26sourceCustomerOrgListID%3D%26dropdown-selection-ubb%3Dadd-new%26viewID%3Dglance%26ctaDeviceType%3Ddesktop%26isAddon%3D0%26ref_%3Ddp_start-bbf_1_glance_chw%26dropdown-selection%3Dadd-new%26nodeID%3D%26items%255B0.base%255D%255Bquantity%255D%3D1%26sr%3D%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BdisplayString%255D%3D%252435.00%26tagActionCode%3D%26usePrimeHandler%3D0%26ctaPageType%3Ddetail%26quantity%3D1%26smokeTestEnabled%3Dfalse%26rsid%3D132-7857833-0393815%26isBuyNow%3D1%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255Bamount%255D%3D35.0%26pageLoadTimestampUTC%3D2026-01-02T01%253A43%253A55.508979180Z%26isEligibilityLogicDisabled%3D1%26items%255B0.base%255D%255Basin%255D%3DB0G1TTMC2T%26referrer%3Ddetail%26isMerchantExclusive%3D0%26merchantID%3DATVPDKIKX0DER%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BcurrencyCode%255D%3DUSD%26items%255B0.base%255D%255BofferListingId%255D%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26sourceCustomerOrgListItemID%3D%26submit.buy-now%3DSubmit%2BQuery%26pipelineType%3DChewbacca%26rebateId%3D%26offerListingID%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26session-id%3D132-7857833-0393815%26wlPopCommand%3D%26isUnrec%3D1&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amazon_checkout_us&openid.mode=checkid_setup&language=en_US&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0', '_blank');
        }
      } catch (error) {
        console.error('Purchase error:', error);
        // Fallback to Amazon
        window.open('https://www.amazon.com/ap/signin?openid.pape.max_auth_age=900&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcheckout%2Fentry%2Fbuynow%3FclientName%3DOffersX_OfferDisplay_DetailPage%26ASIN%3DB0G1TTMC2T%26storeID%3D%26qid%3D%26anti-csrftoken-a2z%3DhDcpG2jOjXbHaNcczXOE%252Bh01KkM2MRmysMC0VohBDHW0AAAAAGlXItswNDE4OTcyMy01MGZiLTQ4NzQtODZmYi03YzJiZTc4MmIxMDE%253D%26sellingCustomerID%3D%26sourceCustomerOrgListID%3D%26dropdown-selection-ubb%3Dadd-new%26viewID%3Dglance%26ctaDeviceType%3Ddesktop%26isAddon%3D0%26ref_%3Ddp_start-bbf_1_glance_chw%26dropdown-selection%3Dadd-new%26nodeID%3D%26items%255B0.base%255D%255Bquantity%255D%3D1%26sr%3D%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BdisplayString%255D%3D%252435.00%26tagActionCode%3D%26usePrimeHandler%3D0%26ctaPageType%3Ddetail%26quantity%3D1%26smokeTestEnabled%3Dfalse%26rsid%3D132-7857833-0393815%26isBuyNow%3D1%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255Bamount%255D%3D35.0%26pageLoadTimestampUTC%3D2026-01-02T01%253A43%253A55.508979180Z%26isEligibilityLogicDisabled%3D1%26items%255B0.base%255D%255Basin%255D%3DB0G1TTMC2T%26referrer%3Ddetail%26isMerchantExclusive%3D0%26merchantID%3DATVPDKIKX0DER%26items%255B0.base%255D%255BcustomerVisiblePrice%255D%255BcurrencyCode%255D%3DUSD%26items%255B0.base%255D%255BofferListingId%255D%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26sourceCustomerOrgListItemID%3D%26submit.buy-now%3DSubmit%2BQuery%26pipelineType%3DChewbacca%26rebateId%3D%26offerListingID%3DWu680EAnQ6WPuEJWqGtevTruE6r%25252BD1VrRwxN%25252Finmmltc6%25252FLH%25252FTIWzl77xWgikh24ZpoJMij4jHADPAlWvynvckXlcnl09Wkk4bnGxANjOQ9xLTS0xhhBzjMS76exB8Zg9NCsLhUpsylE%25252FB26dd2beA%25253D%25253D%26session-id%3D132-7857833-0393815%26wlPopCommand%3D%26isUnrec%3D1&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amazon_checkout_us&openid.mode=checkid_setup&language=en_US&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0', '_blank');
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
                className="flex justify-center mb-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/THRONELIGHT-CROWN.png" 
                  alt="" 
                  width={48} 
                  height={48} 
                  className="w-12 h-12"
                />
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
                      <p className="text-gold font-semibold">$29.99</p>
                    </div>
                    <svg className="w-5 h-5 text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Physical Option - Direct to Amazon */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhysicalPurchase('amazon')}
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
                      <p className="text-gold font-semibold">$34.99</p>
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
                      <span>{dict.purchase?.buyDigital || 'Purchase Digital — $29.99'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : null}
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
