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
  Volume2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { bookData, Chapter } from '@/data/books/crowded-bed-empty-throne';
import LanguageSelector from '@/components/reader/LanguageSelector';
import { translateParagraphs } from '@/lib/translate';
import ReaderAudioPlayer from '@/components/reader/ReaderAudioPlayer';
import { ParagraphData } from '@/hooks/useAudioSync';

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
  
  // Audio player state
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioParagraphs, setAudioParagraphs] = useState<ParagraphData[]>([]);

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
      
      if (section.type === 'front' && section.id === 'dedication') {
        contentToTranslate = bookData.dedication || [];
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
      
      if (contentToTranslate.length > 0) {
        const translated = await translateParagraphs(contentToTranslate, langCode);
        setTranslatedContent(prev => ({
          ...prev,
          [contentKey]: translated,
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
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
    
    if (section.type === 'front' && section.id === 'dedication') {
      content = translatedParagraphs || bookData.dedication || [];
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

    // Build paragraph data for audio sync
    const paragraphs: ParagraphData[] = content.map((text, index) => ({
      index,
      text,
      elementId: `para-${section.id}-${index}`,
    }));

    setAudioParagraphs(paragraphs);
  }, [currentChapterIndex, selectedLanguage, translatedContent]);

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

  const frontMatter: Section[] = [
    { id: 'dedication', title: 'Dedication', type: 'front' },
    { id: 'manifesto', title: 'The Manifesto', type: 'front' },
    { id: 'foreword', title: 'Foreword', type: 'front' },
  ];
  
  const backMatter: Section[] = [
    { id: 'appendices', title: 'Appendices & Resources', type: 'back' },
    { id: 'epilogue', title: 'Closing Word', type: 'back' },
  ];

  const allSections: Section[] = [
    ...frontMatter,
    ...bookData.chapters.map(ch => ({ ...ch, type: 'chapter' as const })),
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
      isDarkMode ? 'bg-charcoal text-parchment' : 'bg-ivory text-charcoal'
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
        <div className="relative max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Menu & Home - ml-auto pushes closer to center title */}
          <div className="flex items-center gap-1 z-10 ml-16">
            <button
              onClick={() => setShowToc(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-parchment/70' 
                  : 'hover:bg-manuscript text-charcoal/70'
              }`}
              title="Table of Contents"
            >
              <List className="w-5 h-5" />
            </button>
            <Link 
              href="/reader/home"
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-charcoal/50 text-parchment/70' 
                  : 'hover:bg-manuscript text-charcoal/70'
              }`}
              title="My Library"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>

          {/* Center: Title - Absolutely positioned for true centering */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <p className={`text-sm font-serif whitespace-nowrap ${
              isDarkMode ? 'text-parchment/80' : 'text-charcoal/80'
            }`}>
              {bookData.title}
            </p>
            <p className={`text-xs tracking-wider ${
              isDarkMode ? 'text-gold/60' : 'text-gold-700/60'
            }`}>
              by <span className="uppercase">{bookData.author}</span>
            </p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 z-10">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              isTranslating={isTranslating}
              isDarkMode={isDarkMode}
            />
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
                color: ${isDarkMode ? '#D4AF37' : '#B8860B'};
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
            
            {/* Content - use translated if available */}
            {!isTranslating && (() => {
              const contentKey = `${currentSection.id}_${selectedLanguage}`;
              const translatedParagraphs = translatedContent[contentKey];
              
              if (currentSection.type === 'front' && currentSection.id === 'dedication') {
                const content = translatedParagraphs || bookData.dedication || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-center italic">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'manifesto') {
                const content = translatedParagraphs || bookData.manifesto || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-justify">{p}</p>
                ));
              }
              if (currentSection.type === 'front' && currentSection.id === 'foreword') {
                const content = translatedParagraphs || bookData.foreword || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className="text-justify">{p}</p>
                ));
              }
              if (currentSection.type === 'chapter') {
                const content = translatedParagraphs || currentSection.content || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') ? 'text-gold font-semibold text-center mt-10 mb-4' : 'text-justify'}>{p}</p>
                ));
              }
              if (currentSection.type === 'back' && currentSection.id === 'appendices') {
                const content = translatedParagraphs || bookData.appendices || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') ? 'text-gold font-semibold mt-8 mb-2' : 'text-justify'}>{p}</p>
                ));
              }
              if (currentSection.type === 'back' && currentSection.id === 'epilogue') {
                const content = translatedParagraphs || bookData.epilogue || [];
                return content.map((p: string, i: number) => (
                  <p key={i} id={`para-${currentSection.id}-${i}`} className={p.startsWith('✦') ? 'text-gold font-semibold text-center mt-10 mb-4' : 'text-justify'}>{p}</p>
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

        {/* Fixed Crown Logo - Above Footer - Clickable for Audio */}
        <div className={`flex-shrink-0 text-center py-4 ${isDarkMode ? 'bg-onyx' : 'bg-ivory'} ${showAudioPlayer ? 'pb-24' : 'pb-16'}`}>
          <button
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className="group relative mx-auto block cursor-pointer transition-all hover:scale-110"
            title="Click to activate Throne Light audiobook"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/THRONELIGHT-CROWN.png" 
              alt="Activate Audiobook" 
              width={40} 
              height={40} 
              className={`w-10 h-10 transition-opacity ${
                showAudioPlayer 
                  ? 'opacity-100' 
                  : isDarkMode ? 'opacity-50 group-hover:opacity-80' : 'opacity-60 group-hover:opacity-90'
              }`}
            />
            {/* Tooltip */}
            <span className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
              isDarkMode ? 'bg-charcoal text-gold border border-gold/30' : 'bg-white text-gold-700 border border-gold/40 shadow-lg'
            }`}>
              {showAudioPlayer ? 'Audiobook Active' : 'Activate Throne Light Audiobook'}
            </span>
          </button>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 border-t transition-colors ${
        isDarkMode 
          ? 'bg-onyx/95 backdrop-blur-sm border-gold/20' 
          : 'bg-white/95 backdrop-blur-sm border-gold/30'
      } ${showAudioPlayer ? 'pb-20' : ''}`}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevChapter}
            disabled={isFirstChapter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'text-parchment hover:bg-charcoal/50'
                : 'text-charcoal hover:bg-manuscript'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Previous</span>
          </button>

          <p className={`text-xs ${isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'}`}>
            {currentChapterIndex + 1} / {allSections.length}
          </p>

          <button
            onClick={nextChapter}
            disabled={isLastChapter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
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

      {/* Audio Player */}
      {showAudioPlayer && audioParagraphs.length > 0 && (
        <ReaderAudioPlayer
          paragraphs={audioParagraphs}
          bookId="crowded-bed-empty-throne"
          languageCode={selectedLanguage}
          voiceId="shimmer"
          isDarkMode={isDarkMode}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}
    </div>
  );
}
