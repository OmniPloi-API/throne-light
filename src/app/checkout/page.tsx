'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, CreditCard, Shield, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('partner');
  const couponCode = searchParams.get('code');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BOOK_PRICE = 9.99; // Digital book price
  const discountPercent = couponCode ? 20 : 0; // Default 20% for partner codes
  const finalPrice = BOOK_PRICE * (1 - discountPercent / 100);

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
          
          {couponCode && (
            <div className="flex justify-between items-center py-3 border-b border-gray-700 text-green-400">
              <div>
                <span>Discount ({couponCode})</span>
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
          disabled={loading}
          className="w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg 
                   flex items-center justify-center gap-3 transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
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
