'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Globe, 
  AlertTriangle, 
  RefreshCw, 
  XCircle,
  Clock,
  BookOpen,
  Activity
} from 'lucide-react';

interface Session {
  id: string;
  user_id: string;
  email: string | null;
  ip_address: string;
  user_agent: string;
  book_id: string;
  current_section: string | null;
  current_page: number;
  started_at: string;
  last_heartbeat: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  email: string | null;
  ip_address: string;
  book_id: string;
  action: string;
  section_id: string | null;
  page_number: number | null;
  created_at: string;
}

interface Summary {
  activeCount: number;
  uniqueIps: number;
  uniqueUsers: number;
  suspiciousUsers: { userId: string; ipCount: number }[];
  suspiciousIps: { ip: string; userCount: number }[];
}

export default function ActiveReadersPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/active-readers');
      const data = await res.json();
      setSummary(data.summary);
      setSessions(data.sessions || []);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      console.error('Error fetching active readers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const endSession = async (sessionId: string) => {
    if (!confirm('End this reader session?')) return;
    
    await fetch('/api/admin/active-readers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end_session', sessionId })
    });
    fetchData();
  };

  const endByIp = async (ip: string) => {
    if (!confirm(`End ALL sessions from IP ${ip}?`)) return;
    
    await fetch('/api/admin/active-readers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end_by_ip', ip })
    });
    fetchData();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  const formatDuration = (startStr: string) => {
    const start = new Date(startStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-parchment p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-gold mb-2">Active Readers</h1>
            <p className="text-parchment/60">Monitor ThroneLight Reader usage in real-time</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-charcoal/50 border border-gold/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-parchment/60 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-green-400">{summary?.activeCount || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-charcoal/50 border border-gold/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-parchment/60 text-sm">Unique IPs</p>
                <p className="text-3xl font-bold text-blue-400">{summary?.uniqueIps || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-charcoal/50 border border-gold/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-parchment/60 text-sm">Unique Users</p>
                <p className="text-3xl font-bold text-gold">{summary?.uniqueUsers || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Suspicious Activity Alerts */}
        {((summary?.suspiciousUsers?.length || 0) > 0 || (summary?.suspiciousIps?.length || 0) > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Suspicious Activity Detected</h2>
            </div>
            
            {summary?.suspiciousUsers?.map((su) => (
              <p key={su.userId} className="text-parchment/80 mb-2">
                ⚠️ User <span className="text-gold">{su.userId}</span> is accessing from <span className="text-red-400">{su.ipCount} different IPs</span>
              </p>
            ))}
            
            {summary?.suspiciousIps?.map((si) => (
              <div key={si.ip} className="flex items-center justify-between mb-2">
                <p className="text-parchment/80">
                  ⚠️ IP <span className="text-gold">{si.ip}</span> has <span className="text-red-400">{si.userCount} different users</span>
                </p>
                <button
                  onClick={() => endByIp(si.ip)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm"
                >
                  Block IP
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Active Sessions Table */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-gold/20">
            <h2 className="text-lg font-semibold text-gold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Sessions
            </h2>
          </div>
          
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-parchment/50">
              No active readers at the moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">User</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">Section</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">Page</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">Duration</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-parchment/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-charcoal/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-parchment text-sm">{session.email || 'Anonymous'}</p>
                          <p className="text-parchment/50 text-xs">{session.user_id.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-parchment/80 text-sm font-mono">{session.ip_address}</td>
                      <td className="px-4 py-3 text-parchment/80 text-sm">{session.current_section || '-'}</td>
                      <td className="px-4 py-3 text-gold text-sm">{session.current_page}</td>
                      <td className="px-4 py-3 text-parchment/80 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.started_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-parchment/80 text-sm">{formatTime(session.last_heartbeat)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => endSession(session.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                          title="End Session"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gold/20">
            <h2 className="text-lg font-semibold text-gold">Recent Activity (Last Hour)</h2>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-parchment/50">
              No recent activity
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-4 py-2 border-b border-gold/5 flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    activity.action === 'start' ? 'bg-green-500/20 text-green-400' :
                    activity.action === 'end' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {activity.action}
                  </span>
                  <span className="text-parchment/60 text-sm">{activity.email || activity.user_id.substring(0, 8)}</span>
                  <span className="text-parchment/40 text-xs">{activity.ip_address}</span>
                  <span className="text-parchment/40 text-xs ml-auto">{formatTime(activity.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
