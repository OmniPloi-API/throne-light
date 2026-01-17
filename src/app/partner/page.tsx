'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, DollarSign, TrendingUp, ExternalLink, 
  Eye, MousePointer, ShoppingCart, BarChart3, Copy, Check,
  ArrowUpRight, ArrowDownRight, Link2, Wallet, Calendar, Info, Download, Power, Loader2, Key
} from 'lucide-react';
import { useModal } from '@/components/shared/GlobalModal';

export default function PartnerPage() {
  return (
    <Suspense fallback={<PartnerLoading />}>
      <PartnerContent />
    </Suspense>
  );
}

function PartnerLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );
}

interface Partner {
  id: string;
  name: string;
  email: string;
  slug: string;
  couponCode: string;
  commissionPercent: number;
  clickBounty: number;
  discountPercent: number;
  createdAt: string;
}

interface TrackingEvent {
  id: string;
  partnerId: string;
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT' | 'PENDING_SALE' | 'SALE';
  device?: string;
  city?: string;
  createdAt: string;
}

interface Order {
  id: string;
  partnerId?: string;
  totalAmount: number;
  commissionEarned: number;
  status: string;
  createdAt: string;
}

function PartnerContent() {
  const searchParams = useSearchParams();
  const modal = useModal();
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Stripe Connect / Withdrawal state (must be at top with other hooks)
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showStripeOnboardingModal, setShowStripeOnboardingModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showMaturityTooltip, setShowMaturityTooltip] = useState(false);
  
  // Access code change state
  const [showChangeAccessCodeModal, setShowChangeAccessCodeModal] = useState(false);

  // SECURITY: Check authentication on mount - redirect to login if not authenticated
  useEffect(() => {
    const partnerIdFromUrl = searchParams.get('id');
    const partnerIdFromSession = sessionStorage.getItem('partnerId');
    const partnerId = partnerIdFromUrl || partnerIdFromSession;
    
    if (!partnerId) {
      // Not authenticated - redirect to login
      window.location.href = '/partner/login';
      return;
    }
    
    // Store in session for persistence
    sessionStorage.setItem('partnerId', partnerId);
    setAuthChecked(true);
  }, [searchParams]);

  // Fetch only the authenticated partner's data (not all partners)
  async function fetchPartnerData() {
    const partnerId = sessionStorage.getItem('partnerId');
    if (!partnerId) return;
    
    try {
      // Fetch only this partner's data - not all partners
      const [pRes, eRes, oRes] = await Promise.all([
        fetch(`/api/partners/${partnerId}`),
        fetch('/api/events'),
        fetch('/api/orders'),
      ]);
      
      const partnerData = pRes.ok ? await pRes.json() : null;
      const eventsData = eRes.ok ? await eRes.json() : [];
      const ordersData = oRes.ok ? await oRes.json() : [];
      
      if (partnerData && !partnerData.error) {
        setSelectedPartner(partnerData);
        // Filter events and orders for this partner only
        setEvents(Array.isArray(eventsData) ? eventsData.filter((e: any) => e.partnerId === partnerId) : []);
        setOrders(Array.isArray(ordersData) ? ordersData.filter((o: any) => o.partnerId === partnerId) : []);
      } else {
        // Invalid partner ID - clear session and redirect to login
        sessionStorage.removeItem('partnerId');
        sessionStorage.removeItem('partnerName');
        window.location.href = '/partner/login';
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authChecked) {
      fetchPartnerData();
      const interval = setInterval(fetchPartnerData, 5000); // Refresh every 5s for "real-time" feel
      return () => clearInterval(interval);
    }
  }, [authChecked]);

  // Filter data for selected partner
  const myEvents = events.filter((e) => e.partnerId === selectedPartner?.id);
  const myOrders = orders.filter((o) => o.partnerId === selectedPartner?.id);
  
  // Calculate stats
  const pageViews = myEvents.filter((e) => e.type === 'PAGE_VIEW').length;
  const directSales = myOrders.filter((o) => o.status === 'COMPLETED').length;
  const amazonClicks = myEvents.filter((e) => e.type === 'CLICK_AMAZON').length;
  const booksByClicks = myEvents.filter((e) => e.type === 'CLICK_BOOKBABY').length;
  const pendingSales = myEvents.filter((e) => e.type === 'PENDING_SALE').length;
  const actualSales = myEvents.filter((e) => e.type === 'SALE').length;
  
  // Commission maturity tracking (7-day rule)
  const now = new Date();
  const completedOrders = myOrders.filter((o: any) => o.status === 'COMPLETED' && o.refundStatus !== 'APPROVED');
  
  // Calculate maturity for each order (8 days after creation)
  const maturedOrders = completedOrders.filter((o: any) => {
    const createdAt = new Date(o.createdAt);
    const maturityDate = new Date(createdAt.getTime() + 8 * 24 * 60 * 60 * 1000);
    return now >= maturityDate;
  });
  const pendingOrders = completedOrders.filter((o: any) => {
    const createdAt = new Date(o.createdAt);
    const maturityDate = new Date(createdAt.getTime() + 8 * 24 * 60 * 60 * 1000);
    return now < maturityDate;
  });
  
  const totalCommission = completedOrders.reduce((sum: number, o: any) => sum + o.commissionEarned, 0);
  const maturedCommission = maturedOrders.reduce((sum: number, o: any) => sum + o.commissionEarned, 0);
  const lockedCommission = pendingOrders.reduce((sum: number, o: any) => sum + o.commissionEarned, 0);
  
  // Use nullish coalescing (??) so that 0 is respected as a valid value (flat fee partners)
const clickBountyEarned = (amazonClicks + booksByClicks) * (selectedPartner?.clickBounty ?? 0);
  
  // Live Commissions = Total gross earnings
  const liveCommissionsEarned = totalCommission + clickBountyEarned;
  // Available = Matured + Click Bounty (click bounties are instant)
  const availableForWithdrawal = maturedCommission + clickBountyEarned;
  // Locked = Still in 7-day window
  const lockedFunds = lockedCommission;
  
  // Check Stripe Connect status when partner is selected
  useEffect(() => {
    if (selectedPartner) {
      fetch(`/api/partners/stripe-connect?partnerId=${selectedPartner.id}`)
        .then(res => res.json())
        .then(data => setStripeStatus(data))
        .catch(err => console.error('Failed to check Stripe status:', err));
    }
  }, [selectedPartner]);
  
  // Handle withdrawal request
  const handleWithdrawal = async () => {
    if (!withdrawAmount || !selectedPartner) return;
    
    setWithdrawLoading(true);
    setWithdrawError('');
    
    try {
      const res = await fetch('/api/partners/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartner.id,
          amount: parseFloat(withdrawAmount),
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        // Refresh data
        window.location.reload();
      } else {
        setWithdrawError(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      setWithdrawError('Network error. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };
  
  // Start Stripe Connect onboarding
  const startStripeOnboarding = async () => {
    if (!selectedPartner) return;
    
    try {
      const res = await fetch('/api/partners/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartner.id,
          returnUrl: `${window.location.origin}/partner?stripe_success=true`,
          refreshUrl: `${window.location.origin}/partner?stripe_refresh=true`,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        window.location.href = data.onboardingUrl;
      } else {
        modal.showError(data.error || 'Failed to start onboarding', 'Onboarding Error');
      }
    } catch (error) {
      modal.showError('Network error. Please try again.', 'Connection Error');
    }
  };
  
  // Legacy field
  const pendingPayout = liveCommissionsEarned;
  
  // Upcoming maturity schedule
  const upcomingMaturity = pendingOrders.map((o: any) => {
    const createdAt = new Date(o.createdAt);
    const maturityDate = new Date(createdAt.getTime() + 16 * 24 * 60 * 60 * 1000);
    return {
      date: maturityDate.toISOString(),
      amount: o.commissionEarned,
      orderId: o.id,
    };
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const conversionRate = pageViews > 0 
    ? ((actualSales + amazonClicks + booksByClicks) / pageViews * 100) 
    : 0;

  function copyLink() {
    if (!selectedPartner) return;
    navigator.clipboard.writeText(`${window.location.origin}/partners/${selectedPartner.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function copyCode() {
    if (!selectedPartner) return;
    navigator.clipboard.writeText(selectedPartner.couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function logout() {
    sessionStorage.removeItem('partnerId');
    sessionStorage.removeItem('partnerName');
    setSelectedPartner(null);
    window.location.href = '/partner/login';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile-First Header */}
      <header className="border-b border-[#222] px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gold">Partner Portal</h1>
            <p className="text-gray-400 text-sm">Throne Light Publishing</p>
            {selectedPartner && (
              <span className="text-gray-300 text-sm mt-1">Welcome, {selectedPartner.name}</span>
            )}
          </div>
          {/* Logout button - always show since auth is required */}
          <button
            onClick={logout}
            className="text-gold hover:text-red-400 transition ml-4 p-2 rounded-lg hover:bg-red-400/10"
            title="Logout"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </header>

      {!selectedPartner ? (
        <div className="flex items-center justify-center h-[60vh] text-gray-500">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-gold" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <main className="p-4 md:p-8">
          {/* Zone 1: The "Money" Header - Wallet */}
          <section className="mb-6 md:mb-10">
            <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-xl p-6 border border-gold/30">
              {/* Partner Name and Status */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
                  <span className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
                    Active Partner
                  </span>
                </div>
                
                {/* Available for Withdrawal */}
                <div className="text-center md:text-right">
                  <p className="text-green-400 text-sm flex items-center gap-1 justify-center md:justify-end">
                    <Wallet className="w-4 h-4" />
                    Available for Withdrawal
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-green-400">
                    ${availableForWithdrawal.toFixed(2)}
                  </p>
                  <button 
                    className="text-xs text-gold hover:text-gold/80 mt-1 transition"
                    onClick={() => {
                      // Check if Stripe Connect is set up
                      if (!stripeStatus?.connected) {
                        // Show custom onboarding modal
                        setShowStripeOnboardingModal(true);
                      } else if (!stripeStatus?.taxFormVerified) {
                        modal.showInfo('Please complete your tax form (W-9 or W-8BEN) in the Stripe portal to receive withdrawals.', 'Tax Form Required');
                      } else if (!stripeStatus?.onboardingComplete) {
                        setShowStripeOnboardingModal(true);
                      } else {
                        // Show withdrawal modal
                        setShowWithdrawModal(true);
                      }
                    }}
                  >
                    Request Withdrawal →
                  </button>
                </div>
              </div>
              
              {/* Live Commissions Earned - Centered */}
              <div className="text-center relative flex items-center justify-center min-h-[120px]">
                {/* Left line segment */}
                <div className="absolute left-0 top-1/2 h-px bg-gold/20" style={{ width: 'calc(50% - 100px)' }}></div>
                
                {/* Center content */}
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Live Commissions Earned
                  </p>
                  
                  <div className="bg-gradient-to-r from-gold/20 to-gold/5 px-6 py-3 rounded-xl border border-gold/30">
                    <p className="text-3xl md:text-4xl font-bold text-gold">
                      ${liveCommissionsEarned.toFixed(2)}
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">Total gross earnings</p>
                </div>
                
                {/* Right line segment */}
                <div className="absolute right-0 top-1/2 h-px bg-gold/20" style={{ width: 'calc(50% - 100px)' }}></div>
              </div>
            </div>
          </section>

          {/* Marketing Assets - Mobile Priority */}
          <section className="mb-6 md:mb-10 md:hidden">
            <h3 className="text-lg font-semibold mb-3">Your Smart Links</h3>
            <div className="space-y-3">
              <button
                onClick={copyLink}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copiedLink ? 'Link Copied!' : 'Copy Your Link'}
              </button>
              <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
                <p className="text-xs text-gray-500 mb-1">Your Smart Link</p>
                <p className="font-mono text-sm text-gold truncate">
                  {window.location.origin}/partners/{selectedPartner.slug}
                </p>
              </div>
            </div>
          </section>

          {/* Zone 2: Performance Grid */}
          <section className="mb-6 md:mb-10">
            <h3 className="text-lg font-semibold mb-3">Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard 
                icon={<Eye className="w-5 h-5" />} 
                label="Total Visitors" 
                value={pageViews}
                sublabel="Clicked your link"
              />
              <StatCard 
                icon={<ShoppingCart className="w-5 h-5 text-green-400" />} 
                label="Direct Sales" 
                value={directSales}
                sublabel={`You earn $${totalCommission.toFixed(2)}`}
                color="green"
              />
              <StatCard 
                icon={<ExternalLink className="w-5 h-5 text-orange-400" />} 
                label="Amazon Clicks" 
                value={amazonClicks}
                sublabel={`You earn $${(amazonClicks * selectedPartner.clickBounty).toFixed(2)}`}
                color="orange"
              />
              <StatCard 
                icon={<BarChart3 className="w-5 h-5 text-blue-400" />} 
                label="Conv. Rate" 
                value={`${conversionRate.toFixed(1)}%`}
                sublabel="Action taken"
                color="blue"
              />
            </div>
          </section>

          {/* Two Column Layout on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Live Traffic Feed - 60% */}
            <section className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Live Traffic Monitor</h3>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-[#333] text-gray-400 sticky top-0 bg-[#111]">
                      <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">Device</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myEvents.slice().reverse().slice(0, 20).map((e) => (
                        <tr key={e.id} className="border-t border-[#222]">
                          <td className="px-4 py-2 text-gray-400 text-xs">
                            {new Date(e.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2 text-gray-300">
                            {e.device || 'Unknown'}
                          </td>
                          <td className="px-4 py-2">
                            <EventBadge type={e.type} />
                          </td>
                        </tr>
                      ))}
                      {myEvents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            No activity yet. Share your link to start tracking!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Transparency Note */}
              <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  We track clicks sent to Amazon, but final Amazon sales data is 
                  delayed/owned by Amazon. You earn ${selectedPartner.clickBounty.toFixed(2)} per 
                  click to external retailers.
                </p>
              </div>
            </section>

            {/* Marketing Assets - 40% (Desktop) */}
            <section className="lg:col-span-2 hidden md:block">
              <h3 className="text-lg font-semibold mb-3">Marketing Assets</h3>
              <div className="bg-[#111] rounded-xl border border-[#222] p-5 space-y-4">
                {/* Smart Link */}
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Your Smart Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/partners/${selectedPartner.slug}`}
                      className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm font-mono text-gold"
                    />
                    <button
                      onClick={copyLink}
                      className="bg-gold hover:bg-gold/90 text-black px-4 py-2 rounded font-semibold text-sm transition flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Coupon Code */}
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Your Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={selectedPartner.couponCode}
                      className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm font-mono text-gold"
                    />
                    <button
                      onClick={copyCode}
                      className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded font-semibold text-sm transition flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Commission Info */}
                <div className="pt-4 border-t border-[#222]">
                  <h4 className="text-sm font-semibold mb-2">Your Rates</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#1a1a1a] rounded p-3">
                      <p className="text-gray-500 text-xs">Direct Sale</p>
                      <p className="text-green-400 font-semibold">{selectedPartner.commissionPercent}% commission</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded p-3">
                      <p className="text-gray-500 text-xs">External Click</p>
                      <p className="text-orange-400 font-semibold">${selectedPartner.clickBounty.toFixed(2)} per click</p>
                    </div>
                  </div>
                </div>
                
                {/* Download Assets */}
                <button className="w-full bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Book Cover Assets
                </button>
                
                {/* Change Access Code */}
                <button 
                  onClick={() => setShowChangeAccessCodeModal(true)}
                  className="w-full bg-[#1a1a1a] hover:bg-[#222] text-gray-300 py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 border border-[#333]"
                >
                  <Key className="w-4 h-4" />
                  Change Access Code
                </button>
              </div>
            </section>
          </div>

          {/* Metrics Table - Mobile Friendly */}
          <section className="mt-6 md:mt-10">
            <h3 className="text-lg font-semibold mb-3">Detailed Metrics</h3>
            <div className="bg-[#111] rounded-xl border border-[#222] overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#333] text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Metric</th>
                    <th className="px-4 py-3 text-right">Count</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#222]">
                    <td className="px-4 py-3">Total Visitors</td>
                    <td className="px-4 py-3 text-right font-semibold">{pageViews}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">People who clicked your link</td>
                  </tr>
                  <tr className="border-t border-[#222]">
                    <td className="px-4 py-3 text-green-400">Direct Sales</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-400">{directSales}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">Bought on ThroneLight (You earn $$)</td>
                  </tr>
                  <tr className="border-t border-[#222]">
                    <td className="px-4 py-3 text-orange-400">Amazon Clicks</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-400">{amazonClicks}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">Clicked to Amazon (You earn click bounty)</td>
                  </tr>
                  <tr className="border-t border-[#222]">
                    <td className="px-4 py-3">Conversion Rate</td>
                    <td className="px-4 py-3 text-right font-semibold">{conversionRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">Percentage who took action</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}
      
      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          setWithdrawError('');
        }}
        availableAmount={availableForWithdrawal}
        onWithdraw={handleWithdrawal}
      />
      
      {/* Stripe Connect Onboarding Modal */}
      <StripeOnboardingModal
        isOpen={showStripeOnboardingModal}
        onClose={() => setShowStripeOnboardingModal(false)}
        onConfirm={startStripeOnboarding}
      />
      
      {/* Change Access Code Modal */}
      <ChangeAccessCodeModal
        isOpen={showChangeAccessCodeModal}
        onClose={() => setShowChangeAccessCodeModal(false)}
        partnerId={selectedPartner?.id || ''}
        onSuccess={() => {
          setShowChangeAccessCodeModal(false);
          modal.showSuccess('Your access code has been changed. A new code has been sent to your email.', 'Access Code Changed');
        }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color = 'gold' }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    gold: 'text-gold',
    green: 'text-green-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
      <div className="flex items-center gap-2 mb-2">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PAGE_VIEW: { bg: 'bg-blue-900/30', text: 'text-blue-300', label: 'Visited' },
    PENDING_SALE: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', label: '⏳ Pending Sale' },
    CLICK_DIRECT: { bg: 'bg-green-900/30', text: 'text-green-300', label: '💰 Sale!' },
    CLICK_AMAZON: { bg: 'bg-orange-900/30', text: 'text-orange-300', label: '→ Amazon' },
    CLICK_BOOKBABY: { bg: 'bg-purple-900/30', text: 'text-purple-300', label: '→ books.by' },
  };
  const c = config[type] || { bg: 'bg-gray-900/30', text: 'text-gray-300', label: type };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// Withdrawal Modal
function WithdrawalModal({ 
  isOpen, 
  onClose, 
  availableAmount, 
  onWithdraw 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  availableAmount: number; 
  onWithdraw: (amount: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount < 10) {
      setError('Minimum withdrawal is $10.00');
      return;
    }
    if (numAmount > availableAmount) {
      setError(`Maximum withdrawal is $${availableAmount.toFixed(2)}`);
      return;
    }
    
    setLoading(true);
    setError('');
    await onWithdraw(amount);
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-gold mb-4">Request Withdrawal</h3>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-green-400">${availableAmount.toFixed(2)}</p>
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">Withdrawal Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="10"
            max={availableAmount}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
        
        <div className="mb-4 p-3 bg-[#1a1a1a] rounded text-xs text-gray-400">
          <p className="font-semibold text-yellow-400 mb-1">Fee Breakdown:</p>
          <p>• Payout Fee: $0.25</p>
          <p>• Monthly Fee: $2.00 (if first payout this month)</p>
          <p>• International Fee: 1% (if applicable)</p>
          <p className="mt-2 text-green-400">You'll receive the net amount after fees.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !amount}
            className="flex-1 bg-gold hover:bg-gold/90 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Stripe Connect Onboarding Modal
function StripeOnboardingModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSetupNow = async () => {
    setIsLoading(true);
    await onConfirm();
    // Note: If successful, user will be redirected. 
    // If error, the modal will close and error modal will show.
    setIsLoading(false);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gold/30 rounded-xl p-8 max-w-md w-full shadow-2xl">
        {isLoading ? (
          // Loading state
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-pulse">
              <Wallet className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-xl font-bold text-gold mb-3">Connecting to Stripe...</h3>
            <p className="text-gray-400 text-sm">You'll be redirected to complete setup</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-gold" />
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gold mb-3 text-center">Set Up Payouts</h3>
            
            {/* Description */}
            <p className="text-gray-300 text-center mb-6 leading-relaxed">
              To receive withdrawals, you need to set up a Stripe Connect account. 
              This allows <span className="text-gold font-semibold">secure direct deposits</span> to your bank account.
            </p>
            
            {/* Features */}
            <div className="bg-[#111] rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">Bank-level security & encryption</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">Fast direct deposits (2-3 business days)</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">Automated tax form handling (W-9/W-8BEN)</p>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSetupNow}
                className="flex-1 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-lg font-semibold transition shadow-lg shadow-gold/20 hover:shadow-gold/30"
              >
                Set Up Now
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 px-6 py-3 rounded-lg font-semibold transition border border-[#333]"
              >
                Maybe Later
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Takes about 2 minutes to complete
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Change Access Code Modal
function ChangeAccessCodeModal({ 
  isOpen, 
  onClose, 
  partnerId,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  partnerId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleChangeCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/partners/change-access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to change access code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gold/30 rounded-xl p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
          <Key className="w-8 h-8 text-gold" />
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-gold mb-3 text-center">Change Access Code</h3>
        
        {/* Description */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          Generate a new access code for your partner portal. Your current code will be invalidated and a new one will be sent to your email.
        </p>
        
        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ This action cannot be undone. Make sure to save your new code.
          </p>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleChangeCode}
            disabled={loading}
            className="flex-1 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-lg font-semibold transition shadow-lg shadow-gold/20 hover:shadow-gold/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate New Code'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 px-6 py-3 rounded-lg font-semibold transition border border-[#333] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
