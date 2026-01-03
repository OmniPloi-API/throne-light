'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, RefreshCw, Search, Filter, Clock, CheckCircle, 
  XCircle, AlertCircle, MessageSquare, Mail, Package, CreditCard,
  Settings, HelpCircle, Trash2, ChevronDown, User, Loader2
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  orderNumber?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  ORDER_ISSUE: <Package className="w-4 h-4" />,
  REFUND_REQUEST: <CreditCard className="w-4 h-4" />,
  TECHNICAL_ISSUE: <Settings className="w-4 h-4" />,
  ACCOUNT_ISSUE: <AlertCircle className="w-4 h-4" />,
  GENERAL_INQUIRY: <HelpCircle className="w-4 h-4" />,
  OTHER: <MessageSquare className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
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
  }, [router]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      
      const response = await fetch(`/api/support?${params.toString()}`);
      const data = await response.json();
      setTickets(data.tickets || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const handleAction = async (ticketId: string, action: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      });
      
      if (response.ok) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          const data = await response.json();
          setSelectedTicket(data.ticket);
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.name.toLowerCase().includes(query) ||
      ticket.email.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Support Tickets</h1>
                <p className="text-sm text-gray-400">Manage customer support requests</p>
              </div>
            </div>
            <button
              onClick={fetchTickets}
              className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-yellow-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-blue-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-green-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-gray-400 text-sm">Closed</p>
              <p className="text-2xl font-bold">{stats.closed}</p>
            </div>
            <div className="bg-[#111] border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">Urgent</p>
              <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#222] rounded-lg focus:border-gold outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg focus:border-gold outline-none"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg focus:border-gold outline-none"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setAdminNotes(ticket.adminNotes || '');
                  }}
                  className={`bg-[#111] border rounded-xl p-4 cursor-pointer transition-all hover:border-gold/50 ${
                    selectedTicket?.id === ticket.id ? 'border-gold' : 'border-[#222]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gold">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-1">{ticket.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.name}
                    </span>
                    <span className="flex items-center gap-1">
                      {categoryIcons[ticket.category]}
                      {formatCategory(ticket.category)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedTicket ? (
              <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#222]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="font-mono text-gold">{selectedTicket.ticketNumber}</span>
                      <h2 className="text-xl font-bold mt-1">{selectedTicket.subject}</h2>
                    </div>
                    <button
                      onClick={() => handleDelete(selectedTicket.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedTicket.status]}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority} Priority
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-[#222] text-gray-300 flex items-center gap-1">
                      {categoryIcons[selectedTicket.category]}
                      {formatCategory(selectedTicket.category)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">From</p>
                      <p className="font-medium">{selectedTicket.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <a href={`mailto:${selectedTicket.email}`} className="text-gold hover:underline">
                        {selectedTicket.email}
                      </a>
                    </div>
                    {selectedTicket.orderNumber && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Order Number</p>
                        <p className="font-mono">{selectedTicket.orderNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p>{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Updated</p>
                      <p>{formatDate(selectedTicket.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-[#222]">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Message</h3>
                  <p className="text-gray-200 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                <div className="p-6 border-b border-[#222]">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg focus:border-gold outline-none resize-none"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.status === 'OPEN' && (
                      <button
                        onClick={() => handleAction(selectedTicket.id, 'in_progress')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(selectedTicket.status === 'OPEN' || selectedTicket.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => handleAction(selectedTicket.id, 'resolve')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                    {selectedTicket.status === 'RESOLVED' && (
                      <button
                        onClick={() => handleAction(selectedTicket.id, 'close')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                      >
                        Close Ticket
                      </button>
                    )}
                    {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                      <button
                        onClick={() => handleAction(selectedTicket.id, 'reopen')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                    <a
                      href={`mailto:${selectedTicket.email}?subject=Re: [${selectedTicket.ticketNumber}] ${selectedTicket.subject}`}
                      className="px-4 py-2 bg-gold hover:bg-gold/90 text-black rounded-lg transition flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
