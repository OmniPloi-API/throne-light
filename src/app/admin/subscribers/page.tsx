'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  Users, 
  Music, 
  BookOpen, 
  MessageSquare, 
  Heart,
  Globe,
  Loader2,
  Trash2,
  FileText,
  Filter
} from 'lucide-react';

type SubscriberSource = 
  | 'AUTHOR_MAILING_LIST'
  | 'MUSIC_UPDATES'
  | 'BOOK_UPDATES'
  | 'DAILY_ENCOURAGEMENT'
  | 'WEEKLY_ENCOURAGEMENT'
  | 'PUBLISHER_INQUIRY'
  | 'GENERAL_NEWSLETTER'
  | 'OTHER';

interface Subscriber {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  source: SubscriberSource;
  sourceDetail?: string;
  country?: string;
  countryFlag?: string;
  isVerified: boolean;
  createdAt: string;
}

const SOURCE_CONFIG: Record<SubscriberSource, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  AUTHOR_MAILING_LIST: { 
    label: 'Mailing List', 
    icon: <Mail className="w-4 h-4" />, 
    color: 'bg-gold/20 text-gold border-gold/30',
    description: '"Receive The Message" signups'
  },
  MUSIC_UPDATES: { 
    label: 'Music Updates', 
    icon: <Music className="w-4 h-4" />, 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Music release notifications'
  },
  BOOK_UPDATES: { 
    label: 'Book Updates', 
    icon: <BookOpen className="w-4 h-4" />, 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'New book notifications'
  },
  DAILY_ENCOURAGEMENT: { 
    label: 'Daily Encouragement', 
    icon: <Heart className="w-4 h-4" />, 
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Daily text/email encouragement'
  },
  WEEKLY_ENCOURAGEMENT: { 
    label: 'Weekly Encouragement', 
    icon: <Heart className="w-4 h-4" />, 
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'Weekly text/email encouragement'
  },
  PUBLISHER_INQUIRY: { 
    label: 'Publisher Inquiry', 
    icon: <Globe className="w-4 h-4" />, 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Publisher page inquiries'
  },
  GENERAL_NEWSLETTER: { 
    label: 'General Newsletter', 
    icon: <MessageSquare className="w-4 h-4" />, 
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'General newsletter signups'
  },
  OTHER: { 
    label: 'Other', 
    icon: <Users className="w-4 h-4" />, 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    description: 'Other sources'
  },
};

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<{ total: number; bySource: Record<string, number> }>({ total: 0, bySource: {} });
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<SubscriberSource | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        router.push('/admin/login');
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  // Fetch subscribers
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchSubscribers() {
      try {
        const url = selectedSource === 'ALL' 
          ? '/api/subscribers' 
          : `/api/subscribers?source=${selectedSource}`;
        const res = await fetch(url);
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setStats(data.stats || { total: 0, bySource: {} });
      } catch (error) {
        console.error('Failed to fetch subscribers:', error);
      }
      setLoading(false);
    }
    fetchSubscribers();
  }, [isAuthenticated, selectedSource]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    try {
      const res = await fetch(`/api/subscribers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
    }
  };

  const handleExport = (format: 'csv' | 'txt') => {
    const url = selectedSource === 'ALL'
      ? `/api/subscribers?format=${format}`
      : `/api/subscribers?source=${selectedSource}&format=${format}`;
    window.open(url, '_blank');
  };

  const filteredSubscribers = subscribers.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.email.toLowerCase().includes(query) ||
      s.phone?.toLowerCase().includes(query) ||
      s.firstName?.toLowerCase().includes(query) ||
      s.lastName?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-onyx text-parchment">
      {/* Header */}
      <header className="border-b border-gold/20 bg-charcoal/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="font-serif text-2xl text-gold">Subscriber Management</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <button
            onClick={() => setSelectedSource('ALL')}
            className={`p-4 rounded-xl border transition-all ${
              selectedSource === 'ALL'
                ? 'bg-gold/20 border-gold/50 text-gold'
                : 'bg-charcoal/50 border-parchment/10 hover:border-gold/30'
            }`}
          >
            <Users className="w-5 h-5 mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-parchment/60">All Contacts</div>
          </button>
          
          {Object.entries(SOURCE_CONFIG).map(([source, config]) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source as SubscriberSource)}
              className={`p-4 rounded-xl border transition-all ${
                selectedSource === source
                  ? `${config.color}`
                  : 'bg-charcoal/50 border-parchment/10 hover:border-gold/30'
              }`}
            >
              {config.icon}
              <div className="text-2xl font-bold mt-2">{stats.bySource[source] || 0}</div>
              <div className="text-xs text-parchment/60 truncate">{config.label}</div>
            </button>
          ))}
        </div>

        {/* Source Description */}
        {selectedSource !== 'ALL' && (
          <div className={`mb-6 p-4 rounded-xl border ${SOURCE_CONFIG[selectedSource].color}`}>
            <div className="flex items-center gap-2">
              {SOURCE_CONFIG[selectedSource].icon}
              <span className="font-medium">{SOURCE_CONFIG[selectedSource].label}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{SOURCE_CONFIG[selectedSource].description}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email, phone, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-charcoal/50 border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-charcoal/50 border border-parchment/20 text-parchment/70 hover:border-gold/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Export TXT</span>
            </button>
          </div>
        </div>

        {/* Subscribers Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-20 text-parchment/50">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No subscribers found</p>
          </div>
        ) : (
          <div className="bg-charcoal/30 rounded-xl border border-parchment/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-parchment/10 bg-charcoal/50">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-parchment/50">Contact</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-parchment/50">Source</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-parchment/50">Country</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-parchment/50">Signed Up</th>
                    <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-parchment/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-parchment/5 hover:bg-charcoal/20">
                      <td className="px-4 py-4">
                        <div>
                          {(subscriber.firstName || subscriber.lastName) && (
                            <div className="font-medium text-parchment">
                              {subscriber.firstName} {subscriber.lastName}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-parchment/70">
                            <Mail className="w-3 h-3" />
                            {subscriber.email}
                          </div>
                          {subscriber.phone && (
                            <div className="flex items-center gap-2 text-sm text-parchment/50">
                              <Phone className="w-3 h-3" />
                              {subscriber.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${SOURCE_CONFIG[subscriber.source].color}`}>
                          {SOURCE_CONFIG[subscriber.source].icon}
                          {SOURCE_CONFIG[subscriber.source].label}
                        </span>
                        {subscriber.sourceDetail && (
                          <div className="text-xs text-parchment/40 mt-1">{subscriber.sourceDetail}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm">
                          {subscriber.countryFlag} {subscriber.country || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-parchment/60">{formatDate(subscriber.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                          title="Delete subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
