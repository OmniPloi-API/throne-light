'use client';

import { CheckCircle, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Purchase Complete!</h1>
        
        <p className="text-gray-300 mb-8">
          Thank you for your purchase. Your copy of "The Crowded Bed & The Empty Throne" 
          is on its way to your inbox.
        </p>
        
        <div className="bg-charcoal rounded-xl p-6 mb-8 border border-gold/20">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-gold" />
            <span className="font-semibold">Check Your Email</span>
          </div>
          <p className="text-sm text-gray-400">
            We've sent your digital download link and receipt to your email address.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/book"
            className="block w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-3 px-6 rounded-lg transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Explore More
            </span>
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-gray-600 hover:border-gray-400 text-gray-300 py-3 px-6 rounded-lg transition-all"
          >
            Return Home
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Questions? Contact us at{' '}
          <a href="mailto:info@thronelightpublishing.com" className="text-gold hover:underline">
            info@thronelightpublishing.com
          </a>
        </p>
      </div>
    </div>
  );
}
