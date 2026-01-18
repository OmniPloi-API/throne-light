'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Power, 
  Eye,
  MousePointer, 
  ShoppingBag, 
  Link2, 
  Plus,
  Copy,
  Check,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { TEAM_MEMBER_ROLES, type TeamMemberRole } from '@/lib/team-member-roles';

interface TeamMemberSession {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  partnerName: string;
}

interface SubLink {
  id: string;
  code: string;
  label: string;
  fullUrl: string | null;
  clickCount: number;
}

interface DashboardData {
  totalTraffic: number;
  totalClicks: number;
  amazonClicks: number;
  totalSales: number;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<TeamMemberSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [subLinks, setSubLinks] = useState<SubLink[]>([]);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('teamMemberSession');
    if (!sessionData) {
      router.push('/partner/team-login');
      return;
    }

    try {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
      fetchDashboardData(parsed.partnerId, parsed.id, parsed.role);
      fetchSubLinks(parsed.partnerId, parsed.id);
    } catch {
      router.push('/partner/team-login');
    }
  }, [router]);

  useEffect(() => {
    if (session?.partnerName) {
      document.title = `Team ${session.partnerName}`;
    }
  }, [session?.partnerName]);

  const fetchDashboardData = async (partnerId: string, memberId: string, role: TeamMemberRole) => {
    try {
      const res = await fetch(`/api/partners/team-dashboard?partnerId=${partnerId}&memberId=${memberId}`);
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const fetchSubLinks = async (partnerId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/partners/sub-links?partnerId=${partnerId}&teamMemberId=${memberId}&isTeamMember=true`);
      const result = await res.json();
      setSubLinks((result.subLinks || []) as SubLink[]);
    } catch (error) {
      console.error('Error fetching sub-links:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teamMemberSession');
    router.push('/partner/team-login');
  };

  const handleCreateLink = async () => {
    if (!newLinkName.trim() || !session) return;
    setCreating(true);

    try {
      const res = await fetch('/api/partners/sub-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: session.partnerId,
          teamMemberId: session.id,
          label: newLinkName.trim(),
        }),
      });

      if (res.ok) {
        setNewLinkName('');
        setShowCreateLink(false);
        fetchSubLinks(session.partnerId, session.id);
      }
    } catch (error) {
      console.error('Error creating link:', error);
    }
    setCreating(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const roleInfo = session?.role ? TEAM_MEMBER_ROLES[session.role] : null;
  const canViewSales = roleInfo?.canViewSales ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Team {session.partnerName}</h1>
              <p className="text-gray-500 text-xs">Team Dashboard • {session.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gold hover:text-red-400 transition ml-4 p-2 rounded-lg hover:bg-red-400/10"
            title="Logout"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Access Level Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-blue-400 font-medium">{roleInfo?.label}</p>
              <p className="text-blue-300/60 text-sm">
                {canViewSales 
                  ? 'You can view sales counts and click data for this partner.' 
                  : 'You can view click and traffic data for this partner.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2 justify-center">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Total Traffic</span>
            </div>
            <p className="text-2xl font-bold text-white">{data?.totalTraffic || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2 justify-center">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold text-white">{data?.totalClicks || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2 justify-center">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs">Amazon Clicks</span>
            </div>
            <p className="text-2xl font-bold text-white">{data?.amazonClicks || 0}</p>
          </motion.div>

          {canViewSales && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col items-center justify-center text-center"
            >
              <div className="flex items-center gap-2 text-gray-400 mb-2 justify-center">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs">Total Sales</span>
              </div>
              <p className="text-2xl font-bold text-gold">{data?.totalSales || 0}</p>
            </motion.div>
          )}
        </div>

        {/* Promo Links Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111] border border-[#222] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg">
                <Link2 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Your Promo Links</h2>
                <p className="text-gray-500 text-xs">Create unique links to track your referrals</p>
              </div>
            </div>
            {!showCreateLink && (
              <button
                onClick={() => setShowCreateLink(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Link
              </button>
            )}
          </div>

          {/* Create Link Form */}
          {showCreateLink && (
            <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  placeholder="Link name (e.g., Instagram Bio, Twitter)"
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none text-sm"
                />
                <button
                  onClick={handleCreateLink}
                  disabled={creating || !newLinkName.trim()}
                  className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateLink(false);
                    setNewLinkName('');
                  }}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Links List */}
          {subLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No promo links yet</p>
              <p className="text-xs text-gray-600 mt-1">Create a link to start tracking your referrals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333] rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{link.label}</p>
                    <p className="text-gray-500 text-xs truncate">{link.fullUrl || ''}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-gold font-semibold">{link.clickCount || 0}</p>
                      <p className="text-gray-600 text-xs">clicks</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(link.fullUrl || '', link.id)}
                      disabled={!link.fullUrl}
                      className="p-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Info Note */}
        <p className="text-center text-gray-600 text-xs mt-8">
          This is a view-only dashboard. Contact your partner for any changes.
        </p>
      </main>
    </div>
  );
}
