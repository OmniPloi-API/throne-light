'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic import for the Command Center map (no SSR)
const AdminWorldMap = dynamic(
  () => import('@/components/admin/AdminWorldMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-[#111] rounded-xl flex items-center justify-center border border-[#222]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gold/60">Loading Command Center...</p>
        </div>
      </div>
    )
  }
);
import { 
  Users, DollarSign, TrendingUp, ExternalLink, 
  Eye, MousePointer, ShoppingCart, BarChart3, Copy, Check,
  ArrowUpRight, ArrowDownRight, Link2, Loader2, LogOut,
  Power, Trash2, RotateCcw, AlertTriangle
} from 'lucide-react';
import ConfirmActionModal from '@/components/admin/ConfirmActionModal';
import SubAdminManagement from '@/components/admin/SubAdminManagement';

interface Partner {
  id: string;
  name: string;
  email: string;
  slug: string;
  couponCode: string;
  accessCode?: string;
  amazonUrl?: string;
  kindleUrl?: string;
  bookBabyUrl?: string;
  commissionPercent: number;
  clickBounty: number;
  discountPercent: number;
  isActive: boolean;
  deactivatedAt?: string;
  createdAt: string;
  onboardingEmailSentAt?: string;
  onboardingScheduledAt?: string;
  onboardingCancelled?: boolean;
}

interface TrackingEvent {
  id: string;
  partnerId: string;
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_KINDLE' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT' | 'PENDING_SALE' | 'SALE';
  device?: string;
  city?: string;
  region?: string;
  country?: string;
  ipAddress?: string;
  pagePath?: string;
  createdAt: string;
}

interface Order {
  id: string;
  partnerId?: string;
  stripeSessionId: string;
  totalAmount: number;
  commissionEarned: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalVisits: number;
  totalAmazonClicks: number;
  totalBookBabyClicks: number;
  totalDirectClicks: number;
  totalDirectSales: number;
  totalDirectRevenue: number;
  totalCommissionOwed: number;
  retentionRate: number;
  bounceToRetailer: number;
  partnerCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [createdPartner, setCreatedPartner] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'reactivate' | 'delete';
    partner: Partner;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTrafficBreakdown, setShowTrafficBreakdown] = useState(false);
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);
  const [showCommissionBreakdown, setShowCommissionBreakdown] = useState(false);
  const [showRetentionBreakdown, setShowRetentionBreakdown] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication on mount
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

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const handleDeactivate = async (partner: Partner) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partners/${partner.id}/deactivate`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchAll();
        setConfirmAction(null);
      }
    } catch (err) {
      console.error('Deactivation error:', err);
    }
    setActionLoading(false);
  };

  const handleReactivate = async (partner: Partner) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partners/${partner.id}/reactivate`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchAll();
        setConfirmAction(null);
      }
    } catch (err) {
      console.error('Reactivation error:', err);
    }
    setActionLoading(false);
  };

  const handleDelete = async (partner: Partner) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchAll();
        setConfirmAction(null);
      }
    } catch (err) {
      console.error('Deletion error:', err);
    }
    setActionLoading(false);
  };

  async function fetchAll() {
    try {
      const [pRes, eRes, oRes, sRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/events'),
        fetch('/api/orders'),
        fetch('/api/stats'),
      ]);
      const [p, e, o, s] = await Promise.all([
        pRes.json(),
        eRes.ok ? eRes.json() : [],
        oRes.ok ? oRes.json() : [],
        sRes.ok ? sRes.json() : null,
      ]);
      setPartners(Array.isArray(p) ? p : []);
      setEvents(Array.isArray(e) ? e : []);
      setOrders(Array.isArray(o) ? o : []);
      setStats(s);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/partners/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  // Calculate totals from Supabase orders (source of truth for revenue)
  // Legacy stats API only has JSON data which may be empty
  const totalVisits = events.filter(e => e.type === 'PAGE_VIEW').length;
  const amazonClicks = stats?.totalAmazonClicks ?? events.filter(e => e.type === 'CLICK_AMAZON').length;
  const directClicks = stats?.totalDirectClicks ?? events.filter(e => e.type === 'CLICK_DIRECT').length;
  // Always calculate revenue from Supabase orders (not legacy JSON stats)
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCommission = orders.reduce((s, o) => s + o.commissionEarned, 0);
  const retentionRate = totalVisits > 0 ? (directClicks / totalVisits * 100) : 0;
  const bounceRate = totalVisits > 0 ? (amazonClicks / totalVisits * 100) : 0;

  // Calculate click bounty owed
  const totalClickBounty = partners.reduce((sum, p) => {
    const partnerAmazonClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_AMAZON').length;
    const partnerBookBabyClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_BOOKBABY').length;
    return sum + ((partnerAmazonClicks + partnerBookBabyClicks) * p.clickBounty);
  }, 0);

  // Show loading while checking auth or before mount (prevents hydration mismatch)
  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-6">
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/images/CROWN-LOGO-500PX.png" 
            alt="Crown" 
            className="h-12 w-auto opacity-80 mb-2"
          />
          <h1 className="text-3xl font-bold text-gold">Throne Light Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Hybrid Tracking and Deployment Dashboard</p>
        </div>
        <div className="flex justify-center">
          <div className="flex gap-3">
            <Link href="/admin/access-codes" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition font-semibold border border-gold/30">
              Access Codes
            </Link>
            <Link href="/admin/feedback" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition">
              Partner Feedback
            </Link>
                        <Link href="/admin/reviews" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition">
              Review Management
            </Link>
            <Link href="/admin/subscribers" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition">
              Subscribers
            </Link>
            <Link href="/admin/reader-support" className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm transition">
              Reader Support
            </Link>
            <Link href="/partner" className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition">
              Partner View →
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Command Center - Global Visualization Map */}
        <section className="mb-10">
          <AdminWorldMap />
        </section>

        {/* Traffic Source Analysis - Split Testing View */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold" />
            Traffic Source Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard 
              icon={<Eye />} 
              label="Total Visits" 
              value={totalVisits} 
              onClick={() => setShowTrafficBreakdown(true)}
              clickable
            />
            <StatCard 
              icon={<ArrowUpRight className="text-green-400" />} 
              label="Retention Rate" 
              value={`${retentionRate.toFixed(1)}%`}
              sublabel="Stayed on site"
              color="green"
              onClick={() => setShowRetentionBreakdown(true)}
              clickable
            />
            <StatCard 
              icon={<ArrowDownRight className="text-orange-400" />} 
              label="Bounce to Retail" 
              value={`${bounceRate.toFixed(1)}%`}
              sublabel="Clicked Amazon/books.by"
              color="orange"
            />
            <StatCard icon={<ShoppingCart />} label="Direct Sales" value={orders.length} color="green" />
            <StatCard icon={<ExternalLink />} label="Amazon Clicks" value={amazonClicks} color="gray" />
          </div>
        </section>

        {/* Revenue Analysis */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold" />
            Revenue Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<DollarSign className="text-green-400" />} 
              label="Gross Revenue" 
              value={`$${totalRevenue.toFixed(2)}`}
              sublabel="Verified via Stripe"
              color="green"
              onClick={() => setShowRevenueBreakdown(true)}
              clickable
            />
            <StatCard 
              icon={<TrendingUp className="text-blue-400" />} 
              label="Commission Owed" 
              value={`$${totalCommission.toFixed(2)}`}
              sublabel="Partner commission"
              color="blue"
              onClick={() => setShowCommissionBreakdown(true)}
              clickable
            />
            <StatCard 
              icon={<MousePointer className="text-purple-400" />} 
              label="Click Bounty Owed" 
              value={`$${totalClickBounty.toFixed(2)}`}
              sublabel="External click fees"
              color="purple"
            />
            <StatCard 
              icon={<DollarSign className="text-gray-400" />} 
              label="Estimated Amazon Revenue" 
              value={`$${Math.max(0, (Math.floor(amazonClicks * 0.10) * 21) - totalClickBounty).toFixed(2)}`}
              sublabel="10% conv. @ $35 - fees"
              color="gray"
            />
          </div>
        </section>

        {/* Create Partner */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            Onboard New Partner
          </h2>
          <CreatePartnerForm onCreated={fetchAll} onPartnerCreated={(partner) => {
          setCreatedPartner(partner);
          setShowAccessCode(true);
        }} />
        </section>
        
        {/* Access Code Modal */}
        {showAccessCode && createdPartner && (
          <AccessCodeModal 
            partner={createdPartner} 
            onClose={() => {
              setShowAccessCode(false);
              setCreatedPartner(null);
            }} 
          />
        )}

        {/* Sub-Admin Management - Collapsible Section */}
        <SubAdminManagement />

        {/* Partners Table */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Partner Performance</h2>
          <div className="bg-[#111] rounded-xl border border-[#222] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#333] text-gray-400">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Smart Link</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Page Views</th>
                  <th className="px-4 py-3">Direct Sales</th>
                  <th className="px-4 py-3">Amazon Clicks</th>
                  <th className="px-4 py-3">Commission %</th>
                  <th className="px-4 py-3">Discount %</th>
                  <th className="px-4 py-3">Click Bounty</th>
                  <th className="px-4 py-3">Total Owed</th>
                  <th className="px-4 py-3">Outreach</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const pEvents = events.filter(e => e.partnerId === p.id);
                  const pageViews = pEvents.filter(e => e.type === 'PAGE_VIEW').length;
                  const pAmazon = pEvents.filter(e => e.type === 'CLICK_AMAZON').length;
                  const pBookBaby = pEvents.filter(e => e.type === 'CLICK_BOOKBABY').length;
                  const pOrders = orders.filter(o => o.partnerId === p.id);
                  const pCommission = pOrders.reduce((s, o) => s + o.commissionEarned, 0);
                  const pClickBounty = (pAmazon + pBookBaby) * p.clickBounty;
                  
                  return (
                    <tr key={p.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => copyLink(p.slug)}
                          className="flex items-center gap-1 text-gold hover:text-gold/80 text-xs font-mono"
                        >
                          {copiedSlug === p.slug ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          /partners/{p.slug}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-gold">{p.couponCode}</td>
                      <td className="px-4 py-3">{pageViews}</td>
                      <td className="px-4 py-3 text-green-400">{pOrders.length}</td>
                      <td className="px-4 py-3 text-gray-400">{pAmazon}</td>
                      <td className="px-4 py-3">{p.commissionPercent}%</td>
                      <td className="px-4 py-3 text-purple-400">{p.discountPercent}%</td>
                      <td className="px-4 py-3">${p.clickBounty.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold text-gold">
                        ${(pCommission + pClickBounty).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <EmailDeploymentControls partner={p} onUpdate={fetchAll} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.isActive ? (
                            <>
                              <button
                                onClick={() => setConfirmAction({ type: 'deactivate', partner: p })}
                                className="p-1.5 rounded bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 transition"
                                title="Deactivate Partner"
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'delete', partner: p })}
                                className="p-1.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                                title="Delete Partner"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setConfirmAction({ type: 'reactivate', partner: p })}
                                className="p-1.5 rounded bg-green-900/30 hover:bg-green-900/50 text-green-400 transition"
                                title="Reactivate Partner"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'delete', partner: p })}
                                className="p-1.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                                title="Delete Partner"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <span className="text-xs text-yellow-400 ml-2">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No partners yet. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Consumer Journey */}
        <ConsumerActivitySection events={events} partners={partners} />
      </main>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmActionModal
          action={confirmAction}
          loading={actionLoading}
          onConfirm={() => {
            if (confirmAction.type === 'deactivate') {
              handleDeactivate(confirmAction.partner);
            } else if (confirmAction.type === 'reactivate') {
              handleReactivate(confirmAction.partner);
            } else if (confirmAction.type === 'delete') {
              handleDelete(confirmAction.partner);
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Traffic Breakdown Modal */}
      {showTrafficBreakdown && (
        <TrafficBreakdownModal
          events={events}
          partners={partners}
          totalVisits={totalVisits}
          onClose={() => setShowTrafficBreakdown(false)}
        />
      )}

      {/* Revenue Breakdown Modal */}
      {showRevenueBreakdown && (
        <RevenueBreakdownModal
          orders={orders}
          partners={partners}
          totalRevenue={totalRevenue}
          onClose={() => setShowRevenueBreakdown(false)}
        />
      )}

      {/* Commission Breakdown Modal */}
      {showCommissionBreakdown && (
        <CommissionBreakdownModal
          orders={orders}
          events={events}
          partners={partners}
          totalCommission={totalCommission}
          onClose={() => setShowCommissionBreakdown(false)}
        />
      )}

      {/* Retention Breakdown Modal */}
      {showRetentionBreakdown && (
        <RetentionBreakdownModal
          events={events}
          onClose={() => setShowRetentionBreakdown(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#222] py-6 mt-8">
        <div className="flex justify-center items-center gap-1">
          <span className="text-gray-500 text-sm">Powered by</span>
          <Image 
            src="/images/AMPLE LOGO.png" 
            alt="AMPLE" 
            width={30}
            height={10}
            className="opacity-50 hover:opacity-70 transition-opacity"
          />
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color = 'gold', onClick, clickable }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  sublabel?: string;
  color?: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    gold: 'text-gold',
    green: 'text-green-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400',
  };
  
  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component 
      onClick={onClick}
      className={`bg-[#111] p-5 rounded-xl border border-[#222] w-full text-left ${
        clickable ? 'cursor-pointer hover:bg-[#1a1a1a] hover:border-gold/40 transition-all' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`w-5 h-5 ${colorClasses[color]}`}>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
      {clickable && <div className="text-xs text-gold/60 mt-2">Click for details →</div>}
    </Component>
  );
}

function EventBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PAGE_VIEW: { bg: 'bg-blue-900/30', text: 'text-blue-300', label: 'Page View' },
    PENDING_SALE: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', label: '⏳ Pending Sale' },
    CLICK_DIRECT: { bg: 'bg-green-900/30', text: 'text-green-300', label: '💰 Sale!' },
    CLICK_AMAZON: { bg: 'bg-orange-900/30', text: 'text-orange-300', label: 'Amazon Click' },
    CLICK_BOOKBABY: { bg: 'bg-purple-900/30', text: 'text-purple-300', label: 'books.by Click' },
  };
  const c = config[type] || { bg: 'bg-gray-900/30', text: 'text-gray-300', label: type };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// Helper to determine site/domain from page path
function getSiteFromPath(path?: string): { label: string; bg: string; text: string } {
  if (!path) return { label: 'Referral', bg: 'bg-gray-700/50', text: 'text-gray-300' };
  const p = path.toLowerCase();
  if (p.includes('/reader')) return { label: 'Reader', bg: 'bg-purple-900/40', text: 'text-purple-300' };
  if (p.includes('/author')) return { label: 'Author', bg: 'bg-cyan-900/40', text: 'text-cyan-300' };
  if (p.includes('/book')) return { label: 'Book Site', bg: 'bg-amber-900/40', text: 'text-amber-300' };
  if (p.includes('/publisher') || p.includes('/admin') || p.includes('/partner')) return { label: 'Publisher', bg: 'bg-gold/20', text: 'text-gold' };
  return { label: 'Home', bg: 'bg-gray-700/50', text: 'text-gray-300' };
}

// Get journey status (highest priority event type)
function getJourneyStatus(events: TrackingEvent[]): { label: string; bg: string; text: string; priority: number } {
  const statusMap: Record<string, { label: string; bg: string; text: string; priority: number }> = {
    SALE: { label: 'Sold', bg: 'bg-green-900/40', text: 'text-green-300', priority: 5 },
    CLICK_DIRECT: { label: 'Sold', bg: 'bg-green-900/40', text: 'text-green-300', priority: 5 },
    PENDING_SALE: { label: 'Pending Sale', bg: 'bg-yellow-900/40', text: 'text-yellow-300', priority: 4 },
    CLICK_AMAZON: { label: 'Amazon Click', bg: 'bg-orange-900/40', text: 'text-orange-300', priority: 3 },
    CLICK_BOOKBABY: { label: 'books.by Click', bg: 'bg-purple-900/40', text: 'text-purple-300', priority: 3 },
    PAGE_VIEW: { label: 'Browsing', bg: 'bg-blue-900/40', text: 'text-blue-300', priority: 1 },
  };
  
  let highest = { label: 'New', bg: 'bg-gray-700/50', text: 'text-gray-300', priority: 0 };
  for (const e of events) {
    const status = statusMap[e.type];
    if (status && status.priority > highest.priority) {
      highest = status;
    }
  }
  return highest;
}

interface ConsumerData {
  id: string; // IP address or unique identifier
  events: TrackingEvent[];
  latestEvent: TrackingEvent;
  cityState: string;
  country: string;
  visits: number;
  device: string;
  journeyStatus: { label: string; bg: string; text: string; priority: number };
  currentSite: { label: string; bg: string; text: string };
}

function ConsumerActivitySection({ events, partners }: { events: TrackingEvent[]; partners: Partner[] }) {
  const [expandedConsumer, setExpandedConsumer] = useState<string | null>(null);
  
  // Group events by IP address to create consumer profiles
  const consumers = useMemo(() => {
    const consumerMap = new Map<string, TrackingEvent[]>();
    
    for (const event of events) {
      const id = event.ipAddress || 'unknown';
      if (!consumerMap.has(id)) {
        consumerMap.set(id, []);
      }
      consumerMap.get(id)!.push(event);
    }
    
    // Convert to consumer data array
    const consumerList: ConsumerData[] = [];
    consumerMap.forEach((consumerEvents, id) => {
      // Sort events by date (newest first)
      const sorted = [...consumerEvents].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latest = sorted[0];
      
      // Build city/state string - show both if region is available
      const cityPart = latest.city || '';
      const regionPart = latest.region || '';
      const cityState = cityPart && regionPart 
        ? `${cityPart}, ${regionPart}` 
        : cityPart || regionPart || '—';
      
      consumerList.push({
        id,
        events: sorted,
        latestEvent: latest,
        cityState,
        country: latest.country || '—',
        visits: consumerEvents.length,
        device: latest.device || '—',
        journeyStatus: getJourneyStatus(consumerEvents),
        currentSite: getSiteFromPath(latest.pagePath),
      });
    });
    
    // Sort by most recent activity
    return consumerList.sort((a, b) => 
      new Date(b.latestEvent.createdAt).getTime() - new Date(a.latestEvent.createdAt).getTime()
    );
  }, [events]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatShortId = (id: string) => {
    if (id === 'unknown') return 'Unknown';
    // Show last 4 chars of IP for privacy
    return `...${id.slice(-4)}`;
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Consumer Journey</h2>
      <p className="text-gray-500 text-sm mb-4">
        Track customer journeys across your constellation. Click a row to see full activity history.
      </p>
      <div className="bg-[#111] rounded-xl border border-[#222] max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#333] text-gray-400 sticky top-0 bg-[#111] z-10">
            <tr>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">City/State</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Device</th>
            </tr>
          </thead>
          <tbody>
            {consumers.slice(0, 100).map((consumer) => (
              <React.Fragment key={consumer.id}>
                {/* Main consumer row */}
                <tr 
                  className={`border-t border-[#222] cursor-pointer transition-colors ${
                    expandedConsumer === consumer.id ? 'bg-[#1a1a1a]' : 'hover:bg-[#161616]'
                  }`}
                  onClick={() => setExpandedConsumer(
                    expandedConsumer === consumer.id ? null : consumer.id
                  )}
                >
                  <td className="px-4 py-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className={`transition-transform ${expandedConsumer === consumer.id ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      {formatTime(consumer.latestEvent.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${consumer.currentSite.bg} ${consumer.currentSite.text}`}>
                      {consumer.currentSite.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${consumer.journeyStatus.bg} ${consumer.journeyStatus.text}`}>
                      {consumer.journeyStatus.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{consumer.cityState}</td>
                  <td className="px-4 py-3 text-gray-300">{consumer.country}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-gold/10 text-gold text-xs font-medium">
                      {consumer.visits}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{consumer.device}</td>
                </tr>
                
                {/* Expanded activity details */}
                {expandedConsumer === consumer.id && (
                  <tr>
                    <td colSpan={7} className="bg-[#0a0a0a] border-t border-[#333]">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gold">
                            Full Activity History ({consumer.events.length} events)
                          </h4>
                          <span className="text-xs text-gray-500">
                            Consumer ID: {formatShortId(consumer.id)}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {consumer.events.map((event, idx) => {
                            const partner = partners.find(p => p.id === event.partnerId);
                            const site = getSiteFromPath(event.pagePath);
                            return (
                              <div 
                                key={event.id} 
                                className={`flex items-center gap-4 py-2 px-3 rounded ${
                                  idx === 0 ? 'bg-gold/5 border border-gold/20' : 'bg-[#111]'
                                }`}
                              >
                                <span className="text-xs text-gray-500 w-40">
                                  {formatTime(event.createdAt)}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${site.bg} ${site.text}`}>
                                  {site.label}
                                </span>
                                <EventBadge type={event.type} />
                                {partner && (
                                  <span className="text-xs text-gray-400">
                                    via {partner.name}
                                  </span>
                                )}
                                {idx === 0 && (
                                  <span className="text-xs text-gold ml-auto">← Most Recent</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {consumers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No consumer journey data yet. Traffic will appear here as visitors interact with your domains.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {consumers.length > 100 && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Showing 100 of {consumers.length} consumers
        </p>
      )}
    </section>
  );
}

// Email Deployment Controls for Partner Onboarding
function EmailDeploymentControls({ partner, onUpdate }: { partner: Partner; onUpdate: () => void }) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'deploying' | 'sent' | 'cancelled'>('pending');

  // Calculate countdown from scheduled time
  useEffect(() => {
    if (partner.onboardingEmailSentAt) {
      setStatus('sent');
      return;
    }
    
    if (partner.onboardingCancelled) {
      setStatus('cancelled');
      return;
    }
    
    if (!partner.onboardingScheduledAt) {
      setStatus('pending');
      return;
    }

    const scheduledTime = new Date(partner.onboardingScheduledAt).getTime();
    
    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((scheduledTime - now) / 1000));
      setCountdown(remaining);
      
      if (remaining <= 0 && status !== 'sent') {
        // Auto-deploy when countdown reaches 0
        handleInstantDeploy();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [partner.onboardingScheduledAt, partner.onboardingEmailSentAt, partner.onboardingCancelled]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInstantDeploy = async () => {
    setLoading(true);
    setStatus('deploying');
    try {
      const res = await fetch('/api/partners/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id, instant: true }),
      });
      
      if (res.ok) {
        setStatus('sent');
        onUpdate();
      } else {
        const data = await res.json();
        console.error('Deploy failed:', data);
        setStatus('pending');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      setStatus('pending');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners/send-welcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id, action: 'cancel' }),
      });
      
      if (res.ok) {
        setStatus('cancelled');
        setCountdown(null);
        onUpdate();
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
    setLoading(false);
  };

  const handleRedeploy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners/send-welcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id, action: 'reset' }),
      });
      
      if (res.ok) {
        setStatus('pending');
        onUpdate();
      }
    } catch (error) {
      console.error('Redeploy error:', error);
    }
    setLoading(false);
  };

  // Already sent
  if (status === 'sent' || partner.onboardingEmailSentAt) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400">✓ Sent</span>
        <span className="text-xs text-gray-500">
          {new Date(partner.onboardingEmailSentAt!).toLocaleDateString()}
        </span>
      </div>
    );
  }

  // Cancelled - show redeploy option
  if (status === 'cancelled') {
    return (
      <button
        onClick={handleRedeploy}
        disabled={loading}
        className="px-2 py-1 text-xs rounded bg-gold/20 text-gold hover:bg-gold/30 transition disabled:opacity-50"
      >
        {loading ? '...' : '↻ Redeploy'}
      </button>
    );
  }

  // Deploying
  if (status === 'deploying') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin text-gold" />
        <span className="text-xs text-gold">Sending...</span>
      </div>
    );
  }

  // Countdown active
  if (countdown !== null && countdown > 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
          {formatCountdown(countdown)}
        </span>
        <button
          onClick={handleInstantDeploy}
          disabled={loading}
          className="px-2 py-1 text-xs rounded bg-green-900/30 text-green-300 hover:bg-green-900/50 transition disabled:opacity-50"
          title="Send immediately"
        >
          ⚡ Deploy
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-2 py-1 text-xs rounded bg-red-900/30 text-red-300 hover:bg-red-900/50 transition disabled:opacity-50"
          title="Cancel deployment"
        >
          ✕
        </button>
      </div>
    );
  }

  // No deployment scheduled yet
  return (
    <button
      onClick={handleRedeploy}
      disabled={loading}
      className="px-2 py-1 text-xs rounded bg-gold/20 text-gold hover:bg-gold/30 transition disabled:opacity-50"
    >
      {loading ? '...' : '📧 Schedule'}
    </button>
  );
}

function CreatePartnerForm({ onCreated, onPartnerCreated }: { 
  onCreated: () => void; 
  onPartnerCreated?: (partner: any) => void; 
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [clickBounty, setClickBounty] = useState(0.10);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [kindleUrl, setKindleUrl] = useState('');
  const [bookBabyUrl, setBookBabyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [createdPartner, setCreatedPartner] = useState<any>(null);
  const [partnerType, setPartnerType] = useState<'REV_SHARE' | 'FLAT_FEE'>('REV_SHARE');
  const [country, setCountry] = useState('US');

  // Auto-generate slug and coupon code from name
  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
    if (name && !couponCode) {
      setCouponCode(name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '20');
    }
  }, [name]);

  // Auto-set commission and click bounty to 0 for flat fee partners
  useEffect(() => {
    if (partnerType === 'FLAT_FEE') {
      setCommissionPercent(0);
      setClickBounty(0);
    } else {
      setCommissionPercent(20);
      setClickBounty(0.10);
    }
  }, [partnerType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, email, slug, couponCode, 
        commissionPercent, clickBounty, discountPercent,
        amazonUrl: amazonUrl || undefined,
        kindleUrl: kindleUrl || undefined,
        bookBabyUrl: bookBabyUrl || undefined,
        partnerType,
        country,
      }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create partner');
      setLoading(false);
      return;
    }
    
    const partner = await res.json();
    setCreatedPartner(partner);
    setShowAccessCode(true);
    
    // Auto-schedule welcome email (5 minute countdown)
    try {
      await fetch('/api/partners/send-welcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id, action: 'schedule' }),
      });
    } catch (err) {
      console.error('Failed to schedule welcome email:', err);
    }
    
    if (onPartnerCreated) {
      onPartnerCreated(partner);
    }
    
    setName('');
    setEmail('');
    setSlug('');
    setCouponCode('');
    setCommissionPercent(20);
    setClickBounty(0.10);
    setDiscountPercent(20);
    setAmazonUrl('');
    setKindleUrl('');
    setBookBabyUrl('');
    setLoading(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-xl border border-[#222]">
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-900/30 border border-red-500 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          placeholder="Partner Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
          required
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
          required
        />
        <input
          placeholder="URL Slug * (e.g., jay)"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white font-mono"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          placeholder="Coupon Code * (e.g., JAY20)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white font-mono"
          required
        />
        <div>
          <label className="text-xs text-gray-500 block mb-1">Commission %</label>
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
            min={0}
            max={100}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Click Bounty $</label>
          <input
            type="number"
            step="0.01"
            value={clickBounty}
            onChange={(e) => setClickBounty(Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Discount %</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
            min={0}
            max={100}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Amazon Physical Book URL</label>
          <input
            placeholder="https://amazon.com/dp/..."
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Kindle Digital Book URL</label>
          <input
            placeholder="https://amazon.com/dp/B0..."
            value={kindleUrl}
            onChange={(e) => setKindleUrl(e.target.value)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
          />
        </div>
      </div>
      
      {/* Partner Type Selection */}
      <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#333] rounded">
        <label className="text-sm text-gray-400 block mb-2">Partner Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="partnerType"
              value="REV_SHARE"
              checked={partnerType === 'REV_SHARE'}
              onChange={(e) => setPartnerType('REV_SHARE')}
              className="accent-gold"
            />
            <span className="text-white">Revenue Share</span>
            <span className="text-xs text-gray-500">(Earns commission on sales)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="partnerType"
              value="FLAT_FEE"
              checked={partnerType === 'FLAT_FEE'}
              onChange={(e) => setPartnerType('FLAT_FEE')}
              className="accent-gold"
            />
            <span className="text-white">Flat Fee</span>
            <span className="text-xs text-gray-500">(Traffic stats only, no payouts)</span>
          </label>
        </div>
        {partnerType === 'FLAT_FEE' && (
          <p className="text-xs text-yellow-400 mt-2">
            ⚠️ This partner will only see traffic statistics. Commission tracking and payout features will be disabled.
          </p>
        )}
      </div>
      
      {/* Country Selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">Partner Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
        >
          <option value="US">🇺🇸 United States ($10 min, standard fees)</option>
          <option value="GB">🇬🇧 United Kingdom ($25 min, 0.5% intl fee)</option>
          <option value="NG">🇳🇬 Nigeria ($50 min, 1.5% intl fee)</option>
          <option value="CA">🇨🇦 Canada ($25 min, 0.8% intl fee)</option>
          <option value="DE">🇩🇪 Germany ($25 min, 0.8% intl fee)</option>
          <option value="FR">🇫🇷 France ($25 min, 0.8% intl fee)</option>
          <option value="AU">🇦🇺 Australia ($50 min, 1% intl fee)</option>
          <option value="IN">🇮🇳 India ($50 min, 1% intl fee)</option>
          <option value="PH">🇵🇭 Philippines ($50 min, 1% intl fee)</option>
          <option value="OTHER">🌍 Other International ($50 min, 1% intl fee)</option>
        </select>
        {country !== 'US' && (
          <p className="text-xs text-gray-500 mt-1">
            International partners require W-8BEN tax form and have higher withdrawal minimums.
          </p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="bg-gold hover:bg-gold/90 text-black px-6 py-2 rounded font-semibold disabled:opacity-50 transition"
      >
        {loading ? 'Creating…' : 'Create Partner'}
      </button>
    </form>
  );
}

// Access Code Modal
function AccessCodeModal({ partner, onClose }: { partner: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  
  function copyToClipboard() {
    navigator.clipboard.writeText(partner.accessCode || partner.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-gold mb-4">Partner Created Successfully!</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Partner Name</p>
            <p className="text-white font-medium">{partner.name}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-medium">{partner.email}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-2">Access Code (for portal login)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#1a1a1a] border border-gold/50 px-4 py-3 rounded text-gold font-mono text-xl tracking-widest text-center">
                {partner.accessCode || partner.couponCode}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-gold hover:bg-gold/90 text-black px-4 py-3 rounded transition font-semibold"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="bg-gold/10 border border-gold/30 rounded p-4">
            <p className="text-sm text-gray-300">
              <strong className="text-gold">Important:</strong> Share this access code with {partner.name}. 
              They will use it to log into their partner portal at <code className="text-gold">/partner/login</code>
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Traffic Breakdown Modal
function TrafficBreakdownModal({ events, partners, totalVisits, onClose }: {
  events: TrackingEvent[];
  partners: Partner[];
  totalVisits: number;
  onClose: () => void;
}) {
  // Helper function to determine which conceptual domain a path belongs to
  const getDomainForPath = (path: string): string => {
    if (!path) return 'thronelightpublishing.com';
    
    // Normalize path
    const normalizedPath = path.toLowerCase();
    
    // Path-based domain attribution
    if (normalizedPath.includes('/author')) return 'lightofeolles.com';
    if (normalizedPath.includes('/book')) return 'thecrowdedbedandtheemptythrone.com';
    if (normalizedPath.includes('/publisher')) return 'thronelightpublishing.com';
    
    // Default to main publishing site
    return 'thronelightpublishing.com';
  };
  
  // Calculate visits by conceptual domain (path-based attribution)
  const pageViewEvents = events.filter(e => e.type === 'PAGE_VIEW');
  
  const domainVisits = {
    'thronelightpublishing.com': 0,
    'lightofeolles.com': 0,
    'thecrowdedbedandtheemptythrone.com': 0,
  };
  
  // Count direct visits by their path-based domain
  pageViewEvents.filter(e => !e.partnerId).forEach(e => {
    const domain = getDomainForPath(e.pagePath || '');
    domainVisits[domain as keyof typeof domainVisits]++;
  });
  
  // Calculate partner visits
  const partnerVisits = partners.map(p => ({
    name: p.name,
    visits: pageViewEvents.filter(e => e.partnerId === p.id).length,
  })).filter(p => p.visits > 0).sort((a, b) => b.visits - a.visits);
  
  const totalDirectVisits = Object.values(domainVisits).reduce((sum, count) => sum + count, 0);
  const totalPartnerVisits = partnerVisits.reduce((sum, p) => sum + p.visits, 0);
  const actualTotalVisits = totalDirectVisits + totalPartnerVisits;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#111] border border-gold/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gold">Total Visits Breakdown</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-3xl font-bold text-gold text-center">{actualTotalVisits}</p>
          <p className="text-gray-400 text-center text-sm mt-1">Total Visits Across All Sources</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Direct Traffic by Domain</h4>
          
          {/* Domain-based direct visits */}
          {Object.entries(domainVisits).map(([domain, count]) => (
            count > 0 && (
              <div key={domain} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
                <div>
                  <p className="font-medium text-white">{domain}</p>
                  <p className="text-xs text-gray-500">Direct visits (no partner referral)</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gold">{count}</p>
                  <p className="text-xs text-gray-500">{actualTotalVisits > 0 ? ((count / actualTotalVisits) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            )
          ))}
          
          {totalDirectVisits === 0 && (
            <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
              <p className="text-gray-500 text-sm">No direct traffic recorded yet</p>
            </div>
          )}
          
          {/* Partner visits */}
          {partnerVisits.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Partner Referral Traffic</h4>
              {partnerVisits.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">Partner referral link</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-400">{p.visits}</p>
                    <p className="text-xs text-gray-500">{actualTotalVisits > 0 ? ((p.visits / actualTotalVisits) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {partnerVisits.length === 0 && totalDirectVisits === 0 && (
            <p className="text-center text-gray-500 py-4">No visits recorded yet</p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Revenue Breakdown Modal
function RevenueBreakdownModal({ orders, partners, totalRevenue, onClose }: {
  orders: Order[];
  partners: Partner[];
  totalRevenue: number;
  onClose: () => void;
}) {
  // Calculate revenue by source
  const partnerRevenue = partners.map(p => ({
    name: p.name,
    revenue: orders.filter(o => o.partnerId === p.id).reduce((sum, o) => sum + o.totalAmount, 0),
    count: orders.filter(o => o.partnerId === p.id).length,
  })).filter(p => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);
  
  const directRevenue = orders.filter(o => !o.partnerId).reduce((sum, o) => sum + o.totalAmount, 0);
  const directCount = orders.filter(o => !o.partnerId).length;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#111] border border-gold/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gold">Revenue Breakdown</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-3xl font-bold text-green-400 text-center">${totalRevenue.toFixed(2)}</p>
          <p className="text-gray-400 text-center text-sm mt-1">Gross Revenue (Verified via Stripe)</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">By Source</h4>
          
          {/* Direct sales */}
          <div className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div>
              <p className="font-medium text-white">Direct Sales</p>
              <p className="text-xs text-gray-500">From main book site (no partner referral)</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-400">${directRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{directCount} sale{directCount !== 1 ? 's' : ''} • {totalRevenue > 0 ? ((directRevenue / totalRevenue) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
          
          {/* Partner sales */}
          {partnerRevenue.map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
              <div>
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-xs text-gray-500">Partner referral sales</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-400">${p.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{p.count} sale{p.count !== 1 ? 's' : ''} • {totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-4">No sales recorded yet</p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Commission Breakdown Modal
function CommissionBreakdownModal({ orders, events, partners, totalCommission, onClose }: {
  orders: Order[];
  events: TrackingEvent[];
  partners: Partner[];
  totalCommission: number;
  onClose: () => void;
}) {
  // Calculate commission owed per partner
  const partnerCommissions = partners.map(p => {
    const pOrders = orders.filter(o => o.partnerId === p.id);
    const pCommission = pOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
    const pAmazonClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_AMAZON').length;
    const pBookBabyClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_BOOKBABY').length;
    const pClickBounty = (pAmazonClicks + pBookBabyClicks) * (p.clickBounty ?? 0);
    const totalOwed = pCommission + pClickBounty;
    
    return {
      name: p.name,
      commission: pCommission,
      clickBounty: pClickBounty,
      totalOwed,
      salesCount: pOrders.length,
    };
  }).filter(p => p.totalOwed > 0).sort((a, b) => b.totalOwed - a.totalOwed);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#111] border border-gold/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gold">Partner Commission Breakdown</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-3xl font-bold text-blue-400 text-center">${totalCommission.toFixed(2)}</p>
          <p className="text-gray-400 text-center text-sm mt-1">Total Commission Owed to All Partners</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">By Partner (Highest to Lowest)</h4>
          
          {partnerCommissions.map(p => (
            <div key={p.name} className="p-4 bg-[#1a1a1a] border border-[#222] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white text-lg">{p.name}</p>
                <p className="text-2xl font-bold text-gold">${p.totalOwed.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Sales Commission</p>
                  <p className="text-green-400 font-semibold">${p.commission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Click Bounty</p>
                  <p className="text-purple-400 font-semibold">${p.clickBounty.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sales Count</p>
                  <p className="text-blue-400 font-semibold">{p.salesCount}</p>
                </div>
              </div>
            </div>
          ))}
          
          {partnerCommissions.length === 0 && (
            <p className="text-center text-gray-500 py-4">No commissions owed yet</p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Retention Breakdown Modal - Shows average time spent on pages
function RetentionBreakdownModal({ events, onClose }: {
  events: TrackingEvent[];
  onClose: () => void;
}) {
  // Calculate session durations by grouping page views by IP
  const sessionsByIp = new Map<string, Date[]>();
  
  events.forEach(event => {
    if (event.type === 'PAGE_VIEW' && event.ipAddress) {
      if (!sessionsByIp.has(event.ipAddress)) {
        sessionsByIp.set(event.ipAddress, []);
      }
      sessionsByIp.get(event.ipAddress)!.push(new Date(event.createdAt));
    }
  });

  // Calculate session durations (difference between first and last event for each IP)
  const sessionDurations: number[] = [];
  sessionsByIp.forEach((timestamps) => {
    if (timestamps.length >= 1) {
      const sorted = timestamps.sort((a, b) => a.getTime() - b.getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const durationMs = last.getTime() - first.getTime();
      const durationSeconds = Math.floor(durationMs / 1000);
      sessionDurations.push(durationSeconds);
    }
  });

  // Categorize sessions by duration
  const categories = {
    under30s: sessionDurations.filter(d => d < 30).length,
    thirtySecTo2Min: sessionDurations.filter(d => d >= 30 && d < 120).length,
    twoTo5Min: sessionDurations.filter(d => d >= 120 && d < 300).length,
    fiveTo10Min: sessionDurations.filter(d => d >= 300 && d < 600).length,
    tenTo30Min: sessionDurations.filter(d => d >= 600 && d < 1800).length,
    thirtyMinTo1Hr: sessionDurations.filter(d => d >= 1800 && d < 3600).length,
    oneHrTo24Hr: sessionDurations.filter(d => d >= 3600 && d < 86400).length,
    overDay: sessionDurations.filter(d => d >= 86400).length,
  };

  const totalSessions = sessionDurations.length || 1;
  const avgDuration = sessionDurations.length > 0 
    ? Math.floor(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getPercentage = (count: number) => ((count / totalSessions) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-[#111] border border-gold/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gold">Retention Time Breakdown</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-3xl font-bold text-green-400 text-center">{formatDuration(avgDuration)}</p>
          <p className="text-gray-400 text-center text-sm mt-1">Average Time on Site</p>
          <p className="text-gray-500 text-center text-xs mt-1">{sessionDurations.length} total sessions analyzed</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Session Duration Distribution</h4>
          
          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-medium text-white">Under 30 seconds</p>
                  <p className="text-xs text-gray-500">Quick bounce</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-400">{categories.under30s}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.under30s)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">👀</span>
                <div>
                  <p className="font-medium text-white">30 seconds – 2 minutes</p>
                  <p className="text-xs text-gray-500">Brief browsing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-400">{categories.thirtySecTo2Min}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.thirtySecTo2Min)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📖</span>
                <div>
                  <p className="font-medium text-white">2 – 5 minutes</p>
                  <p className="text-xs text-gray-500">Engaged exploration</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-400">{categories.twoTo5Min}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.twoTo5Min)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="font-medium text-white">5 – 10 minutes</p>
                  <p className="text-xs text-gray-500">Serious interest</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-400">{categories.fiveTo10Min}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.fiveTo10Min)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="font-medium text-white">10 – 30 minutes</p>
                  <p className="text-xs text-gray-500">Deep engagement</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-400">{categories.tenTo30Min}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.tenTo30Min)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="font-medium text-white">30 minutes – 1 hour</p>
                  <p className="text-xs text-gray-500">Extended session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-400">{categories.thirtyMinTo1Hr}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.thirtyMinTo1Hr)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💎</span>
                <div>
                  <p className="font-medium text-white">1 – 24 hours</p>
                  <p className="text-xs text-gray-500">Power user / Tab kept open</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gold">{categories.oneHrTo24Hr}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.oneHrTo24Hr)}%</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] border border-[#222] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">👑</span>
                <div>
                  <p className="font-medium text-white">Days+</p>
                  <p className="text-xs text-gray-500">Persistent session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gold">{categories.overDay}</p>
                <p className="text-xs text-gray-500">{getPercentage(categories.overDay)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
