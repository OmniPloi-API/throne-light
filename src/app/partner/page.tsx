'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingUp, BarChart3, Copy, Check, 
  ExternalLink, ShoppingCart, Eye, Calendar, Wallet,
  Link2, Download, Info
} from 'lucide-react';

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
  type: 'PAGE_VIEW' | 'CLICK_AMAZON' | 'CLICK_BOOKBABY' | 'CLICK_DIRECT';
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

export default function PartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  async function fetchAll() {
    try {
      const [pRes, eRes, oRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/events'),
        fetch('/api/orders'),
      ]);
      const [p, e, o] = await Promise.all([
        pRes.json(),
        eRes.ok ? eRes.json() : [],
        oRes.ok ? oRes.json() : [],
      ]);
      setPartners(Array.isArray(p) ? p : []);
      setEvents(Array.isArray(e) ? e : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000); // Refresh every 5s for "real-time" feel
    return () => clearInterval(interval);
  }, []);

  // Filter data for selected partner
  const myEvents = events.filter((e) => e.partnerId === selectedPartner?.id);
  const myOrders = orders.filter((o) => o.partnerId === selectedPartner?.id);
  
  // Calculate stats
  const pageViews = myEvents.filter((e) => e.type === 'PAGE_VIEW').length;
  const directSales = myOrders.filter((o) => o.status === 'COMPLETED').length;
  const amazonClicks = myEvents.filter((e) => e.type === 'CLICK_AMAZON').length;
  const bookBabyClicks = myEvents.filter((e) => e.type === 'CLICK_BOOKBABY').length;
  
  const totalCommission = myOrders.reduce((sum, o) => sum + o.commissionEarned, 0);
  const clickBountyEarned = (amazonClicks + bookBabyClicks) * (selectedPartner?.clickBounty || 0.10);
  const pendingPayout = totalCommission + clickBountyEarned;
  
  const conversionRate = pageViews > 0 
    ? ((directSales + amazonClicks + bookBabyClicks) / pageViews * 100) 
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Partner Portal</h1>
            <p className="text-gray-400 text-sm">Throne Light Publishing</p>
          </div>
          <select
            value={selectedPartner?.id || ''}
            onChange={(e) => {
              const p = partners.find((p) => p.id === e.target.value) || null;
              setSelectedPartner(p);
            }}
            className="bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-lg text-white"
          >
            <option value="">Select your profile</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {!selectedPartner ? (
        <div className="flex items-center justify-center h-[60vh] text-gray-500">
          <div className="text-center">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select your partner profile to view your dashboard</p>
          </div>
        </div>
      ) : (
        <main className="p-4 md:p-8">
          {/* Zone 1: The "Money" Header - Wallet */}
          <section className="mb-6 md:mb-10">
            <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-xl p-6 border border-gold/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Welcome back,</p>
                  <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                    <Wallet className="w-4 h-4" />
                    Pending Payout
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-gold">
                    ${pendingPayout.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                    <Calendar className="w-3 h-3" />
                    Next payout: End of month
                  </p>
                </div>
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
    CLICK_DIRECT: { bg: 'bg-green-900/30', text: 'text-green-300', label: '💰 Sale!' },
    CLICK_AMAZON: { bg: 'bg-orange-900/30', text: 'text-orange-300', label: '→ Amazon' },
    CLICK_BOOKBABY: { bg: 'bg-purple-900/30', text: 'text-purple-300', label: '→ BookBaby' },
  };
  const c = config[type] || { bg: 'bg-gray-900/30', text: 'text-gray-300', label: type };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
