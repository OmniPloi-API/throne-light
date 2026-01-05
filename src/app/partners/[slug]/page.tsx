'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, ExternalLink, Star, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCopyrightYear } from '@/lib/copyright';

// Language translations for the partner page
type Language = 'en' | 'yo' | 'fr' | 'es' | 'pt' | 'ha';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

const translations: Record<Language, {
  specialOffer: string;
  recommends: string;
  bookTitle: string;
  aboutTheBook: string;
  bookDescription: string;
  buyDirect: string;
  codAutoApplied: string;
  orPurchaseFrom: string;
  physical: string;
  digital: string;
  fullPriceNoDiscount: string;
  copiesSold: string;
  averageRating: string;
  moneyBack: string;
  reviews: string;
  off: string;
  learnMore: string;
}> = {
  en: {
    specialOffer: 'Special Offer',
    recommends: 'recommends',
    bookTitle: 'The Crowded Bed & The Empty Throne',
    aboutTheBook: 'About the Book',
    bookDescription: 'A prophetic confrontation of the modern soul. This book peels back the layers of distraction and comfort to reveal what you\'ve been avoiding and what\'s been waiting for you on the other side of surrender.',
    buyDirect: 'Buy Direct & Save',
    codAutoApplied: 'auto-applied',
    orPurchaseFrom: 'Or purchase from retailers:',
    physical: 'Physical',
    digital: 'Digital',
    fullPriceNoDiscount: '(Full price, no discount)',
    copiesSold: 'Copies Sold',
    averageRating: 'Average Rating',
    moneyBack: 'Money Back',
    reviews: 'reviews',
    off: 'OFF',
    learnMore: 'Learn more about the book →',
  },
  yo: {
    specialOffer: 'Ìpèsè Pàtàkì',
    recommends: 'ṣe ìmọ̀ràn',
    bookTitle: 'Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Ṣófo',
    aboutTheBook: 'Nípa Ìwé Náà',
    bookDescription: 'Ìdojúkọ wòlíì ti ọkàn ìgbàlódé. Ìwé yìí ń bọ́ àwọn ìpele ìdààmú àti ìtùnú sílẹ̀ láti fi ohun tí o ti ń yẹra fún àti ohun tí ó ti ń dúró de ọ́ ní ìhà kejì ìtẹríba hàn.',
    buyDirect: 'Ra Tààrà & Fi Pamọ́',
    codAutoApplied: 'ti wọ́n fi sí ara rẹ̀',
    orPurchaseFrom: 'Tàbí ra láti ọ̀dọ̀ àwọn olùtajà:',
    physical: 'Ìwé Gidi',
    digital: 'Ẹ̀rọ Ayélujára',
    fullPriceNoDiscount: '(Owó kíkún, kò sí ìdínwó)',
    copiesSold: 'Àwọn Ẹ̀dà Tí A Ta',
    averageRating: 'Ìwọ̀n Àpapọ̀',
    moneyBack: 'Owó Padà',
    reviews: 'àwọn àyẹ̀wò',
    off: 'DÍNWÓ',
    learnMore: 'Kọ́ síi nípa ìwé náà →',
  },
  ha: {
    specialOffer: 'Tayin Na Musamman',
    recommends: 'ya ba da shawara',
    bookTitle: 'Gadon Cike & Karagar Fanko',
    aboutTheBook: 'Game da Littafin',
    bookDescription: 'Fuskantar annabci na ruhin zamani. Wannan littafin yana cire yadudduka na shagaltar da hankali da jin daɗi don bayyana abin da kuke gujewa da abin da yake jiran ku a ɗayan gefen mika wuya.',
    buyDirect: 'Saya Kai Tsaye & Ajiye',
    codAutoApplied: 'an yi amfani da shi ta atomatik',
    orPurchaseFrom: 'Ko saya daga masu sayarwa:',
    physical: 'Littafi',
    digital: 'Dijital',
    fullPriceNoDiscount: '(Cikakken farashi, babu rangwame)',
    copiesSold: 'Kwafin da aka Sayar',
    averageRating: 'Matsakaicin Kima',
    moneyBack: 'Dawo da Kuɗi',
    reviews: 'sharhi',
    off: 'RANGWAME',
    learnMore: 'Ƙara koyo game da littafin →',
  },
  fr: {
    specialOffer: 'Offre Spéciale',
    recommends: 'recommande',
    bookTitle: 'Le Lit Bondé & Le Trône Vide',
    aboutTheBook: 'À Propos du Livre',
    bookDescription: 'Une confrontation prophétique de l\'âme moderne. Ce livre retire les couches de distraction et de confort pour révéler ce que vous avez évité et ce qui vous attend de l\'autre côté de l\'abandon.',
    buyDirect: 'Acheter Direct & Économiser',
    codAutoApplied: 'appliqué automatiquement',
    orPurchaseFrom: 'Ou acheter chez les détaillants:',
    physical: 'Physique',
    digital: 'Numérique',
    fullPriceNoDiscount: '(Prix plein, sans réduction)',
    copiesSold: 'Exemplaires Vendus',
    averageRating: 'Note Moyenne',
    moneyBack: 'Remboursement',
    reviews: 'avis',
    off: 'DE RÉDUCTION',
    learnMore: 'En savoir plus sur le livre →',
  },
  es: {
    specialOffer: 'Oferta Especial',
    recommends: 'recomienda',
    bookTitle: 'La Cama Llena & El Trono Vacío',
    aboutTheBook: 'Sobre el Libro',
    bookDescription: 'Una confrontación profética del alma moderna. Este libro quita las capas de distracción y comodidad para revelar lo que has estado evitando y lo que te espera al otro lado de la rendición.',
    buyDirect: 'Comprar Directo & Ahorrar',
    codAutoApplied: 'aplicado automáticamente',
    orPurchaseFrom: 'O comprar en minoristas:',
    physical: 'Físico',
    digital: 'Digital',
    fullPriceNoDiscount: '(Precio completo, sin descuento)',
    copiesSold: 'Copias Vendidas',
    averageRating: 'Calificación Promedio',
    moneyBack: 'Devolución',
    reviews: 'reseñas',
    off: 'DE DESCUENTO',
    learnMore: 'Más información sobre el libro →',
  },
  pt: {
    specialOffer: 'Oferta Especial',
    recommends: 'recomenda',
    bookTitle: 'A Cama Lotada & O Trono Vazio',
    aboutTheBook: 'Sobre o Livro',
    bookDescription: 'Um confronto profético da alma moderna. Este livro remove as camadas de distração e conforto para revelar o que você tem evitado e o que está esperando por você do outro lado da rendição.',
    buyDirect: 'Comprar Direto & Economizar',
    codAutoApplied: 'aplicado automaticamente',
    orPurchaseFrom: 'Ou comprar em varejistas:',
    physical: 'Físico',
    digital: 'Digital',
    fullPriceNoDiscount: '(Preço cheio, sem desconto)',
    copiesSold: 'Cópias Vendidas',
    averageRating: 'Avaliação Média',
    moneyBack: 'Reembolso',
    reviews: 'avaliações',
    off: 'DE DESCONTO',
    learnMore: 'Saiba mais sobre o livro →',
  },
};

// Detect language from browser or location
function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language?.toLowerCase() || '';
  
  // Check for Nigerian languages first (Yoruba, Hausa)
  if (browserLang.includes('yo')) return 'yo';
  if (browserLang.includes('ha')) return 'ha';
  
  // Check for other supported languages
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  
  return 'en';
}

interface Partner {
  id: string;
  name: string;
  slug: string;
  couponCode: string;
  discountPercent: number;
  amazonUrl?: string;      // Physical book on Amazon
  kindleUrl?: string;      // Digital book on Kindle
  bookBabyUrl?: string;    // Keep for future use
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

export default function BridgePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: 0 });
  const [language, setLanguage] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[language];

  // Detect language on mount
  useEffect(() => {
    const detected = detectLanguage();
    setLanguage(detected);
  }, []);

  useEffect(() => {
    async function loadPartner() {
      try {
        const res = await fetch(`/api/partners/${slug}`);
        if (!res.ok) {
          setError('Partner not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPartner(data);
        
        // Set attribution cookie
        document.cookie = `partner_id=${data.id}; path=/; max-age=${60 * 60 * 24 * 30}`;
        document.cookie = `partner_slug=${data.slug}; path=/; max-age=${60 * 60 * 24 * 30}`;
        document.cookie = `discount_code=${data.couponCode}; path=/; max-age=${60 * 60 * 24 * 30}`;
        
        // Track page view
        await fetch('/api/events/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerId: data.id, type: 'PAGE_VIEW' }),
        });
      } catch (err) {
        setError('Failed to load partner');
      }
      setLoading(false);
    }
    loadPartner();
    
    // Fetch review stats
    async function loadReviewStats() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviewStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load review stats');
      }
    }
    loadReviewStats();
  }, [slug]);

  async function handleDirectBuy() {
    if (!partner) return;
    
    // Track pending sale
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'PENDING_SALE' }),
    });
    
    // Redirect to checkout with auto-applied coupon
    window.location.href = `/checkout?partner=${partner.id}&code=${partner.couponCode}`;
  }

  async function handleAmazonClick() {
    if (!partner) return;
    
    // Track outbound click BEFORE redirect
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'CLICK_AMAZON' }),
    });
    
    // Redirect to Amazon
    const amazonUrl = partner.amazonUrl || 'https://www.amazon.com/dp/YOUR_BOOK_ASIN';
    window.location.href = amazonUrl;
  }

  async function handleKindleClick() {
    if (!partner) return;
    
    // Track outbound click
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, type: 'CLICK_KINDLE' }),
    });
    
    // Redirect to Kindle
    const kindleUrl = partner.kindleUrl || 'https://www.amazon.com/dp/B0YOUR_KINDLE_ASIN';
    window.location.href = kindleUrl;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="animate-pulse text-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-parchment mb-4">Partner Not Found</h1>
          <p className="text-gray-400">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-parchment">
      {/* Language Selector - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-charcoal/80 backdrop-blur-sm border border-gold/20 rounded-lg hover:border-gold/40 transition-colors"
          >
            <Globe className="w-4 h-4 text-gold" />
            <span className="text-sm">{LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.name}</span>
            <ChevronDown className={`w-4 h-4 text-parchment/60 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-charcoal border border-gold/20 rounded-lg overflow-hidden shadow-xl min-w-[160px]"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gold/10 transition-colors ${
                      language === lang.code ? 'bg-gold/20 text-gold' : 'text-parchment'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-b from-charcoal to-onyx py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/THRONELIGHT-CROWN.png" alt="" width={48} height={48} className="w-12 h-12 mx-auto mb-4" />
            <p className="text-gold text-sm uppercase tracking-widest mb-2">{t.specialOffer}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gold">{partner.name}</span> {t.recommends}
            </h1>
            <p className="text-xl text-gray-300">{t.bookTitle}</p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Book Cover - Links to book page */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <a 
              href="/book" 
              className="block relative aspect-[3/4] bg-charcoal rounded-lg overflow-hidden shadow-2xl border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:shadow-gold/20 hover:scale-[1.02] cursor-pointer group"
            >
              <Image
                src="/images/book-cover.jpg"
                alt="The Crowded Bed & The Empty Throne by Eolles"
                fill
                className="object-cover group-hover:brightness-110 transition-all duration-300"
                priority
                unoptimized
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <span className="text-gold text-sm font-medium">{t.learnMore}</span>
              </div>
            </a>
            {/* Discount Badge */}
            <div className="absolute -top-4 -right-4 bg-gold text-onyx font-bold px-4 py-2 rounded-full shadow-lg z-10">
              {partner.discountPercent}% {t.off}
            </div>
          </motion.div>

          {/* Book Info & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gold mb-3">{t.aboutTheBook}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t.bookDescription}
              </p>
            </div>

            {/* Rating - Clickable */}
            <button
              onClick={() => router.push('/reviews')}
              className="flex items-center gap-2 mb-8 group cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
              <span className="text-gray-400 ml-2 group-hover:text-gold transition-colors underline-offset-2 group-hover:underline">
                {reviewStats.averageRating} ({reviewStats.totalReviews} {t.reviews})
              </span>
            </button>

            {/* CTA Buttons - The Fork in the Road */}
            <div className="space-y-4">
              {/* Primary CTA - Buy Direct */}
              <button
                onClick={handleDirectBuy}
                className="w-full bg-gold hover:bg-gold/90 text-onyx font-bold py-4 px-6 rounded-lg 
                         flex items-center justify-center gap-3 transition-all duration-300
                         shadow-lg hover:shadow-gold/30 hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t.buyDirect} {partner.discountPercent}%</span>
              </button>
              <p className="text-center text-sm text-gray-400">
                Code <span className="font-mono text-gold">{partner.couponCode}</span> {t.codAutoApplied}
              </p>

              {/* Secondary CTAs - External Retailers (only show if URLs provided) */}
              {(partner.amazonUrl || partner.kindleUrl) && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-center text-sm text-gray-500 mb-3">{t.orPurchaseFrom}</p>
                  <div className="flex justify-center gap-4">
                    {partner.amazonUrl && (
                      <button
                        onClick={handleAmazonClick}
                        className="transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                      >
                        <Image
                          src="/images/AMZN-BUY-BUTTON.png"
                          alt="Buy on Amazon"
                          width={180}
                          height={50}
                          className="w-auto h-12"
                        />
                      </button>
                    )}
                    {partner.kindleUrl && (
                      <button
                        onClick={handleKindleClick}
                        className="bg-transparent border border-gray-600 hover:border-gray-400 
                                 text-gray-300 hover:text-white py-3 px-4 rounded-lg
                                 flex items-center justify-center gap-2 transition-all duration-300 w-full max-w-[160px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <div className="text-left">
                          <span className="text-sm block">Kindle</span>
                          <span className="text-xs text-gray-500">{t.digital}</span>
                        </div>
                      </button>
                    )}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {t.fullPriceNoDiscount}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-800"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">5,000+</p>
              <p className="text-sm text-gray-400">{t.copiesSold}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">4.9★</p>
              <p className="text-sm text-gray-400">{t.averageRating}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">7-Day</p>
              <p className="text-sm text-gray-400">{t.moneyBack}</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>© {getCopyrightYear()} Throne Light Publishing LLC</p>
          <p>All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
