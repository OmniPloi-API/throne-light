'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, CreditCard, Shield, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partner');
  const couponCode = searchParams.get('code');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [partnerLoading, setPartnerLoading] = useState(!!partnerId);

  const BOOK_PRICE = 29.99; // Digital book price
  const finalPrice = BOOK_PRICE * (1 - discountPercent / 100);

  // Fetch partner's actual discount percentage
  useEffect(() => {
    async function fetchPartnerDiscount() {
      if (!partnerId) {
        setPartnerLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/partners/${partnerId}`);
        if (res.ok) {
          const partner = await res.json();
          setDiscountPercent(partner.discountPercent || 0);
        }
      } catch (err) {
        console.error('Failed to fetch partner discount:', err);
      }
      setPartnerLoading(false);
    }
    fetchPartnerDiscount();
  }, [partnerId]);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, couponCode }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-onyx text-parchment">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Complete Your Purchase</h1>
        
        {/* Order Summary */}
        <div className="bg-charcoal rounded-xl p-6 mb-8 border border-gold/20">
          <h2 className="text-xl font-semibold mb-4 text-gold">Order Summary</h2>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-gold" />
              <span>The Crowded Bed & The Empty Throne</span>
            </div>
            <span>${BOOK_PRICE.toFixed(2)}</span>
          </div>
          
          {discountPercent > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-gray-700 text-green-400">
              <div>
                <span>Discount ({couponCode || `${discountPercent}% off`})</span>
              </div>
              <span>-${(BOOK_PRICE * discountPercent / 100).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-gold">${finalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Security Note */}
        <div className="flex items-center gap-3 mb-6 text-sm text-gray-400">
          <Shield className="w-5 h-5 text-green-400" />
          <span>Secure checkout powered by Stripe. Your payment info is encrypted.</span>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading || partnerLoading}
          className="w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg 
                   flex items-center justify-center gap-3 transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || partnerLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{partnerLoading ? 'Loading...' : 'Processing...'}</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay ${finalPrice.toFixed(2)}</span>
            </>
          )}
        </button>
        
        {/* Partner Attribution */}
        {partnerId && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Referred by a Throne Light partner
          </p>
        )}
      </div>
    </div>
  );
}
