'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <XCircle className="w-20 h-20 text-gray-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Checkout Cancelled</h1>
        
        <p className="text-gray-300 mb-8">
          Your purchase was not completed. No charges have been made to your account.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/book"
            className="block w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-3 px-6 rounded-lg transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Return to Book
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
