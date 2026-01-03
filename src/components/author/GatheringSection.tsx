'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { MapPin, Calendar, ThumbsUp, Plus } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { getDictionary } from '@/components/shared/dictionaries';

// Type for pending city requests
interface PendingCity {
  city: string;
  state: string;
  upvotes: number;
  cap: number;
  userVoted: boolean;
  createdAt: number;
}

// Generate a random cap between 50-77 that differs by at least 3 from previous caps
const generateUniqueCap = (existingCaps: number[]): number => {
  const min = 50;
  const max = 77;
  let cap: number;
  let attempts = 0;
  
  do {
    cap = Math.floor(Math.random() * (max - min + 1)) + min;
    attempts++;
    // After many attempts, just accept any valid number
    if (attempts > 50) break;
  } while (existingCaps.some(existing => Math.abs(existing - cap) < 3));
  
  return cap;
};

// Capitalize first letter, lowercase the rest
const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function GatheringSection() {
  const { language } = useLanguage();
  const dict = getDictionary(language);
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Official upcoming events
  const upcomingEvents = [
    { city: 'New York City', status: dict.gathering.upcomingStatus, date: null },
    { city: 'Atlanta', status: dict.gathering.upcomingStatus, date: null },
    { city: 'Los Angeles', status: dict.gathering.upcomingStatus, date: null },
    { city: 'London', status: dict.gathering.upcomingStatus, date: null },
    { city: 'Houston', status: dict.gathering.upcomingStatus, date: null },
  ];
  
  // City request state
  const [pendingCities, setPendingCities] = useState<PendingCity[]>([]);
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Load pending cities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pendingCities_v2');
    if (stored) {
      setPendingCities(JSON.parse(stored));
    }
  }, []);

  // Auto-increment upvotes every 90 minutes (simulated with faster interval for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCities(prev => {
        const updated = prev.map(city => {
          if (city.upvotes < city.cap) {
            return { ...city, upvotes: city.upvotes + 1 };
          }
          return city;
        });
        localStorage.setItem('pendingCities_v2', JSON.stringify(updated));
        return updated;
      });
    }, 90 * 60 * 1000); // 90 minutes in production
    // For demo purposes, you could use: 5000 (5 seconds)

    return () => clearInterval(interval);
  }, []);

  const handleNotify = (city: string) => {
    setSelectedCity(city);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      console.log('Notify:', selectedCity, email);
    }
  };

  const handleCityRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newState.trim()) return;

    const existingCaps = pendingCities.map(c => c.cap);
    const newPendingCity: PendingCity = {
      city: capitalizeFirst(newCity.trim()),
      state: capitalizeFirst(newState.trim()),
      upvotes: 1,
      cap: generateUniqueCap(existingCaps),
      userVoted: true,
      createdAt: Date.now(),
    };

    const updated = [...pendingCities, newPendingCity];
    setPendingCities(updated);
    localStorage.setItem('pendingCities_v2', JSON.stringify(updated));
    
    // In production: Send notification to admin about new city request
    console.log('NEW CITY REQUEST:', newPendingCity);
    
    setNewCity('');
    setNewState('');
    setShowRequestForm(false);
    setRequestSubmitted(true);
    setTimeout(() => setRequestSubmitted(false), 3000);
  };

  const handleUpvote = (index: number) => {
    setPendingCities(prev => {
      const updated = prev.map((city, i) => {
        if (i === index && !city.userVoted) {
          // In production: Send notification to admin about real upvote with IP
          console.log('REAL UPVOTE from unique visitor:', city.city, city.state);
          return { ...city, upvotes: city.upvotes + 1, userVoted: true };
        }
        return city;
      });
      localStorage.setItem('pendingCities_v2', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <section className="relative min-h-screen bg-ivory py-24 md:py-32">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23c9a961' fill-opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-gold-600/60 text-xs uppercase tracking-[0.3em] font-sans block mb-4">
            {dict.gathering.label}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4">
            {dict.gathering.headlinePart1}
            <span className="block text-gold-600 mt-2">{dict.gathering.headlinePart2}</span>
          </h2>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            {dict.gathering.description}
          </p>
        </motion.div>

        {/* Events List */}
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.city}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-white/60 border border-charcoal/10 rounded-lg p-6 hover:border-gold/40 transition-all duration-500 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* City Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-charcoal group-hover:text-gold-600 transition-colors">
                        {event.city}
                      </h3>
                      <p className="text-charcoal/50 text-sm flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {event.status}
                      </p>
                    </div>
                  </div>

                  {/* Notify Button */}
                  <button
                    onClick={() => handleNotify(event.city)}
                    className="btn-royal text-xs px-6 py-3"
                  >
                    {dict.gathering.notifyButton}
                  </button>
                </div>

                {/* Hover accent */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-lg"
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
        </div>

        {/* Pending City Requests */}
        {pendingCities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <div className="mb-4">
              <h3 className="font-serif text-xl text-gold-600 mb-2">{dict.gathering.requestedCitiesTitle}</h3>
              <p className="text-charcoal/50 text-sm">
                {dict.gathering.requestedCitiesDesc}
              </p>
            </div>
            <div className="space-y-3">
              {pendingCities.map((pending, index) => (
                <motion.div
                  key={`${pending.city}-${pending.state}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white/50 border border-gold/20 rounded-lg p-5 hover:border-gold/40 transition-all duration-300 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* City Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gold/60" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-charcoal/80">
                          {pending.city}, {pending.state}
                        </h4>
                        <p className="text-gold/50 text-xs uppercase tracking-wider">
                          {dict.gathering.pendingStatus}
                        </p>
                      </div>
                    </div>

                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(index)}
                      disabled={pending.userVoted}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                        pending.userVoted
                          ? 'border-gold/30 bg-gold/10 text-gold cursor-default'
                          : 'border-parchment/20 text-parchment/60 hover:border-gold hover:text-gold hover:bg-gold/5'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${pending.userVoted ? 'fill-gold' : ''}`} />
                      <span className="text-sm font-medium">{pending.upvotes}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Request a Gathering Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <div className="bg-white/70 border border-gold/30 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-charcoal">{dict.gathering.requestTitle}</h3>
                <p className="text-charcoal/50 text-sm">{dict.gathering.requestDesc}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showRequestForm ? (
                <motion.button
                  key="show-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRequestForm(true)}
                  className="w-full btn-royal py-3 mt-4"
                >
                  {dict.gathering.requestButton}
                </motion.button>
              ) : (
                <motion.form
                  key="request-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCityRequest}
                  className="mt-4 space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder={dict.gathering.cityRequestPlaceholder}
                      className="w-full px-4 py-3 bg-ivory-300 border border-charcoal/20 rounded-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold transition-colors"
                      required
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder={dict.gathering.stateRequestPlaceholder}
                      className="w-full px-4 py-3 bg-ivory-300 border border-charcoal/20 rounded-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 px-4 py-3 border border-charcoal/20 rounded-lg text-charcoal/60 hover:border-charcoal/40 transition-colors"
                    >
                      {dict.gathering.cancelButton}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-royal py-3"
                    >
                      {dict.gathering.submitButton}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Success toast */}
            <AnimatePresence>
              {requestSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg text-center"
                >
                  <p className="text-gold text-sm">
                    {dict.gathering.successMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modal for email capture */}
        {selectedCity && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-ivory border border-gold/30 rounded-2xl p-8 max-w-md w-full shadow-xl"
            >
              <h3 className="font-serif text-2xl text-charcoal mb-2">
                {dict.gathering.modalTitle}
              </h3>
              <p className="text-charcoal/60 mb-6">
                {dict.gathering.modalDesc} <span className="text-gold-600">{selectedCity}</span>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.gathering.emailPlaceholder}
                  className="w-full px-4 py-3 bg-ivory-200 border border-charcoal/20 rounded-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold transition-colors"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCity(null)}
                    className="flex-1 px-4 py-3 border border-charcoal/20 rounded-lg text-charcoal/60 hover:border-charcoal/40 transition-colors"
                  >
                    {dict.gathering.cancelButton}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-royal py-3"
                  >
                    {dict.gathering.notifyButton}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Success Message */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-ivory border border-gold/40 rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
            >
              <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12 mb-4" />
              <h3 className="font-serif text-2xl text-gold-600 mb-2">
                {dict.gathering.successMessage.split('!')[0] + '!'}
              </h3>
              <p className="text-charcoal/60 mb-6">
                {dict.gathering.modalDesc} {selectedCity}.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedCity(null);
                  setEmail('');
                }}
                className="btn-royal"
              >
                {dict.gathering.closeButton}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
