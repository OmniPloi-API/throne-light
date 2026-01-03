'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Star, CheckCircle, XCircle, Mail, Clock, 
  Shield, AlertTriangle, Trash2, Eye, User
} from 'lucide-react';

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  content: string;
  country: string;
  countryFlag: string;
  device: 'mobile' | 'desktop';
  hasEmoji: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerifiedPurchase: boolean;
  verificationSentAt?: string;
  ipAddress?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingCount: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-gold text-gold' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ 
  review, 
  onApprove, 
  onReject, 
  onSendVerification,
  onDelete 
}: { 
  review: Review;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSendVerification: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  const statusColors = {
    PENDING: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
    APPROVED: 'bg-green-900/30 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-900/30 text-red-400 border-red-500/30',
  };
  
  const isNegative = review.rating <= 2;

  return (
    <div className={`bg-[#111] border rounded-xl p-4 ${isNegative ? 'border-red-500/30' : 'border-[#222]'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <User className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{review.name}</span>
              <span className="text-lg">{review.countryFlag}</span>
              {review.isVerifiedPurchase && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
              {isNegative && (
                <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Negative
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">{review.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className={`text-xs px-2 py-1 rounded border ${statusColors[review.status]}`}>
            {review.status}
          </span>
        </div>
      </div>
      
      <p className="text-gray-300 mb-3">{review.content}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatDate(review.createdAt)}</span>
        <span>{review.device} • IP: {review.ipAddress || 'Unknown'}</span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#222]">
        {review.status === 'PENDING' && (
          <>
            <button
              onClick={() => onApprove(review.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onReject(review.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            {!review.isVerifiedPurchase && !review.verificationSentAt && (
              <button
                onClick={() => onSendVerification(review.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Request Verification
              </button>
            )}
            {review.verificationSentAt && (
              <span className="flex items-center gap-1 px-3 py-1.5 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                Verification sent {formatDate(review.verificationSentAt)}
              </span>
            )}
          </>
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors text-sm ml-auto"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button
          onClick={() => onDelete(review.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-400 rounded hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Details Panel */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#222] text-xs text-gray-500 space-y-1">
          <p><strong>ID:</strong> {review.id}</p>
          <p><strong>Device:</strong> {review.device}</p>
          <p><strong>Has Emoji:</strong> {review.hasEmoji ? 'Yes' : 'No'}</p>
          {review.approvedAt && <p><strong>Approved:</strong> {formatDate(review.approvedAt)}</p>}
          {review.rejectedAt && <p><strong>Rejected:</strong> {formatDate(review.rejectedAt)}</p>}
          {review.adminNotes && <p><strong>Admin Notes:</strong> {review.adminNotes}</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  }

  async function handleReject(id: string) {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  }

  async function handleSendVerification(id: string) {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_verification' }),
      });
      fetchReviews();
      alert('Verification email would be sent (not implemented in demo)');
    } catch (error) {
      console.error('Failed to send verification:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter.toUpperCase();
  });

  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;
  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = reviews.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Link>
            <h1 className="text-xl font-semibold">Review Management</h1>
          </div>
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gold">{stats.averageRating}★ Average</span>
              <span className="text-gray-400">{stats.totalReviews} Total Reviews</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' 
                : 'bg-[#111] text-gray-400 border border-[#222] hover:border-gray-600'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved' 
                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                : 'bg-[#111] text-gray-400 border border-[#222] hover:border-gray-600'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-900/30 text-red-400 border border-red-500/30' 
                : 'bg-[#111] text-gray-400 border border-[#222] hover:border-gray-600'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-gold/20 text-gold border border-gold/30' 
                : 'bg-[#111] text-gray-400 border border-[#222] hover:border-gray-600'
            }`}
          >
            All ({reviews.length})
          </button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {filter !== 'all' ? filter : ''} reviews found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
                onSendVerification={handleSendVerification}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
