'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Download, Smartphone, Share, Plus, CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-onyx to-charcoal text-parchment flex flex-col">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <Crown className="w-16 h-16 text-gold mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to the Kingdom</h1>
        <p className="text-gray-400">Your purchase was successful</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8 text-center max-w-md">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-green-300 mb-2">Payment Confirmed</h2>
          <p className="text-gray-400 text-sm">
            Your book has been added to your library. Check your email for confirmation.
          </p>
        </div>

        {/* Install App CTA - The Main Focus */}
        {!isStandalone && !installed && (
          <div className="bg-gold/10 border-2 border-gold rounded-xl p-8 text-center max-w-md mb-8">
            <Smartphone className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gold mb-3">Install the App</h2>
            <p className="text-gray-300 mb-6">
              Add Throne Light to your home screen for the best reading experience. 
              Read offline, anytime.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-4 px-6 rounded-lg 
                       flex items-center justify-center gap-3 transition-all duration-300
                       shadow-lg hover:shadow-gold/30 text-lg"
            >
              <Download className="w-6 h-6" />
              Install App
            </button>
            <p className="text-gray-500 text-xs mt-3">
              No app store required • Instant access
            </p>
          </div>
        )}

        {/* Already Installed */}
        {(isStandalone || installed) && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8 text-center max-w-md">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-green-300">App Installed!</h2>
            <p className="text-gray-400 text-sm mt-2">
              You can now access your library from your home screen.
            </p>
          </div>
        )}

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/library"
            className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-6 rounded-lg 
                     flex items-center justify-center gap-2 transition"
          >
            Go to My Library
          </Link>
          <Link
            href="/"
            className="flex-1 bg-[#222] hover:bg-[#333] text-white font-semibold py-3 px-6 rounded-lg 
                     flex items-center justify-center gap-2 transition"
          >
            Return Home
          </Link>
        </div>
      </main>

      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-t-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Install on iPhone/iPad</h3>
              <p className="text-gray-400 text-sm">Follow these steps to add to your home screen:</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold">Tap the Share button</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Share className="w-4 h-4" /> at the bottom of Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Look for this icon
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold">Tap "Add" in the top right</p>
                  <p className="text-gray-400 text-sm">The app will appear on your home screen</p>
                </div>
              </div>
            </div>

            {/* Visual Arrow Pointing Down */}
            <div className="text-center mb-4">
              <div className="inline-block animate-bounce">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#333] hover:bg-[#444] py-3 rounded-lg font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-sm">
        <p>Questions? Contact support@thronelightpublishing.com</p>
      </footer>
    </div>
  );
}
