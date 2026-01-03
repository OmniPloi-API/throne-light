'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, LogOut, User, Download, 
  Smartphone, AlertCircle
} from 'lucide-react';

interface LibraryBook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  coverImage: string;
  grantedAt: string;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner if not in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    async function loadData() {
      try {
        // Check auth
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        // Load library
        const libRes = await fetch('/api/library');
        if (libRes.ok) {
          const libData = await libRes.json();
          setBooks(libData);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
        setError('Failed to load your library');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-gold/10 border-b border-gold/30 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gold" />
              <span className="text-sm">Install the app for the best reading experience</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-gold hover:bg-gold/90 text-black text-sm font-semibold px-4 py-1.5 rounded transition"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#222] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-lg hidden sm:inline">Throne Light</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#222] transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Library</h1>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Your library is empty</h2>
            <p className="text-gray-500 mb-6">Purchase a book to start reading</p>
            <Link
              href="/book"
              className="inline-block bg-gold hover:bg-gold/90 text-black font-semibold px-6 py-3 rounded-lg transition"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/read/${book.id}`}
                className="group"
              >
                <div className="aspect-[3/4] relative bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg group-hover:shadow-gold/20 transition-all duration-300 group-hover:scale-[1.02]">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-gold font-semibold">Read Now</span>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-sm truncate">{book.title}</h3>
                  <p className="text-gray-500 text-xs">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] px-4 py-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 Throne Light Publishing LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
