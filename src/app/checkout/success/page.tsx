'use client';

import { CheckCircle, BookOpen, Mail, Download, Monitor, Globe } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto px-4 text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Purchase Complete!</h1>
        
        <p className="text-gray-300 mb-8">
          Thank you for your purchase. Your copy of <span className="text-gold font-semibold">"The Crowded Bed & The Empty Throne"</span> is ready to read!
        </p>
        
        {/* Instant Access Options */}
        <div className="bg-charcoal rounded-xl p-6 mb-6 border border-gold/20">
          <h2 className="text-lg font-semibold text-gold mb-4 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Start Reading Now
          </h2>
          
          <div className="space-y-3">
            {/* Web Reader - Primary CTA */}
            <Link 
              href="/login"
              className="block w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Globe className="w-5 h-5" />
                Access Web Reader
              </span>
              <span className="text-sm font-normal opacity-80">Read instantly in your browser</span>
            </Link>
            
            {/* Desktop App Download */}
            <a 
              href="/downloads/ThroneLight-Reader-macOS.dmg"
              className="block w-full bg-charcoal hover:bg-charcoal/80 border border-gold/30 hover:border-gold/50 text-parchment font-bold py-4 px-6 rounded-lg transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Desktop Reader
              </span>
              <span className="text-sm font-normal text-parchment/60">macOS App (.dmg)</span>
            </a>
          </div>
        </div>
        
        {/* Email Confirmation */}
        <div className="bg-charcoal/50 rounded-xl p-4 mb-6 border border-parchment/10">
          <div className="flex items-center gap-3 justify-center">
            <Mail className="w-5 h-5 text-gold" />
            <span className="text-sm text-gray-400">
              A receipt and login details have been sent to your email
            </span>
          </div>
        </div>
        
        {/* Secondary Actions */}
        <div className="space-y-3">
          <Link
            href="/book"
            className="block w-full border border-gray-600 hover:border-gray-400 text-gray-300 py-3 px-6 rounded-lg transition-all"
          >
            Learn More About the Book
          </Link>
          
          <Link
            href="/"
            className="block text-gray-500 hover:text-gray-300 py-2 transition-all text-sm"
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center">
        <div className="animate-pulse text-gold">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
