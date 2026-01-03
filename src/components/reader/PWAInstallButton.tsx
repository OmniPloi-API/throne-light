'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'floating';
  className?: string;
}

export default function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 2000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  // Already installed - show confirmation
  if (isInstalled) {
    if (variant === 'button') {
      return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm ${className}`}>
          <CheckCircle className="w-4 h-4" />
          <span>Installed</span>
        </div>
      );
    }
    return null;
  }

  // Not installable (not supported or already dismissed)
  if (!isInstallable) {
    return null;
  }

  // Button variant
  if (variant === 'button') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-600 text-onyx font-semibold rounded-lg shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-shadow disabled:opacity-50 ${className}`}
      >
        {isInstalling ? (
          <>
            <div className="w-5 h-5 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
            <span>Installing...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Install App</span>
          </>
        )}
      </motion.button>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-onyx to-charcoal border-t border-gold/20"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h3 className="text-parchment font-semibold">Install Throne Light Reader</h3>
                  <p className="text-parchment/60 text-sm">Get the full app experience on your device</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-2 text-parchment/40 hover:text-parchment transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="px-4 py-2 bg-gold text-onyx font-semibold rounded-lg disabled:opacity-50"
                >
                  {isInstalling ? 'Installing...' : 'Install'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-onyx shadow-lg shadow-gold/30 flex items-center justify-center disabled:opacity-50"
      >
        {isInstalling ? (
          <div className="w-6 h-6 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
        ) : (
          <Download className="w-6 h-6" />
        )}
      </motion.button>
    );
  }

  return null;
}

// Hook for checking PWA install status
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === 'accepted';
    } catch {
      return false;
    }
  };

  return { isInstallable, isInstalled, install };
}
