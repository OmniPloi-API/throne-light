'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, DollarSign, TrendingUp, ExternalLink, 
  Eye, MousePointer, ShoppingCart, BarChart3, Copy, Check,
  ArrowUpRight, ArrowDownRight, Link2
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  slug: string;
  couponCode: string;
  amazonUrl?: string;
  bookBabyUrl?: string;
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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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

  // Calculate totals from local data if stats API fails
  const totalVisits = stats?.totalVisits ?? events.filter(e => e.type === 'PAGE_VIEW').length;
  const amazonClicks = stats?.totalAmazonClicks ?? events.filter(e => e.type === 'CLICK_AMAZON').length;
  const directClicks = stats?.totalDirectClicks ?? events.filter(e => e.type === 'CLICK_DIRECT').length;
  const totalRevenue = stats?.totalDirectRevenue ?? orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCommission = stats?.totalCommissionOwed ?? orders.reduce((s, o) => s + o.commissionEarned, 0);
  const retentionRate = totalVisits > 0 ? (directClicks / totalVisits * 100) : 0;
  const bounceRate = totalVisits > 0 ? (amazonClicks / totalVisits * 100) : 0;

  // Calculate click bounty owed
  const totalClickBounty = partners.reduce((sum, p) => {
    const partnerAmazonClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_AMAZON').length;
    const partnerBookBabyClicks = events.filter(e => e.partnerId === p.id && e.type === 'CLICK_BOOKBABY').length;
    return sum + ((partnerAmazonClicks + partnerBookBabyClicks) * p.clickBounty);
  }, 0);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Command Center</h1>
            <p className="text-gray-400 text-sm mt-1">Throne Light Publishing – Hybrid Tracking Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/partner" className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition">
              Partner View →
            </Link>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Traffic Source Analysis - Split Testing View */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold" />
            Traffic Source Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard icon={<Eye />} label="Total Visits" value={totalVisits} />
            <StatCard 
              icon={<ArrowUpRight className="text-green-400" />} 
              label="Retention Rate" 
              value={`${retentionRate.toFixed(1)}%`}
              sublabel="Stayed on site"
              color="green"
            />
            <StatCard 
              icon={<ArrowDownRight className="text-orange-400" />} 
              label="Bounce to Retail" 
              value={`${bounceRate.toFixed(1)}%`}
              sublabel="Clicked Amazon/BookBaby"
              color="orange"
            />
            <StatCard icon={<ShoppingCart />} label="Direct Sales" value={orders.length} color="green" />
            <StatCard icon={<ExternalLink />} label="Amazon Clicks" value={amazonClicks} color="gray" />
          </div>
        </section>

        {/* Revenue Reconciliation */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold" />
            Revenue Reconciliation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<DollarSign className="text-green-400" />} 
              label="Direct Revenue" 
              value={`$${totalRevenue.toFixed(2)}`}
              sublabel="Verified via Stripe"
              color="green"
            />
            <StatCard 
              icon={<TrendingUp className="text-blue-400" />} 
              label="Commission Owed" 
              value={`$${totalCommission.toFixed(2)}`}
              sublabel="Partner commission"
              color="blue"
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
              label="Est. External Revenue" 
              value={`$${(amazonClicks * 15.99 * 0.3).toFixed(2)}`}
              sublabel="30% est. conversion"
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
          <CreatePartnerForm onCreated={fetchAll} />
        </section>

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
                  <th className="px-4 py-3">Click Bounty</th>
                  <th className="px-4 py-3">Total Owed</th>
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
                      <td className="px-4 py-3">${p.clickBounty.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold text-gold">
                        ${(pCommission + pClickBounty).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No partners yet. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-[#111] rounded-xl border border-[#222] max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#333] text-gray-400 sticky top-0 bg-[#111]">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Device</th>
                </tr>
              </thead>
              <tbody>
                {events.slice().reverse().slice(0, 50).map((e) => {
                  const partner = partners.find(p => p.id === e.partnerId);
                  return (
                    <tr key={e.id} className="border-t border-[#222]">
                      <td className="px-4 py-2 text-gray-400">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{partner?.name ?? '—'}</td>
                      <td className="px-4 py-2">
                        <EventBadge type={e.type} />
                      </td>
                      <td className="px-4 py-2 text-gray-400">{e.device ?? '—'}</td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No events yet. Share partner links to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
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
    purple: 'text-purple-400',
    gray: 'text-gray-400',
  };
  return (
    <div className="bg-[#111] p-5 rounded-xl border border-[#222]">
      <div className="flex items-center justify-between mb-2">
        <span className={`w-5 h-5 ${colorClasses[color]}`}>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PAGE_VIEW: { bg: 'bg-blue-900/30', text: 'text-blue-300', label: 'Page View' },
    CLICK_DIRECT: { bg: 'bg-green-900/30', text: 'text-green-300', label: 'Buy Direct' },
    CLICK_AMAZON: { bg: 'bg-orange-900/30', text: 'text-orange-300', label: 'Amazon Click' },
    CLICK_BOOKBABY: { bg: 'bg-purple-900/30', text: 'text-purple-300', label: 'BookBaby Click' },
  };
  const c = config[type] || { bg: 'bg-gray-900/30', text: 'text-gray-300', label: type };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function CreatePartnerForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [clickBounty, setClickBounty] = useState(0.10);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug and coupon code from name
  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
    if (name && !couponCode) {
      setCouponCode(name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '20');
    }
  }, [name]);

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
      }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create partner');
      setLoading(false);
      return;
    }
    
    setName('');
    setEmail('');
    setSlug('');
    setCouponCode('');
    setCommissionPercent(20);
    setClickBounty(0.10);
    setDiscountPercent(20);
    setAmazonUrl('');
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
      <div className="mb-4">
        <input
          placeholder="Amazon Product URL (optional)"
          value={amazonUrl}
          onChange={(e) => setAmazonUrl(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white"
        />
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
