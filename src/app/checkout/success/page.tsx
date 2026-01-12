'use client';

import { Crown, BookOpen, Mail, Download, Sparkles, Key } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Royal Welcome */}
        <div className="relative mb-8">
          <Crown className="w-20 h-20 text-gold mx-auto mb-4" />
          <Sparkles className="w-6 h-6 text-gold/60 absolute top-0 right-1/4 animate-pulse" />
          <Sparkles className="w-4 h-4 text-gold/40 absolute top-4 left-1/4 animate-pulse delay-150" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome to the Kingdom</h1>
        <p className="text-gold text-lg mb-6">Your purchase is complete</p>
        
        <p className="text-gray-300 mb-8">
          Your copy of <span className="text-gold font-semibold">"The Crowded Bed & The Empty Throne"</span> awaits you.
        </p>
        
        {/* Important: Check Email Notice */}
        <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl p-6 mb-6 border border-gold/40">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-6 h-6 text-gold" />
            <h2 className="text-lg font-semibold text-gold">Check Your Email</h2>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            We've sent your <strong className="text-parchment">unique access code</strong> to your email. 
            You'll need this code to unlock your book in the Throne Light Reader.
          </p>
          <div className="bg-onyx/50 rounded-lg p-3 border border-gold/20">
            <div className="flex items-center justify-center gap-2 text-gold/80 text-sm">
              <Key className="w-4 h-4" />
              <span className="font-mono">XXXX-XXXX-XXXX-XXXX</span>
            </div>
            <p className="text-gray-500 text-xs mt-1">Your code looks like this</p>
          </div>
        </div>
        
        {/* Access Options */}
        <div className="bg-charcoal rounded-xl p-6 mb-6 border border-[#222]">
          <h2 className="text-lg font-semibold text-parchment mb-4 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            Start Reading
          </h2>
          
          <div className="space-y-3">
            {/* Web Reader */}
            <Link 
              href="/login"
              className="block w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                Enter Access Code
              </span>
              <span className="text-sm font-normal opacity-80">Read in your browser</span>
            </Link>
            
            {/* Desktop App Download */}
            <a 
              href="https://github.com/OmniPloi-API/throne-light/releases/download/v1.0.4/Throne-Light-Reader-macOS-v1.0.4.dmg"
              className="block w-full bg-charcoal hover:bg-[#1a1a1a] border border-[#333] hover:border-gold/30 text-parchment font-bold py-4 px-6 rounded-lg transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Desktop Reader
              </span>
              <span className="text-sm font-normal text-parchment/60">macOS App (.dmg)</span>
            </a>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Your access code works on up to 2 devices
          </p>
        </div>
        
        {/* Secondary Actions */}
        <div className="space-y-3">
          <Link
            href="/book"
            className="block w-full border border-gray-700 hover:border-gray-500 text-gray-300 py-3 px-6 rounded-lg transition-all"
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
          Didn't receive your email? Check spam or{' '}
          <Link href="/login" className="text-gold hover:underline">
            request a new code
          </Link>
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
