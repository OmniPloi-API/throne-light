'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Sun, Moon, Type, Minus, Plus, 
  Menu, X, BookOpen, AlertCircle
} from 'lucide-react';

// Dynamic import for react-reader (client-side only)
const ReactReader = dynamic(
  () => import('react-reader').then((mod) => mod.ReactReader),
  { ssr: false, loading: () => <ReaderSkeleton /> }
);

interface BookContent {
  bookId: string;
  title: string;
  contentUrl: string;
  watermark: string;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  useEffect(() => {
    if (bookId === 'crowded-bed-empty-throne') {
      router.replace('/reader');
    }
  }, [bookId, router]);

  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string | number>(0);
  
  // Reader settings
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(100);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function fetchBookContent() {
      try {
        if (bookId === 'crowded-bed-empty-throne') {
          return;
        }
        const res = await fetch(`/api/books/${bookId}/content`);
        
        if (res.status === 401) {
          const data = await res.json();
          // Check if it's a "One Device" error
          if (data.error?.includes('another device')) {
            setError('SESSION_EXPIRED');
          } else {
            setError('NOT_AUTHENTICATED');
          }
          return;
        }
        
        if (res.status === 403) {
          setError('NO_ACCESS');
          return;
        }
        
        if (!res.ok) {
          setError('FETCH_ERROR');
          return;
        }
        
        const data = await res.json();
        setBookContent(data);
      } catch (err) {
        console.error('Failed to load book:', err);
        setError('FETCH_ERROR');
      } finally {
        setLoading(false);
      }
    }

    fetchBookContent();
  }, [bookId]);

  // Save reading position to localStorage
  useEffect(() => {
    if (location && bookId) {
      localStorage.setItem(`reading-position-${bookId}`, String(location));
    }
  }, [location, bookId]);

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem(`reading-position-${bookId}`);
    if (saved) {
      setLocation(saved);
    }
  }, [bookId]);

  function handleLocationChange(epubcfi: string) {
    setLocation(epubcfi);
  }

  function adjustFontSize(delta: number) {
    setFontSize(prev => Math.max(50, Math.min(200, prev + delta)));
  }

  // Error states
  if (error === 'SESSION_EXPIRED') {
    return (
      <ErrorScreen
        icon={<AlertCircle className="w-16 h-16 text-orange-400" />}
        title="Session Active Elsewhere"
        message="Your account is logged in on another device. Please log in again to continue reading."
        actionLabel="Log In Again"
        onAction={() => router.push('/login')}
      />
    );
  }

  if (error === 'NOT_AUTHENTICATED') {
    return (
      <ErrorScreen
        icon={<AlertCircle className="w-16 h-16 text-red-400" />}
        title="Authentication Required"
        message="Please log in to access your library."
        actionLabel="Log In"
        onAction={() => router.push('/login')}
      />
    );
  }

  if (error === 'NO_ACCESS') {
    return (
      <ErrorScreen
        icon={<BookOpen className="w-16 h-16 text-gray-400" />}
        title="Book Not In Library"
        message="You don't have access to this book. Purchase it to start reading."
        actionLabel="Browse Books"
        onAction={() => router.push('/book')}
      />
    );
  }

  if (error) {
    return (
      <ErrorScreen
        icon={<AlertCircle className="w-16 h-16 text-red-400" />}
        title="Failed to Load Book"
        message="Something went wrong. Please try again."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (loading) {
    return <ReaderSkeleton />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1a1a1a]' : 'bg-[#f5f5dc]'}`}>
      {/* Top Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between
                   ${darkMode ? 'bg-[#0a0a0a]/95' : 'bg-white/95'} backdrop-blur border-b
                   ${darkMode ? 'border-[#333]' : 'border-gray-200'}`}
      >
        <button
          onClick={() => router.push('/library')}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#333]' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
        </button>

        <h1 className={`text-sm font-medium truncate max-w-[200px] ${darkMode ? 'text-white' : 'text-black'}`}>
          {bookContent?.title}
        </h1>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#333]' : 'hover:bg-gray-100'}`}
        >
          {showSettings ? (
            <X className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
          ) : (
            <Menu className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
          )}
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className={`fixed top-14 right-4 z-50 w-64 rounded-xl shadow-xl border
                     ${darkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}
        >
          <div className="p-4 space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>Theme</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-[#333]' : 'bg-gray-100'}`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gold" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                  <Type className="w-4 h-4 inline mr-1" />
                  Font Size
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {fontSize}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustFontSize(-10)}
                  className={`flex-1 py-2 rounded ${darkMode ? 'bg-[#333] hover:bg-[#444]' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Minus className={`w-4 h-4 mx-auto ${darkMode ? 'text-white' : 'text-black'}`} />
                </button>
                <button
                  onClick={() => adjustFontSize(10)}
                  className={`flex-1 py-2 rounded ${darkMode ? 'bg-[#333] hover:bg-[#444]' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Plus className={`w-4 h-4 mx-auto ${darkMode ? 'text-white' : 'text-black'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader */}
      <div className="pt-14 h-screen">
        {bookContent?.contentUrl && (
          <ReactReader
            url={bookContent.contentUrl}
            location={location}
            locationChanged={handleLocationChange}
            epubOptions={{
              flow: 'scrolled',
              manager: 'continuous',
            }}
            getRendition={(rendition) => {
              rendition.themes.fontSize(`${fontSize}%`);
              if (darkMode) {
                rendition.themes.override('color', '#e5e5e5');
                rendition.themes.override('background', '#1a1a1a');
              }
            }}
          />
        )}
      </div>

      {/* Watermark Footer (Anti-Screenshot) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 py-1 text-center text-[10px] pointer-events-none
                   ${darkMode ? 'text-white/5' : 'text-black/5'}`}
      >
        Licensed to: {bookContent?.watermark}
      </div>
    </div>
  );
}

function ReaderSkeleton() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="w-12 h-12 text-gold mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400">Loading your book...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ 
  icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}: { 
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-4">{icon}</div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={onAction}
          className="bg-gold hover:bg-gold/90 text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

