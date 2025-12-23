'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, defaultLanguage, languages } from './languages';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

// Country code to language mapping
const countryToLanguage: Record<string, Language> = {
  // English-speaking countries
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  // French-speaking countries
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr', GA: 'fr', CG: 'fr', CD: 'fr', CM: 'fr', MG: 'fr', HT: 'fr',
  // Spanish-speaking countries
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es',
  // Chinese-speaking countries/regions
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // Italian-speaking countries
  IT: 'it', SM: 'it', VA: 'it',
  // German-speaking countries
  DE: 'de', AT: 'de', LI: 'de',
  // Korean-speaking countries
  KR: 'ko', KP: 'ko',
  // Yoruba-speaking countries
  NG: 'yo',
};

// Get language from browser settings
const getBrowserLanguage = (): Language | null => {
  if (typeof navigator === 'undefined') return null;
  
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Map browser language codes to our supported languages
  const browserLangMap: Record<string, Language> = {
    en: 'en',
    fr: 'fr',
    es: 'es',
    zh: 'zh',
    it: 'it',
    de: 'de',
    ko: 'ko',
    yo: 'yo',
  };
  
  return browserLangMap[langCode] || null;
};

// Fetch country from IP geolocation API
const fetchCountryFromIP = async (): Promise<string | null> => {
  try {
    // Using ip-api.com (free, no API key required, 45 requests/minute limit)
    const response = await fetch('http://ip-api.com/json/?fields=countryCode', {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.countryCode || null;
  } catch (error) {
    console.warn('Geolocation detection failed:', error);
    return null;
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language with fallback logic:
  // 1. Stored preference (localStorage)
  // 2. Geolocation (IP-based country detection)
  // 3. Browser language
  // 4. Default language (English)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initializeLanguage = async () => {
      // 1. Check stored preference first
      const stored = window.localStorage.getItem('throne-language') as Language;
      if (stored && languages.some(l => l.code === stored)) {
        setLanguageState(stored);
        setIsInitialized(true);
        return;
      }
      
      // 2. Try geolocation
      const countryCode = await fetchCountryFromIP();
      if (countryCode && countryToLanguage[countryCode]) {
        const geoLang = countryToLanguage[countryCode];
        setLanguageState(geoLang);
        setIsInitialized(true);
        return;
      }
      
      // 3. Try browser language
      const browserLang = getBrowserLanguage();
      if (browserLang) {
        setLanguageState(browserLang);
        setIsInitialized(true);
        return;
      }
      
      // 4. Fall back to default
      setLanguageState(defaultLanguage);
      setIsInitialized(true);
    };
    
    initializeLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('throne-language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages: languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
