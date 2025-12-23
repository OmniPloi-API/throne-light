'use client';

import { useEffect, useState } from 'react';
import { Ticket, DollarSign, TrendingUp, BarChart3, Play } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  partnerId: string;
  discountPercent?: number;
  commissionPercent?: number;
  createdAt: string;
  usageCount: number;
  clicks: number;
}

interface Partner {
  id: string;
  name: string;
  email: string;
  defaultCommissionPercent: number;
  createdAt: string;
}

interface Sale {
  id: string;
  couponCode: string;
  partnerId: string;
  amount: number;
  currency: string;
  commission: number;
  commissionRate: number;
  platform: string;
  createdAt: string;
}

export default function SimulatePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    const [pRes, cRes, sRes] = await Promise.all([
      fetch('/api/partners'),
      fetch('/api/coupons'),
      fetch('/api/sales'),
    ]);
    const [p, c, s] = await Promise.all([pRes.json(), cRes.json(), sRes.json()]);
    setPartners(p);
    setCoupons(c);
    setSales(s);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function simulateSale(couponCode: string) {
    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode }),
    });
    fetchAll();
  }

  if (loading) return <div className="p-8 text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Simulate Sales</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
          <div className="flex items-center justify-between mb-2">
            <Ticket className="w-6 h-6 text-gold" />
            <span className="text-xs text-gray-400">Coupons</span>
          </div>
          <div className="text-2xl font-bold">{coupons.length}</div>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-gold" />
            <span className="text-xs text-gray-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">
            ${sales.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-gold" />
            <span className="text-xs text-gray-400">Total Commission</span>
          </div>
          <div className="text-2xl font-bold">
            ${sales.reduce((sum, s) => sum + s.commission, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Coupons</h2>
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#333]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Discount %</th>
                <th className="px-4 py-3">Commission %</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-[#333]">
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3">
                    {partners.find((p) => p.id === c.partnerId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">{c.discountPercent ?? '—'}</td>
                  <td className="px-4 py-3">{c.commissionPercent ?? '—'}</td>
                  <td className="px-4 py-3">{c.clicks}</td>
                  <td className="px-4 py-3">{c.usageCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => simulateSale(c.code)}
                      className="bg-gold text-black px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Simulate Sale
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sales Log</h2>
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#333] sticky top-0 bg-[#1a1a1a]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Coupon</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Platform</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice().reverse().map((s) => (
                <tr key={s.id} className="border-t border-[#333]">
                  <td className="px-4 py-3">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{s.couponCode}</td>
                  <td className="px-4 py-3">
                    {partners.find((p) => p.id === s.partnerId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">${s.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">${s.commission.toFixed(2)}</td>
                  <td className="px-4 py-3">{s.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
