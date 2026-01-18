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
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { TEAM_MEMBER_ROLES, type TeamMemberRole } from '@/lib/team-member-roles';

interface TeamMemberSession {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  partnerName: string;
  partnerSlug: string;
  position?: string;
}

interface SubLink {
  id: string;
  code: string;
  label: string;
  fullUrl: string | null;
  clickCount: number;
}

interface SubLinkStats {
  id: string;
  code: string;
  label: string;
  traffic: number;
  clicks: number;
  amazonClicks: number;
  sales: number;
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
  const [subLinkStats, setSubLinkStats] = useState<SubLinkStats[]>([]);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMain, setCopiedMain] = useState(false);
  const [showPositionPrompt, setShowPositionPrompt] = useState(false);
  const [position, setPosition] = useState('');
  const [savingPosition, setSavingPosition] = useState(false);

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
      // Show position prompt if not set
      if (!parsed.position) {
        setShowPositionPrompt(true);
      }
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
      setSubLinkStats(result.subLinkStats || []);
      
      // Update session with partnerSlug if missing (for existing sessions)
      if (result.partnerSlug) {
        const sessionData = localStorage.getItem('teamMemberSession');
        if (sessionData) {
          const currentSession = JSON.parse(sessionData);
          if (!currentSession.partnerSlug) {
            currentSession.partnerSlug = result.partnerSlug;
            localStorage.setItem('teamMemberSession', JSON.stringify(currentSession));
            setSession(currentSession);
          }
        }
      }
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

  const handleGenerateLink = async () => {
    if (!session) return;
    setCreating(true);

    try {
      const res = await fetch('/api/partners/sub-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: session.partnerId,
          teamMemberId: session.id,
          label: `${session.name}'s Link`,
        }),
      });

      if (res.ok) {
        fetchSubLinks(session.partnerId, session.id);
        fetchDashboardData(session.partnerId, session.id, session.role);
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

  const copyMainLink = () => {
    if (!session?.partnerSlug) return;
    const mainLink = `https://thronelightpublishing.com/partners/${session.partnerSlug}`;
    navigator.clipboard.writeText(mainLink);
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2000);
  };

  const partnerMainLink = session?.partnerSlug 
    ? `https://thronelightpublishing.com/partners/${session.partnerSlug}` 
    : '';

  const handleSavePosition = async () => {
    if (!position.trim() || !session) return;
    setSavingPosition(true);

    try {
      const res = await fetch('/api/partners/team-members/position', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: session.id,
          position: position.trim(),
        }),
      });

      if (res.ok) {
        // Update session with position
        const updatedSession = { ...session, position: position.trim() };
        setSession(updatedSession);
        localStorage.setItem('teamMemberSession', JSON.stringify(updatedSession));
        setShowPositionPrompt(false);
      }
    } catch (error) {
      console.error('Error saving position:', error);
    }
    setSavingPosition(false);
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
      {/* Position Prompt Modal */}
      {showPositionPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to the Team!</h2>
              <p className="text-gray-400 text-sm">
                What's your role or position on {session.partnerName}'s team?
              </p>
            </div>

            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g., Manager, Marketing Lead, Sales Rep"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={handleSavePosition}
                disabled={savingPosition || !position.trim()}
                className="flex-1 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {savingPosition ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                onClick={() => setShowPositionPrompt(false)}
                className="px-6 py-3 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-gold font-semibold">Team {session.partnerName}</h1>
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

        {/* Partner's Main Link */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-gold font-semibold">Partner Promo Link</h2>
              <p className="text-gray-500 text-xs">Share this link or generate your own tracked link below</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-white font-mono text-sm truncate">{partnerMainLink}</p>
            </div>
            <button
              onClick={copyMainLink}
              disabled={!partnerMainLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
            >
              {copiedMain ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Your Tracked Links Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#111] border border-[#222] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg">
                <Link2 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="text-gold font-semibold">Your Tracked Links</h2>
                <p className="text-gray-500 text-xs">Generate unique links to track your personal referrals</p>
              </div>
            </div>
            <button
              onClick={handleGenerateLink}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {creating ? (
                'Generating...'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Link
                </>
              )}
            </button>
          </div>

          {/* Links List with Stats */}
          {subLinkStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No promo links yet</p>
              <p className="text-xs text-gray-600 mt-1">Create a link to start tracking your referrals</p>
            </div>
          ) : (
            <div className="space-y-6">
              {subLinkStats.map((linkStat) => {
                const linkInfo = subLinks.find(l => l.id === linkStat.id);
                return (
                  <div
                    key={linkStat.id}
                    className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5"
                  >
                    {/* Link Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base">{linkStat.label}</p>
                        <p className="text-gray-500 text-xs truncate mt-1">{linkInfo?.fullUrl || ''}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(linkInfo?.fullUrl || '', linkStat.id)}
                        disabled={!linkInfo?.fullUrl}
                        className="p-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors ml-4"
                        title="Copy link"
                      >
                        {copiedId === linkStat.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">Traffic</span>
                        </div>
                        <p className="text-lg font-bold text-white">{linkStat.traffic}</p>
                      </div>

                      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <MousePointer className="w-3 h-3" />
                          <span className="text-xs">Clicks</span>
                        </div>
                        <p className="text-lg font-bold text-white">{linkStat.clicks}</p>
                      </div>

                      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-xs">Amazon</span>
                        </div>
                        <p className="text-lg font-bold text-white">{linkStat.amazonClicks}</p>
                      </div>

                      {canViewSales && (
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <ShoppingBag className="w-3 h-3" />
                            <span className="text-xs">Sales</span>
                          </div>
                          <p className="text-lg font-bold text-gold">{linkStat.sales}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
