'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface SupportTicket {
  id: string;
  email: string;
  message: string;
  browser: string;
  os: string;
  device_type: string;
  screen_resolution: string;
  viewport_size: string;
  current_page: number;
  total_pages: number;
  current_section: string;
  is_dark_mode: boolean;
  selected_language: string;
  audio_enabled: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const statusConfig = {
  open: { label: 'Open', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: RefreshCw },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
};

export default function ReaderSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const isAdmin = localStorage.getItem('admin-authenticated');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reader/support?status=${filterStatus}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: string, adminNotes?: string) => {
    setUpdatingTicket(ticketId);
    try {
      await fetch('/api/reader/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: newStatus, adminNotes }),
      });
      await fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Filter tickets by search
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.email.toLowerCase().includes(query) ||
      ticket.message.toLowerCase().includes(query) ||
      ticket.current_section?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-[#222] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gold flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                Reader Support Tickets
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage support requests from Throne Light Reader users
              </p>
            </div>
          </div>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
                <p className="text-gray-400 text-sm">Open</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                <p className="text-gray-400 text-sm">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                <p className="text-gray-400 text-sm">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gold">{stats.total}</p>
                <p className="text-gray-400 text-sm">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, message, or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:border-gold/50 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg text-white focus:border-gold/50 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No support tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status].icon;
              const isExpanded = expandedTicket === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="bg-[#111] border border-[#222] rounded-xl overflow-hidden"
                >
                  {/* Ticket Header */}
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[ticket.status].color}`}>
                        <StatusIcon className="w-3 h-3 inline-block mr-1" />
                        {statusConfig[ticket.status].label}
                      </span>
                      <div className="text-left">
                        <p className="text-white font-medium">{ticket.email}</p>
                        <p className="text-gray-400 text-sm truncate max-w-md">
                          {ticket.message.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        {ticket.device_type === 'Mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span>{ticket.browser}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{formatDate(ticket.created_at)}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-[#222]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Message */}
                        <div>
                          <h4 className="text-sm font-medium text-gold mb-2">Message</h4>
                          <p className="text-gray-300 text-sm bg-[#0a0a0a] p-4 rounded-lg">
                            {ticket.message}
                          </p>

                          {/* Admin Notes */}
                          <h4 className="text-sm font-medium text-gold mt-4 mb-2">Admin Notes</h4>
                          <textarea
                            defaultValue={ticket.admin_notes || ''}
                            placeholder="Add notes about this ticket..."
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white text-sm resize-none focus:border-gold/50 outline-none"
                            rows={3}
                            onBlur={(e) => {
                              if (e.target.value !== ticket.admin_notes) {
                                updateTicketStatus(ticket.id, ticket.status, e.target.value);
                              }
                            }}
                          />
                        </div>

                        {/* Device Info */}
                        <div>
                          <h4 className="text-sm font-medium text-gold mb-2">Device Information</h4>
                          <div className="bg-[#0a0a0a] p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Device</span>
                              <span className="text-white flex items-center gap-2">
                                {ticket.device_type === 'Mobile' ? (
                                  <Smartphone className="w-4 h-4" />
                                ) : (
                                  <Monitor className="w-4 h-4" />
                                )}
                                {ticket.device_type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Browser</span>
                              <span className="text-white">{ticket.browser}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">OS</span>
                              <span className="text-white">{ticket.os}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Screen</span>
                              <span className="text-white">{ticket.screen_resolution}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Viewport</span>
                              <span className="text-white">{ticket.viewport_size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Page</span>
                              <span className="text-white">{ticket.current_page} / {ticket.total_pages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Section</span>
                              <span className="text-white">{ticket.current_section}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Language</span>
                              <span className="text-white flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {ticket.selected_language.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Dark Mode</span>
                              <span className="text-white">{ticket.is_dark_mode ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Audio</span>
                              <span className="text-white">{ticket.audio_enabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          </div>

                          {/* Status Actions */}
                          <h4 className="text-sm font-medium text-gold mt-4 mb-2">Update Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => updateTicketStatus(ticket.id, status)}
                                disabled={ticket.status === status || updatingTicket === ticket.id}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                                  ticket.status === status
                                    ? statusConfig[status].color
                                    : 'border-[#333] text-gray-400 hover:border-gold/50 hover:text-gold'
                                }`}
                              >
                                {updatingTicket === ticket.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  statusConfig[status].label
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
