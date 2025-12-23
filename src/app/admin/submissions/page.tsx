'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  Filter,
  RefreshCw,
  ChevronDown,
  X,
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  email: string;
  title: string;
  genre: string;
  synopsis: string;
  sampleChapter: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  submittedAt: string;
  notes?: string;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  pending: 'Pending Review',
  reviewing: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submissions?status=${filter}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  // Update submission status
  const updateStatus = async (id: string, status: string, notes?: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });
      
      if (response.ok) {
        fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: status as Submission['status'], notes });
        }
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete submission
  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/submissions?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="bg-onyx border-b border-gold/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gold text-2xl">♛</span>
              <div>
                <h1 className="font-serif text-xl text-parchment">Manuscript Submissions</h1>
                <p className="text-parchment/40 text-sm">Throne Light Publishing Admin</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-charcoal border border-gold/20 rounded-lg pl-4 pr-10 py-2 text-parchment text-sm focus:border-gold/50 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Submissions</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40 pointer-events-none" />
              </div>
              
              {/* Refresh */}
              <button
                onClick={fetchSubmissions}
                className="p-2 bg-charcoal border border-gold/20 rounded-lg text-parchment/60 hover:text-gold hover:border-gold/40 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: submissions.length, color: 'gold' },
            { label: 'Pending', count: submissions.filter(s => s.status === 'pending').length, color: 'yellow-400' },
            { label: 'Reviewing', count: submissions.filter(s => s.status === 'reviewing').length, color: 'blue-400' },
            { label: 'Accepted', count: submissions.filter(s => s.status === 'accepted').length, color: 'green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-onyx/50 border border-gold/10 rounded-xl p-4">
              <p className="text-parchment/40 text-sm">{stat.label}</p>
              <p className={`text-2xl font-serif text-${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full"
            />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-parchment/20 mx-auto mb-4" />
            <p className="text-parchment/40">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-onyx/50 border border-gold/10 rounded-xl p-5 hover:border-gold/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg text-parchment truncate">{submission.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[submission.status]}`}>
                        {statusLabels[submission.status]}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-parchment/50">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" /> {submission.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {submission.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {submission.genre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteSubmission(submission.id)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-charcoal/90 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-onyx border border-gold/30 rounded-2xl shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-gold/20">
                <div>
                  <h2 className="font-serif text-2xl text-parchment mb-1">{selectedSubmission.title}</h2>
                  <p className="text-parchment/50 text-sm">by {selectedSubmission.name}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-parchment/40 hover:text-parchment transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Meta Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-charcoal/50 rounded-lg p-4">
                    <p className="text-parchment/40 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-parchment">{selectedSubmission.email}</p>
                  </div>
                  <div className="bg-charcoal/50 rounded-lg p-4">
                    <p className="text-parchment/40 text-xs uppercase tracking-wider mb-1">Genre</p>
                    <p className="text-parchment capitalize">{selectedSubmission.genre}</p>
                  </div>
                  <div className="bg-charcoal/50 rounded-lg p-4">
                    <p className="text-parchment/40 text-xs uppercase tracking-wider mb-1">Submitted</p>
                    <p className="text-parchment">{formatDate(selectedSubmission.submittedAt)}</p>
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <h3 className="text-parchment/60 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Synopsis
                  </h3>
                  <div className="bg-charcoal/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-parchment/80 whitespace-pre-wrap">{selectedSubmission.synopsis}</p>
                  </div>
                </div>

                {/* Sample Chapter */}
                <div>
                  <h3 className="text-parchment/60 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Sample Chapter
                  </h3>
                  <div className="bg-charcoal/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-parchment/80 whitespace-pre-wrap font-serif">{selectedSubmission.sampleChapter}</p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-gold/20 pt-6">
                  <h3 className="text-parchment/60 text-sm uppercase tracking-wider mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-3">
                    {(['pending', 'reviewing', 'accepted', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedSubmission.id, status)}
                        disabled={isUpdating || selectedSubmission.status === status}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${
                          selectedSubmission.status === status 
                            ? statusColors[status] + ' ring-2 ring-offset-2 ring-offset-onyx'
                            : 'border-parchment/20 text-parchment/60 hover:border-gold/40 hover:text-parchment'
                        } ${statusColors[status]}`}
                      >
                        {status === 'accepted' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {status === 'rejected' && <XCircle className="w-4 h-4 inline mr-1" />}
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
