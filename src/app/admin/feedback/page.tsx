'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, Loader2, LogOut, Check, X, Copy, 
  Eye, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Image as ImageIcon, ExternalLink, ToggleLeft, ToggleRight
} from 'lucide-react';

interface Feedback {
  id: string;
  feedbackNumber: string;
  partnerName: string;
  partnerEmail?: string;
  pageUrl: string;
  sectionName?: string;
  screenshotBase64?: string;
  rawFeedback: string;
  aiProcessedInstructions?: string;
  status: 'NEW' | 'REVIEWED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  completedAt?: string;
}

interface Stats {
  total: number;
  new: number;
  reviewed: number;
  inProgress: number;
  completed: number;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [widgetEnabled, setWidgetEnabled] = useState(true);
  const [togglingWidget, setTogglingWidget] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router, mounted]);

  const fetchFeedback = async () => {
    try {
      const [feedbackRes, settingsRes] = await Promise.all([
        fetch(`/api/feedback${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
        fetch('/api/feedback/settings'),
      ]);
      
      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedback(data.feedback || []);
        setStats(data.stats || null);
      }
      
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setWidgetEnabled(settings.feedbackWidgetEnabled);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedback();
    }
  }, [isAuthenticated, statusFilter]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const toggleWidgetVisibility = async () => {
    setTogglingWidget(true);
    try {
      const newValue = !widgetEnabled;
      const res = await fetch('/api/feedback/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackWidgetEnabled: newValue }),
      });
      if (res.ok) {
        setWidgetEnabled(newValue);
        // Broadcast change to other tabs via localStorage event
        localStorage.setItem('feedbackWidgetEnabled', JSON.stringify({ enabled: newValue, timestamp: Date.now() }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Toggle failed:', errorData);
        alert('Failed to update widget visibility. Please try again.');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Failed to update widget visibility. Please try again.');
    }
    setTogglingWidget(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchFeedback();
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const copyInstructions = (instructions: string, id: string) => {
    navigator.clipboard.writeText(instructions);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      NEW: { bg: 'bg-blue-900/30', text: 'text-blue-300', label: 'New' },
      REVIEWED: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', label: 'Reviewed' },
      IN_PROGRESS: { bg: 'bg-purple-900/30', text: 'text-purple-300', label: 'In Progress' },
      COMPLETED: { bg: 'bg-green-900/30', text: 'text-green-300', label: 'Completed' },
      DISMISSED: { bg: 'bg-gray-900/30', text: 'text-gray-300', label: 'Dismissed' },
    };
    const c = config[status] || config.NEW;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-6">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold text-gold">Partner Feedback</h1>
          <p className="text-gray-400 text-sm mt-1">Review and process change requests from testing partners</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/admin" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition">
            ← Dashboard
          </Link>
          <Link href="/admin/support" className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition">
            Support Tickets
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Widget Toggle */}
        <section className="mb-8">
          <div className="bg-[#111] rounded-xl border border-[#222] p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-parchment mb-1">Feedback Widget Visibility</h3>
              <p className="text-gray-400 text-sm">
                {widgetEnabled 
                  ? 'The feedback widget is visible to all site visitors.' 
                  : 'The feedback widget is hidden from public view.'}
              </p>
            </div>
            <button
              onClick={toggleWidgetVisibility}
              disabled={togglingWidget}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                widgetEnabled 
                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                  : 'bg-gray-900/30 text-gray-400 hover:bg-gray-900/50'
              }`}
            >
              {togglingWidget ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : widgetEnabled ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {widgetEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </section>

        {/* Stats */}
        {stats && (
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total" value={stats.total} color="gold" />
              <StatCard label="New" value={stats.new} color="blue" />
              <StatCard label="Reviewed" value={stats.reviewed} color="yellow" />
              <StatCard label="In Progress" value={stats.inProgress} color="purple" />
              <StatCard label="Completed" value={stats.completed} color="green" />
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6">
          <div className="flex gap-2">
            {['all', 'NEW', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  statusFilter === status
                    ? 'bg-gold text-black'
                    : 'bg-[#222] hover:bg-[#333] text-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </section>

        {/* Feedback List */}
        <section>
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="bg-[#111] rounded-xl border border-[#222] overflow-hidden"
              >
                {/* Header Row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a]"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-5 h-5 text-gold" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gold text-sm">{item.feedbackNumber}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-parchment text-sm mt-1">
                        From <strong>{item.partnerName}</strong> • {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.screenshotBase64 && (
                      <span title="Has screenshot"><ImageIcon className="w-4 h-4 text-gray-400" /></span>
                    )}
                    {expandedId === item.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === item.id && (
                  <div className="border-t border-[#222] p-4 space-y-4">
                    {/* Page URL */}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Page URL</label>
                      <a
                        href={item.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline flex items-center gap-1 text-sm"
                      >
                        {item.pageUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Screenshot */}
                    {item.screenshotBase64 && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Screenshot</label>
                        <img
                          src={item.screenshotBase64}
                          alt="Feedback screenshot"
                          className="max-w-full max-h-64 rounded border border-[#333] object-contain"
                        />
                      </div>
                    )}

                    {/* Raw Feedback */}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Original Feedback</label>
                      <p className="text-parchment/80 text-sm whitespace-pre-wrap bg-[#1a1a1a] p-3 rounded">
                        {item.rawFeedback}
                      </p>
                    </div>

                    {/* AI Processed Instructions */}
                    {item.aiProcessedInstructions && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-500 uppercase tracking-wide">
                            AI-Processed IDE Instructions
                          </label>
                          <button
                            onClick={() => copyInstructions(item.aiProcessedInstructions!, item.id)}
                            className="flex items-center gap-1 text-gold hover:text-gold/80 text-xs"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy to Clipboard
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-green-300 text-sm whitespace-pre-wrap bg-[#0a0a0a] p-4 rounded border border-green-900/30 font-mono overflow-x-auto">
                          {item.aiProcessedInstructions}
                        </pre>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-[#222]">
                      <span className="text-gray-400 text-sm mr-2">Set Status:</span>
                      {['NEW', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(item.id, status)}
                          className={`px-3 py-1 rounded text-xs transition ${
                            item.status === status
                              ? 'bg-gold text-black'
                              : 'bg-[#222] hover:bg-[#333] text-gray-300'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {feedback.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No feedback submissions yet.</p>
                <p className="text-sm mt-1">Partner feedback will appear here once submitted.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    gold: 'text-gold',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
  };
  
  return (
    <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
