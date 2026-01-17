'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Menu,
  X,
  Bookmark,
  BookmarkCheck,
  Home,
  List,
  Volume2,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const ReaderWalkthrough = dynamic(() => import('@/components/reader/ReaderWalkthrough'), { ssr: false });
import { bookData, Chapter } from '@/data/books/crowded-bed-empty-throne';
import LanguageSelector from '@/components/reader/LanguageSelector';
import { translateParagraphs } from '@/lib/translate';
import ReaderAudioPlayer from '@/components/reader/ReaderAudioPlayer';
import { ParagraphData } from '@/hooks/useAudioSync';

function normalizeParagraphs(paragraphs: string[], maxLen: number = 800): string[] {
  const splitByWords = (text: string) => {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxLen) {
        if (current) chunks.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  const splitOne = (p: string) => {
    const text = (p || '').trim();
    if (!text) return [] as string[];
    if (text.length <= maxLen) return [text];

    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      const next = current ? `${current} ${s}` : s;
      if (next.length > maxLen) {
        if (current) chunks.push(current);
        if (s.length > maxLen) {
          chunks.push(...splitByWords(s));
          current = '';
        } else {
          current = s;
        }
      } else {
        current = next;
      }
    }

    if (current) chunks.push(current);
    return chunks;
  };

  return (paragraphs || []).flatMap(splitOne);
}

export default function ReaderPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Language translation state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string[]>>({});
  const [translationError, setTranslationError] = useState<string | null>(null);
  
  // Audio player state
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioParagraphs, setAudioParagraphs] = useState<ParagraphData[]>([]);
  const [shouldAutoStartAudio, setShouldAutoStartAudio] = useState(false);

  // Walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Reader session tracking
  const sessionIdRef = useRef<string | null>(null);

  // Load saved preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('reader-dark-mode');
    const savedChapter = localStorage.getItem('reader-chapter');
    const savedBookmarks = localStorage.getItem('reader-bookmarks');
    const savedFontSize = localStorage.getItem('reader-font-size');
    const savedLanguage = localStorage.getItem('reader-language');
    
    if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');
    if (savedChapter !== null) setCurrentChapterIndex(parseInt(savedChapter));
    if (savedBookmarks !== null) setBookmarks(JSON.parse(savedBookmarks));
    if (savedFontSize !== null) setFontSize(parseInt(savedFontSize));
    if (savedLanguage !== null) setSelectedLanguage(savedLanguage);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('reader-dark-mode', String(isDarkMode));
    localStorage.setItem('reader-chapter', String(currentChapterIndex));
    localStorage.setItem('reader-bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('reader-font-size', String(fontSize));
    localStorage.setItem('reader-language', selectedLanguage);
  }, [isDarkMode, currentChapterIndex, bookmarks, fontSize, selectedLanguage]);

  // Reader session heartbeat tracking
  useEffect(() => {
    const userId = localStorage.getItem('reader-user-id') || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('reader-user-id', userId);
    const userEmail = localStorage.getItem('user-email') || null;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/reader/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: userEmail,
            bookId: 'crowded-bed-empty-throne',
            currentSection: allSections[currentChapterIndex]?.id,
            currentPage: currentChapterIndex + 1,
            sessionId: sessionIdRef.current
          })
        });
        const data = await res.json();
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId;
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 60 seconds
    const interval = setInterval(sendHeartbeat, 60000);

    // End session on page unload
    const handleUnload = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon(`/api/reader/heartbeat?sessionId=${sessionIdRef.current}`, '');
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      // End session on component unmount
      if (sessionIdRef.current) {
        fetch(`/api/reader/heartbeat?sessionId=${sessionIdRef.current}`, { method: 'DELETE' });
      }
    };
  }, [currentChapterIndex]);

  // Handle language change and translation
  const handleLanguageChange = useCallback(async (langCode: string) => {
    setSelectedLanguage(langCode);
    setTranslationError(null);
    
    // If switching back to English, clear translations
    if (langCode === 'en') {
      setTranslatedContent({});
      return;
    }
    
    // Translate current section content
    setIsTranslating(true);
    try {
      const section = allSections[currentChapterIndex];
      const contentKey = `${section.id}_${langCode}`;
      
      // Check if we already have this translation cached
      if (translatedContent[contentKey]) {
        setIsTranslating(false);
        return;
      }
      
      // Get the content to translate based on section type
      let contentToTranslate: string[] = [];
      
      if (section.type === 'front' && section.id === 'copyright') {
        contentToTranslate = bookData.copyright || [];
      } else if (section.type === 'front' && section.id === 'dedication') {
        contentToTranslate = bookData.dedication || [];
      } else if (section.type === 'front' && section.id === 'acknowledgments') {
        contentToTranslate = bookData.acknowledgments || [];
      } else if (section.type === 'front' && section.id === 'about-author') {
        contentToTranslate = bookData.aboutAuthor || [];
      } else if (section.type === 'front' && section.id === 'manifesto') {
        contentToTranslate = bookData.manifesto || [];
      } else if (section.type === 'front' && section.id === 'foreword') {
        contentToTranslate = bookData.foreword || [];
      } else if (section.type === 'chapter' && section.content) {
        contentToTranslate = section.content;
      } else if (section.type === 'back' && section.id === 'appendices') {
        contentToTranslate = bookData.appendices || [];
      } else if (section.type === 'back' && section.id === 'epilogue') {
        contentToTranslate = bookData.epilogue || [];
      }
      
      const normalizedToTranslate = normalizeParagraphs(contentToTranslate);

      if (normalizedToTranslate.length > 0) {
        const translated = await translateParagraphs(normalizedToTranslate, langCode);

        const unchanged = translated.filter((t, idx) => {
          const src = (normalizedToTranslate[idx] || '').trim();
          const out = (t || '').trim();
          return src.length > 0 && out === src;
        }).length;

        if (unchanged / translated.length > 0.9) {
          setTranslationError('Translation is currently unavailable. Please try again in a moment.');
          return;
        }

        setTranslatedContent(prev => ({
          ...prev,
          [contentKey]: translated,
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
      const message = error instanceof Error ? error.message : 'Translation failed. Please try again.';
      setTranslationError(message);
    } finally {
      setIsTranslating(false);
    }
  }, [currentChapterIndex, translatedContent]);

  // Re-translate when chapter changes (if not English)
  useEffect(() => {
    if (selectedLanguage !== 'en') {
      handleLanguageChange(selectedLanguage);
    }
  }, [currentChapterIndex, selectedLanguage]);

  // Calculate reading progress
  useEffect(() => {
    const totalSections = 3 + bookData.chapters.length + 2; // front + chapters + back
    const progress = ((currentChapterIndex + 1) / totalSections) * 100;
    setReadingProgress(progress);
  }, [currentChapterIndex]);

  // Build audio paragraphs when section or translation changes
  useEffect(() => {
    const section = allSections[currentChapterIndex];
    if (!section) return;

    const contentKey = `${section.id}_${selectedLanguage}`;
    const translatedParagraphs = translatedContent[contentKey];
    
    let content: string[] = [];
    
    if (section.type === 'front' && section.id === 'title-page') {
      content = [bookData.title, ...(bookData.subtitle ? [bookData.subtitle] : [])];
    } else if (section.type === 'front' && section.id === 'copyright') {
      content = translatedParagraphs || bookData.copyright || [];
    } else if (section.type === 'front' && section.id === 'dedication') {
      content = translatedParagraphs || bookData.dedication || [];
    } else if (section.type === 'front' && section.id === 'acknowledgments') {
      content = translatedParagraphs || bookData.acknowledgments || [];
    } else if (section.type === 'front' && section.id === 'about-author') {
      content = translatedParagraphs || bookData.aboutAuthor || [];
    } else if (section.type === 'front' && section.id === 'manifesto') {
      content = translatedParagraphs || bookData.manifesto || [];
    } else if (section.type === 'front' && section.id === 'foreword') {
      content = translatedParagraphs || bookData.foreword || [];
    } else if (section.type === 'chapter' && section.content) {
      content = translatedParagraphs || section.content;
    } else if (section.type === 'back' && section.id === 'appendices') {
      content = translatedParagraphs || bookData.appendices || [];
    } else if (section.type === 'back' && section.id === 'epilogue') {
      content = translatedParagraphs || bookData.epilogue || [];
    }

    content = normalizeParagraphs(content);

    // Build paragraph data for audio sync
    const paragraphs: ParagraphData[] = content.map((text, index) => ({
      index,
      text,
      elementId: `para-${section.id}-${index}`,
    }));

    setAudioParagraphs(paragraphs);
  }, [currentChapterIndex, selectedLanguage, translatedContent]);

  // Check if walkthrough should be shown
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('throne_reader_walkthrough_seen');
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true);
    }
  }, []);

  const handleWalkthroughComplete = () => {
    localStorage.setItem('throne_reader_walkthrough_seen', 'true');
    setShowWalkthrough(false);
  };

  // Create sections array: front matter + chapters + back matter
  type Section = {
    id: string;
    title: string;
    type: 'front' | 'chapter' | 'back';
    subtitle?: string;
    epigraph?: string;
    content?: string[];
    letterToQueen?: string[];
    poeticInterlude?: string[];
    royalReflection?: string[];
  };

  // Content order per master manuscript:
  // 1) Title, 2) Copyright, 3) Dedication, 4) Acknowledgments, 5) About Author,
  // 6) Manifesto, 7) Chapter 1, 8) Foreword, 9) Chapters 2-15...
  const frontMatter: Section[] = [
    { id: 'title-page', title: bookData.title, type: 'front' },
    { id: 'copyright', title: 'Copyright', type: 'front' },
    { id: 'dedication', title: 'Dedication', type: 'front' },
    { id: 'acknowledgments', title: 'Acknowledgments', type: 'front' },
    { id: 'about-author', title: 'About the Author', type: 'front' },
    { id: 'manifesto', title: 'The Manifesto', type: 'front' },
  ];
  
  // Chapter 1 comes before Foreword per master manuscript
  const chapter1 = bookData.chapters[0];
  const remainingChapters = bookData.chapters.slice(1);
  
  const backMatter: Section[] = [
    { id: 'appendices', title: 'Appendices & Resources', type: 'back' },
    { id: 'epilogue', title: 'Closing Word', type: 'back' },
  ];

  const allSections: Section[] = [
    ...frontMatter,
    { ...chapter1, type: 'chapter' as const },
    { id: 'foreword', title: 'Foreword', type: 'front' as const },
    ...remainingChapters.map(ch => ({ ...ch, type: 'chapter' as const })),
    ...backMatter,
  ];

  const currentSection = allSections[currentChapterIndex];
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === allSections.length - 1;

  const toggleBookmark = (chapterId: string) => {
    setBookmarks(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const isBookmarked = (chapterId: string) => bookmarks.includes(chapterId);

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setShowToc(false);
    window.scrollTo(0, 0);
  };

  const nextChapter = () => {
    if (!isLastChapter) {
      setCurrentChapterIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevChapter = () => {
    if (!isFirstChapter) {
      setCurrentChapterIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-onyx text-parchment' : 'bg-ivory text-charcoal'
    }`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gold/20 z-50">
        <motion.div 
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b transition-colors ${
        isDarkMode 
          ? 'bg-onyx/95 backdrop-blur-sm border-gold/20' 
          : 'bg-white/95 backdrop-blur-sm border-gold/30'
      }`}>
        <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 grid grid-cols-3 items-center">
          {/* Left: Help, Menu & Home */}
          <div className="flex items-center gap-1 sm:gap-2 justify-start">
            <button
              onClick={() => setShowHelpModal(true)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1 ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-parchment/70' 
                  : 'hover:bg-manuscript text-charcoal/70'
              }`}
              title="Help & FAQ"
            >
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">FAQs</span>
            </button>
            <button
              id="toc-toggle"
              onClick={() => setShowToc(true)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1 ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-parchment/70' 
                  : 'hover:bg-manuscript text-charcoal/70'
              }`}
              title="Table of Contents"
            >
              <List className="w-4 h-4 sm:w-5 h-5" />
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Menu</span>
            </button>
            <Link 
              href="/reader/home"
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1 ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-parchment/70' 
                  : 'hover:bg-manuscript text-charcoal/70'
              }`}
              title="My Library"
            >
              <Home className="w-4 h-4 sm:w-5 h-5" />
              <span className="hidden lg:inline text-[10px] sm:text-xs font-medium uppercase tracking-wider whitespace-nowrap">My Library</span>
            </Link>
          </div>

          {/* Center: Title */}
          <div className="hidden sm:block text-center">
            <p className={`text-sm font-serif truncate ${
              isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'
            }`}>
              {bookData.title}
            </p>
            <p className={`text-xs tracking-wider truncate ${
              isDarkMode ? 'text-gold/60' : 'text-gold-700/60'
            }`}>
              by <span className="uppercase">{bookData.author}</span>
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 justify-end">
            <div id="language-dropdown">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                isTranslating={isTranslating}
                isDarkMode={isDarkMode}
              />
            </div>
            <button
              onClick={() => toggleBookmark(currentSection.id)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50' 
                  : 'hover:bg-manuscript'
              }`}
              title={isBookmarked(currentSection.id) ? 'Remove Bookmark' : 'Add Bookmark'}
            >
              {isBookmarked(currentSection.id) ? (
                <BookmarkCheck className="w-5 h-5 text-gold" />
              ) : (
                <Bookmark className={`w-5 h-5 ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`} />
              )}
            </button>
            <button
              id="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-gold' 
                  : 'hover:bg-manuscript text-gold-700'
              }`}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Table of Contents Sidebar */}
      <AnimatePresence>
        {showToc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowToc(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 w-80 z-50 overflow-y-auto ${
                isDarkMode ? 'bg-onyx' : 'bg-ivory'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-serif text-xl ${
                    isDarkMode ? 'text-parchment' : 'text-charcoal'
                  }`}>
                    Contents
                  </h2>
                  <button
                    onClick={() => setShowToc(false)}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'hover:bg-charcoal/50 text-parchment/60' 
                        : 'hover:bg-manuscript text-charcoal/60'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Book Info */}
                <div className={`mb-6 pb-6 border-b ${
                  isDarkMode ? 'border-gold/20' : 'border-gold/30'
                }`}>
                  <p className="text-gold text-xs uppercase tracking-wider mb-1">
                    {bookData.author}
                  </p>
                  <p className={`font-serif text-lg ${
                    isDarkMode ? 'text-parchment' : 'text-charcoal'
                  }`}>
                    {bookData.title}
                  </p>
                </div>

                {/* All Sections */}
                <nav className="space-y-2">
                  {allSections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => goToChapter(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${
                        currentChapterIndex === index
                          ? isDarkMode 
                            ? 'bg-gold/20 text-gold' 
                            : 'bg-gold/20 text-gold-700'
                          : isDarkMode
                            ? 'hover:bg-charcoal/50 text-parchment/70 hover:text-parchment'
                            : 'hover:bg-manuscript text-charcoal/70 hover:text-charcoal'
                      }`}
                    >
                      <span className="text-sm">{section.title}{section.type === 'chapter' && section.subtitle ? `: ${section.subtitle}` : ''}</span>
                      {isBookmarked(section.id) && (
                        <BookmarkCheck className="w-4 h-4 text-gold" />
                      )}
                    </button>
                  ))}
                </nav>

                {/* Font Size */}
                <div className={`mt-8 pt-6 border-t ${
                  isDarkMode ? 'border-gold/20' : 'border-gold/30'
                }`}>
                  <p className={`text-xs uppercase tracking-wider mb-3 ${
                    isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
                  }`}>
                    Text Size
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      className={`px-3 py-1 rounded border ${
                        isDarkMode 
                          ? 'border-gold/30 text-parchment/70 hover:border-gold' 
                          : 'border-gold/40 text-charcoal/70 hover:border-gold-700'
                      }`}
                    >
                      A-
                    </button>
                    <span className={`text-sm ${isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'}`}>
                      {fontSize}px
                    </span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                      className={`px-3 py-1 rounded border ${
                        isDarkMode 
                          ? 'border-gold/30 text-parchment/70 hover:border-gold' 
                          : 'border-gold/40 text-charcoal/70 hover:border-gold-700'
                      }`}
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Navigation Arrows */}
      <div className="fixed top-1/2 -translate-y-1/2 left-4 md:left-8 lg:left-[calc(50%-26rem)] z-30">
        <button
          onClick={prevChapter}
          disabled={isFirstChapter}
          className={`p-3 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gold hover:bg-gold/10'
              : 'text-gold-700 hover:bg-gold/10'
          }`}
          title="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-8 lg:right-[calc(50%-26rem)] z-30">
        <button
          onClick={nextChapter}
          disabled={isLastChapter}
          className={`p-3 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'text-gold hover:bg-gold/10'
              : 'text-gold-700 hover:bg-gold/10'
          }`}
          title="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content - Fixed header and crown, scrollable content */}
      <main className="flex flex-col h-[calc(100vh-60px)]">
        {/* Fixed Section Header */}
        <motion.header
          key={`header-${currentSection.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-shrink-0 text-center py-8 px-6 ${isDarkMode ? 'bg-onyx' : 'bg-ivory'}`}
        >
            {currentSection.type === 'chapter' && (
              <p className={`text-xs uppercase tracking-[0.3em] mb-4 ${
                isDarkMode ? 'text-gold/60' : 'text-gold-700/60'
              }`}>
                {currentSection.title}
              </p>
            )}
            <h1 className={`font-serif text-3xl md:text-4xl mb-6 ${
              isDarkMode ? 'text-parchment' : 'text-charcoal'
            }`}>
              {currentSection.type === 'chapter' ? currentSection.subtitle : currentSection.title}
            </h1>
            {currentSection.type === 'chapter' && currentSection.epigraph && (
              <p className={`italic text-lg max-w-md mx-auto ${
                isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'
              }`}>
                {currentSection.epigraph}
              </p>
            )}
            <div className={`w-16 h-px mx-auto mt-6 ${
              isDarkMode ? 'bg-gold/30' : 'bg-gold/40'
            }`} />
        </motion.header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6">
          <motion.article
            key={currentSection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto py-8"
          >
            {/* Section Content */}
            <div 
            className={`font-serif leading-relaxed space-y-6 reader-content ${
              isDarkMode ? 'text-parchment/90' : 'text-charcoal/90'
            }`}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            <style jsx>{`
              .reader-content p {
                transition: color 0.15s ease;
              }
              .reader-content p:hover {
                color: #c9a961;
              }
            `}</style>
            
            {/* Translation loading indicator */}
            {isTranslating && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gold">
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Translating content...</span>
                </div>
              </div>
            )}

            {translationError && !isTranslating && (
              <div className="flex items-center justify-center py-6">
                <div
                  className={`max-w-xl w-full px-4 py-3 rounded-lg border text-sm text-center ${
                    isDarkMode
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-700'
                  }`}
                >
                  {translationError}
                </div>
              </div>
            )}

            {/* Debug: show translation error details in console */}
            {translationError && typeof window !== 'undefined' && (
              <script dangerouslySetInnerHTML={{
                __html: `console.error('Translation error details:', ${JSON.stringify(translationError)});`
              }} />
            )}
            
            {/* Content - use translated if available */}
            {!isTranslating && (() => {
              const contentKey = `${currentSection.id}_${selectedLanguage}`;
              const translatedParagraphs = translatedContent[contentKey];
              
              if (currentSection.type === 'front' && currentSection.id === 'title-page') {
                return (
                  <div className="text-center py-12">
                    <p className={`text-xs uppercase tracking-[0.3em] mb-8 ${isDarkMode ? 'text-gold/60' : 'text-gold-700/60'}`}>
                      {bookData.author}
                    </p>
                    <h1 className={`font-serif text-4xl md:text-5xl mb-6 ${isDarkMode ? 'text-parchment' : 'text-charcoal'}`}>
                      {bookData.title}
                    </h1>
                    {bookData.subtitle && (
                      <p className={`italic text-lg max-w-md mx-auto ${isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'}`}>
                        {bookData.subtitle}
                      </p>
                    )}
                  </div>
                );
              }
              if (currentSection.type === 'front' && currentSection.id === 'copyright') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.copyright || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center text-sm leading-relaxed">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'dedication') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.dedication || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center italic">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'acknowledgments') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.acknowledgments || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'about-author') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.aboutAuthor || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'manifesto') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.manifesto || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'foreword') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.foreword || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center">{p}</p>
                ));
              }
              if (currentSection.type === 'chapter') {
                const content = normalizeParagraphs(translatedParagraphs || currentSection.content || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') || p.startsWith('🔥') ? 'text-gold font-semibold text-center mt-10 mb-4' : 'text-center'}>{p}</p>
                ));
              }
              if (currentSection.type === 'back' && currentSection.id === 'appendices') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.appendices || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') || p.startsWith('🔥') ? 'text-gold font-semibold text-center mt-8 mb-2' : 'text-center'}>{p}</p>
                ));
              }
              if (currentSection.type === 'back' && currentSection.id === 'epilogue') {
                const content = normalizeParagraphs(translatedParagraphs || bookData.epilogue || []);
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') || p.startsWith('🔥') ? 'text-gold font-semibold text-center mt-10 mb-4' : 'text-center'}>{p}</p>
                ));
              }
              return null;
            })()}
          </div>

          {/* Letter to Queen (chapters only) */}
          {currentSection.type === 'chapter' && currentSection.letterToQueen && (
            <div className={`mt-12 p-6 rounded-xl ${
              isDarkMode ? 'bg-gold/10 border border-gold/20' : 'bg-gold/5 border border-gold/30'
            }`}>
              <h3 className={`font-serif text-lg mb-4 text-gold`}>Letter to the Queen</h3>
              {currentSection.letterToQueen.map((p: string, i: number) => (
                <p key={i} className={`italic ${isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'}`}>{p}</p>
              ))}
            </div>
          )}

          {/* Poetic Interlude (chapters only) */}
          {currentSection.type === 'chapter' && currentSection.poeticInterlude && (
            <div className="mt-10 text-center">
              <h3 className={`font-serif text-lg mb-4 text-gold`}>Poetic Interlude</h3>
              {currentSection.poeticInterlude.map((p: string, i: number) => (
                <p key={i} className={`italic ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`}>{p}</p>
              ))}
            </div>
          )}

          {/* Royal Reflection (chapters only) */}
          {currentSection.type === 'chapter' && currentSection.royalReflection && (
            <div className={`mt-10 p-6 rounded-xl ${
              isDarkMode ? 'bg-charcoal/50 border border-gold/10' : 'bg-manuscript border border-gold/20'
            }`}>
              <h3 className={`font-serif text-lg mb-4 text-gold`}>Royal Reflection</h3>
              {currentSection.royalReflection.map((p: string, i: number) => (
                <p key={i} className={`mb-2 ${isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'}`}>{p}</p>
              ))}
            </div>
          )}

          </motion.article>
        </div>

        {/* Spacer for fixed footer */}
        <div className={`flex-shrink-0 ${showAudioPlayer ? 'pb-32' : 'pb-20'}`} />
      </main>

      {/* Navigation Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t transition-colors ${
        isDarkMode 
          ? 'bg-onyx/95 backdrop-blur-sm border-gold/20' 
          : 'bg-white/95 backdrop-blur-sm border-gold/30'
      } ${showAudioPlayer ? 'pb-20' : ''}`}>
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Previous Button - fixed width for balance */}
          <button
            onClick={prevChapter}
            disabled={isFirstChapter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed w-28 ${
              isDarkMode
                ? 'text-parchment hover:bg-charcoal/50'
                : 'text-charcoal hover:bg-manuscript'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Previous</span>
          </button>

          {/* Center: Crown + Page Number - absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <button
              id="audio-toggle"
              onClick={() => {
                setShowAudioPlayer((prev) => {
                  const next = !prev;
                  if (next) setShouldAutoStartAudio(true);
                  return next;
                });
              }}
              className="group relative cursor-pointer transition-all hover:scale-110 mb-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/THRONELIGHT-CROWN.png" 
                alt="Activate Audio Reader" 
                width={32} 
                height={32} 
                className={`w-8 h-8 transition-opacity ${
                  showAudioPlayer 
                    ? 'opacity-100' 
                    : isDarkMode ? 'opacity-50 group-hover:opacity-80' : 'opacity-60 group-hover:opacity-90'
                }`}
              />
              {/* Tooltip */}
              <span className={`absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                isDarkMode ? 'bg-charcoal text-gold border border-gold/30' : 'bg-white text-gold-700 border border-gold/40 shadow-lg'
              }`}>
                {showAudioPlayer ? 'Audio Reader Active' : 'Activate Throne Light Audio Reader'}
              </span>
            </button>
            <p className={`text-xs ${isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'}`}>
              {currentChapterIndex + 1} / {allSections.length}
            </p>
          </div>

          {/* Next Button - fixed width for balance */}
          <button
            onClick={nextChapter}
            disabled={isLastChapter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed w-28 justify-end ${
              isDarkMode
                ? 'text-parchment hover:bg-charcoal/50'
                : 'text-charcoal hover:bg-manuscript'
            }`}
          >
            <span className="text-sm hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Walkthrough */}
      <AnimatePresence>
        {showWalkthrough && (
          <ReaderWalkthrough 
            isDarkMode={isDarkMode} 
            onComplete={handleWalkthroughComplete} 
          />
        )}
      </AnimatePresence>

      {/* Audio Player */}
      {showAudioPlayer && audioParagraphs.length > 0 && (
        <ReaderAudioPlayer
          paragraphs={audioParagraphs}
          bookId="crowded-bed-empty-throne"
          languageCode={selectedLanguage}
          voiceId="shimmer"
          isDarkMode={isDarkMode}
          autoStart={shouldAutoStartAudio}
          onReady={() => {
            if (shouldAutoStartAudio) {
              setShouldAutoStartAudio(false);
            }
          }}
          onClose={() => setShowAudioPlayer(false)}
          onPageComplete={() => {
            // Continuous play: auto-advance to next page and start audio
            if (currentChapterIndex < allSections.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
              setShouldAutoStartAudio(true);
            }
          }}
        />
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setShowHelpModal(false);
              setShowSupportForm(false);
              setSupportSuccess(false);
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border ${
                isDarkMode 
                  ? 'bg-onyx border-gold/20' 
                  : 'bg-white border-gold/30'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`sticky top-0 p-6 border-b ${
                isDarkMode ? 'bg-onyx border-gold/20' : 'bg-white border-gold/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-6 h-6 ${isDarkMode ? 'text-gold' : 'text-gold-700'}`} />
                    <h2 className={`font-serif text-xl ${isDarkMode ? 'text-gold' : 'text-gold-700'}`}>
                      Help & FAQ
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowHelpModal(false);
                      setShowSupportForm(false);
                      setSupportSuccess(false);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-charcoal/50 text-parchment/70' 
                        : 'hover:bg-manuscript text-charcoal/70'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!showSupportForm && !supportSuccess ? (
                  <>
                    {/* FAQ Section */}
                    <div className="space-y-3">
                      {[
                        {
                          q: "How do I navigate between pages?",
                          a: "Use the Previous and Next buttons at the bottom of the screen, or swipe left/right on mobile devices. You can also use the Table of Contents (☰ icon) to jump to any chapter."
                        },
                        {
                          q: "How do I activate the audiobook feature?",
                          a: "Click the golden crown icon at the bottom center of the screen. This will open the audio playback controls. Click the play button to start listening."
                        },
                        {
                          q: "Can I change the language?",
                          a: "Yes! Click the language selector (globe icon with flag) in the top right corner to translate the book into your preferred language."
                        },
                        {
                          q: "How do I bookmark a page?",
                          a: "Click the bookmark icon in the top right corner to save your current page. Bookmarked pages can be accessed from the Table of Contents menu."
                        },
                        {
                          q: "How do I switch between light and dark mode?",
                          a: "Click the sun/moon icon in the top right corner to toggle between light and dark reading modes."
                        },
                        {
                          q: "Where is my reading progress saved?",
                          a: "Your reading progress, bookmarks, and preferences are automatically saved to your device. You'll return to where you left off when you come back."
                        },
                        {
                          q: "Why isn't the audio working?",
                          a: "Ensure your device volume is turned up and not muted. The audio feature requires an internet connection to stream. Try refreshing the page if issues persist."
                        }
                      ].map((faq, index) => (
                        <div
                          key={index}
                          className={`rounded-xl border overflow-hidden ${
                            isDarkMode ? 'border-gold/10 bg-charcoal/30' : 'border-gold/20 bg-manuscript/50'
                          }`}
                        >
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                              isDarkMode ? 'text-parchment' : 'text-charcoal'
                            }`}
                          >
                            <span className="text-sm font-medium pr-4">{faq.q}</span>
                            {expandedFaq === index ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0 text-gold" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0 text-gold" />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedFaq === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <p className={`px-4 pb-4 text-sm ${
                                  isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'
                                }`}>
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    {/* Support Request Button */}
                    <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gold/10' : 'border-gold/20'}`}>
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'}`}>
                        Still need help? Our support team is here for you.
                      </p>
                      <button
                        onClick={() => setShowSupportForm(true)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                          isDarkMode 
                            ? 'bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30' 
                            : 'bg-gold/20 hover:bg-gold/30 text-gold-700 border border-gold/40'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span className="font-medium">Contact Support</span>
                      </button>
                    </div>
                  </>
                ) : supportSuccess ? (
                  /* Success Message */
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'
                    }`}>
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className={`font-serif text-lg mb-2 ${isDarkMode ? 'text-gold' : 'text-gold-700'}`}>
                      Request Submitted!
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-parchment/60' : 'text-charcoal/60'}`}>
                      We&apos;ve received your support request and will get back to you within 24-48 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSupportSuccess(false);
                        setShowSupportForm(false);
                      }}
                      className={`mt-6 px-6 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gold/20 hover:bg-gold/30 text-gold' 
                          : 'bg-gold/20 hover:bg-gold/30 text-gold-700'
                      }`}
                    >
                      Back to FAQ
                    </button>
                  </div>
                ) : (
                  /* Support Form */
                  <div>
                    <button
                      onClick={() => setShowSupportForm(false)}
                      className={`flex items-center gap-2 mb-4 text-sm ${
                        isDarkMode ? 'text-gold hover:text-gold/80' : 'text-gold-700 hover:text-gold-700/80'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to FAQ
                    </button>

                    <h3 className={`font-serif text-lg mb-4 ${isDarkMode ? 'text-parchment' : 'text-charcoal'}`}>
                      Contact Support
                    </h3>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmittingSupport(true);
                        
                        try {
                          // Collect device info
                          const deviceInfo = {
                            userAgent: navigator.userAgent,
                            platform: navigator.platform,
                            language: navigator.language,
                            screenWidth: window.screen.width,
                            screenHeight: window.screen.height,
                            viewportWidth: window.innerWidth,
                            viewportHeight: window.innerHeight,
                            isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
                            currentPage: currentChapterIndex + 1,
                            totalPages: allSections.length,
                            currentSection: currentSection?.title || currentSection?.id,
                            isDarkMode,
                            selectedLanguage,
                            audioEnabled: showAudioPlayer,
                          };

                          await fetch('/api/reader/support', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: supportEmail,
                              message: supportMessage,
                              deviceInfo,
                            }),
                          });

                          setSupportSuccess(true);
                          setSupportEmail('');
                          setSupportMessage('');
                        } catch (error) {
                          console.error('Support request failed:', error);
                        } finally {
                          setIsSubmittingSupport(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className={`block text-sm mb-2 ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                            isDarkMode 
                              ? 'bg-charcoal/50 border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50' 
                              : 'bg-manuscript border-gold/30 text-charcoal placeholder:text-charcoal/30 focus:border-gold/60'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm mb-2 ${isDarkMode ? 'text-parchment/70' : 'text-charcoal/70'}`}>
                          How can we help?
                        </label>
                        <textarea
                          required
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Describe your issue or question..."
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none ${
                            isDarkMode 
                              ? 'bg-charcoal/50 border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50' 
                              : 'bg-manuscript border-gold/30 text-charcoal placeholder:text-charcoal/30 focus:border-gold/60'
                          }`}
                        />
                      </div>

                      <p className={`text-xs ${isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'}`}>
                        Device information will be automatically included to help us assist you better.
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmittingSupport}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-50 ${
                          isDarkMode 
                            ? 'bg-gold text-onyx hover:bg-gold/90' 
                            : 'bg-gold text-white hover:bg-gold/90'
                        }`}
                      >
                        {isSubmittingSupport ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Request</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
