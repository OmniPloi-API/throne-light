'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, ExternalLink, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCopyrightYear } from '@/lib/copyright';

interface Partner {
  id: string;
  name: string;
  slug: string;
  couponCode: string;
  discountPercent: number;
  amazonUrl?: string;
  bookBabyUrl?: string;
}

export default function BridgePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPartner() {
      try {
        const res = await fetch(`/api/partners/${slug}`);
        if (!res.ok) {
          setError('Partner not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPartner(data);
        
        // Set attribution cookie
        document.cookie = `partner_id=${data.id}; path=/; max-age=${60 * 60 * 24 * 30}`;
        document.cookie = `partner_slug=${data.slug}; path=/; max-age=${60 * 60 * 24 * 30}`;
        document.cookie = `discount_code=${data.couponCode}; path=/; max-age=${60 * 60 * 24 * 30}`;
        
        // Track page view
        await fetch('/api/events/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerId: data.id, type: 'PAGE_VIEW' }),
        });
      } catch (err) {
        setError('Failed to load partner');
      }
      setLoading(false);
    }
    loadPartner();
  }, [slug]);

  async function handleDirectBuy() {
    if (!partner) return;
    
    // Track direct click
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'CLICK_DIRECT' }),
    });
    
    // Redirect to checkout with auto-applied coupon
    window.location.href = `/checkout?partner=${partner.id}&code=${partner.couponCode}`;
  }

  async function handleAmazonClick() {
    if (!partner) return;
    
    // Track outbound click BEFORE redirect
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'CLICK_AMAZON' }),
    });
    
    // Redirect to Amazon
    const amazonUrl = partner.amazonUrl || 'https://www.amazon.com/dp/YOUR_BOOK_ASIN';
    window.location.href = amazonUrl;
  }

  async function handleBookBabyClick() {
    if (!partner) return;
    
    // Track outbound click
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'CLICK_BOOKBABY' }),
    });
    
    // Redirect to BookBaby
    const bookBabyUrl = partner.bookBabyUrl || 'https://store.bookbaby.com/YOUR_BOOK';
    window.location.href = bookBabyUrl;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="animate-pulse text-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-parchment mb-4">Partner Not Found</h1>
          <p className="text-gray-400">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-parchment">
      {/* Header */}
      <header className="bg-gradient-to-b from-charcoal to-onyx py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Crown className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="text-gold text-sm uppercase tracking-widest mb-2">Special Offer</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gold">{partner.name}</span> recommends
            </h1>
            <p className="text-xl text-gray-300">The Crowded Bed & The Empty Throne</p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-charcoal rounded-lg overflow-hidden shadow-2xl border border-gold/20">
              <Image
                src="/images/book-cover.jpg"
                alt="The Crowded Bed & The Empty Throne by Eolles"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Discount Badge */}
            <div className="absolute -top-4 -right-4 bg-gold text-onyx font-bold px-4 py-2 rounded-full shadow-lg">
              {partner.discountPercent}% OFF
            </div>
          </motion.div>

          {/* Book Info & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gold mb-3">About the Book</h3>
              <p className="text-gray-300 leading-relaxed">
                A prophetic confrontation of the modern soul. This book peels back the layers 
                of distraction and comfort to reveal what you've been avoiding—and what's been 
                waiting for you on the other side of surrender.
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
              <span className="text-gray-400 ml-2">4.9 (127 reviews)</span>
            </div>

            {/* CTA Buttons - The Fork in the Road */}
            <div className="space-y-4">
              {/* Primary CTA - Buy Direct */}
              <button
                onClick={handleDirectBuy}
                className="w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg 
                         flex items-center justify-center gap-3 transition-all duration-300
                         shadow-lg hover:shadow-gold/30 hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Buy Direct & Save {partner.discountPercent}%</span>
              </button>
              <p className="text-center text-sm text-gray-400">
                Code <span className="font-mono text-gold">{partner.couponCode}</span> auto-applied
              </p>

              {/* Secondary CTAs - External Retailers */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-center text-sm text-gray-500 mb-3">Or purchase from retailers:</p>
                <div className="flex justify-center">
                  <button
                    onClick={handleAmazonClick}
                    className="bg-transparent border border-gray-600 hover:border-gray-400 
                             text-gray-300 hover:text-white py-3 px-4 rounded-lg
                             flex items-center justify-center gap-2 transition-all duration-300 w-full max-w-[240px]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Amazon</span>
                  </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  (Full price, no discount)
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-800"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">5,000+</p>
              <p className="text-sm text-gray-400">Copies Sold</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">4.9★</p>
              <p className="text-sm text-gray-400">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">15-Day</p>
              <p className="text-sm text-gray-400">Money Back</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>© {getCopyrightYear()} Throne Light Publishing</p>
          <p>All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
