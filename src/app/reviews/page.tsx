'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, Send, CheckCircle, Clock, User } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  country: string;
  countryFlag: string;
  device: 'mobile' | 'desktop';
  hasEmoji: boolean;
  status: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingCount: number;
}

// Country name lookup
const countryNames: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', NG: 'Nigeria', GH: 'Ghana',
  ZA: 'South Africa', KE: 'Kenya', JM: 'Jamaica', TT: 'Trinidad & Tobago',
  CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France',
  BR: 'Brazil', MX: 'Mexico', PH: 'Philippines', IN: 'India',
  AE: 'UAE', NL: 'Netherlands', IE: 'Ireland', NZ: 'New Zealand',
};

// Country flag lookup for form
const countryOptions = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'JM', flag: '🇯🇲', name: 'Jamaica' },
  { code: 'TT', flag: '🇹🇹', name: 'Trinidad & Tobago' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-gold text-gold' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-charcoal/50 border border-gold/10 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <User className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-parchment">{review.name}</span>
              {review.isVerifiedPurchase && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{review.countryFlag}</span>
              <span>{countryNames[review.country] || review.country}</span>
              <span>•</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-parchment/80 leading-relaxed">{review.content}</p>
    </motion.div>
  );
}

function ReviewForm({ onSubmit, pendingReview }: { 
  onSubmit: (review: any) => Promise<void>;
  pendingReview: Review | null;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [country, setCountry] = useState('US');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedCountry = countryOptions.find(c => c.code === country);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !content) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit({
        name,
        email,
        rating,
        content,
        country,
        countryFlag: selectedCountry?.flag || '🌍',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    }
    setIsSubmitting(false);
  }

  if (submitted || pendingReview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gold/10 border border-gold/30 rounded-xl p-6 text-center"
      >
        <Clock className="w-12 h-12 text-gold mx-auto mb-4" />
        <h3 className="text-xl font-serif text-gold mb-2">Review Submitted!</h3>
        <p className="text-parchment/70">
          Your review is pending approval and will appear shortly.
        </p>
        {pendingReview && (
          <div className="mt-4 p-4 bg-charcoal/50 rounded-lg text-left">
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={pendingReview.rating} />
              <span className="text-xs text-gold bg-gold/20 px-2 py-0.5 rounded">Pending</span>
            </div>
            <p className="text-parchment/60 text-sm">{pendingReview.content}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-charcoal/50 border border-gold/20 rounded-xl p-6">
      <h3 className="text-xl font-serif text-gold mb-6">Share Your Experience</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-parchment/60 mb-2">Your Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-3 rounded-lg bg-onyx border border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-parchment/60 mb-2">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-lg bg-onyx border border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 outline-none"
          />
          <p className="text-xs text-parchment/40 mt-1">Used to verify your purchase</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-parchment/60 mb-2">Your Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= rating ? 'fill-gold text-gold' : 'text-gray-600 hover:text-gold/50'}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-parchment/60 mb-2">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-onyx border border-gold/20 text-parchment focus:border-gold/50 outline-none"
          >
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm text-parchment/60 mb-2">Your Review *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about the book..."
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-onyx border border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 outline-none resize-none"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || !name || !email || !content}
        className="w-full py-4 rounded-xl bg-gold text-onyx font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Review</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState<Review | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
    setLoading(false);
  }

  async function handleSubmitReview(reviewData: any) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit review');
    }
    
    // Show the pending review to the user
    setPendingReview(data.review);
  }

  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="min-h-screen bg-onyx text-parchment">
      {/* Header */}
      <header className="border-b border-gold/20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link 
            href="/book"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Book</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stats Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-gold mb-4">Reader Reviews</h1>
          {stats && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-gold">{stats.averageRating}</span>
                <div>
                  <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                  <p className="text-sm text-parchment/60 mt-1">{stats.totalReviews} reviews</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-charcoal/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-medium text-parchment mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-parchment/60">{rating}</span>
                      <Star className="w-4 h-4 fill-gold text-gold" />
                    </div>
                    <div className="flex-1 h-2 bg-onyx rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-parchment/60 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Form */}
        <div className="mb-12">
          <ReviewForm onSubmit={handleSubmitReview} pendingReview={pendingReview} />
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-gold mb-6">All Reviews</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-parchment/50">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <>
              <AnimatePresence>
                {reviews.slice(0, visibleCount).map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {visibleCount < reviews.length && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    Load More Reviews ({reviews.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-parchment/40 text-xs">
            © {new Date().getFullYear()} Throne Light Publishing LLC. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
