'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check, Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, Language } from '@/lib/translate';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isTranslating?: boolean;
  isDarkMode?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  isTranslating = false,
  isDarkMode = true,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDarkMode
            ? 'hover:bg-charcoal/50 text-parchment/70 hover:text-parchment'
            : 'hover:bg-manuscript text-charcoal/70 hover:text-charcoal'
        } ${isTranslating ? 'opacity-50 cursor-wait' : ''}`}
        title="Select Language"
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Languages className="w-4 h-4" />
        )}
        <span className="text-sm hidden sm:inline">{currentLanguage.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden z-50 ${
          isDarkMode
            ? 'bg-onyx border-gold/20'
            : 'bg-white border-gold/30'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'border-gold/10' : 'border-gold/20'
          }`}>
            <p className={`text-xs uppercase tracking-wider ${
              isDarkMode ? 'text-gold/60' : 'text-gold-700/60'
            }`}>
              Translate Book
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                  selectedLanguage === lang.code
                    ? isDarkMode
                      ? 'bg-gold/20 text-gold'
                      : 'bg-gold/20 text-gold-700'
                    : isDarkMode
                      ? 'hover:bg-charcoal/50 text-parchment/80 hover:text-parchment'
                      : 'hover:bg-manuscript text-charcoal/80 hover:text-charcoal'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">{lang.name}</p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-parchment/50' : 'text-charcoal/50'
                    }`}>
                      {lang.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-4 h-4 text-gold" />
                )}
              </button>
            ))}
          </div>

          <div className={`px-4 py-3 border-t ${
            isDarkMode ? 'border-gold/10 bg-charcoal/30' : 'border-gold/20 bg-manuscript/50'
          }`}>
            <p className={`text-xs ${
              isDarkMode ? 'text-parchment/40' : 'text-charcoal/40'
            }`}>
              Translation powered by AI. Original text in English.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
