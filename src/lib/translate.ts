// Translation service for ThroneLight Reader
// Uses the LibreTranslate API (free and open source)

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
];

// Cache for translated content
const translationCache = new Map<string, string>();

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}:${text.substring(0, 50)}`;
}

/**
 * Translate text using the browser's built-in translation or a free API
 * Falls back to Google Translate widget approach for client-side translation
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  // Return original if target is English or same as source
  if (targetLang === 'en' || targetLang === sourceLang) {
    return text;
  }

  // Check cache first
  const cacheKey = getCacheKey(text, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();
    const translatedText = data.translatedText;

    // Cache the result
    translationCache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if all translation attempts fail
    return text;
  }
}

/**
 * Translate an array of paragraphs
 */
export async function translateParagraphs(
  paragraphs: string[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string[]> {
  if (targetLang === 'en' || targetLang === sourceLang) {
    return paragraphs;
  }

  // Translate in batches to avoid rate limiting
  const batchSize = 5;
  const results: string[] = [];

  for (let i = 0; i < paragraphs.length; i += batchSize) {
    const batch = paragraphs.slice(i, i + batchSize);
    const translatedBatch = await Promise.all(
      batch.map(p => translateText(p, targetLang, sourceLang))
    );
    results.push(...translatedBatch);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < paragraphs.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}
