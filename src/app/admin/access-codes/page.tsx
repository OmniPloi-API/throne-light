'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  ChevronLeft, 
  Loader2, 
  RefreshCcw, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle,
  User,
  Mail,
  Ticket
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  slug: string;
  couponCode: string;
  accessCode: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AccessCodesAdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchPartners();
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router, mounted]);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/fix-partner-access-codes');
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      setPartners(data.partners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (partnerId?: string) => {
    if (partnerId) setActionLoading(partnerId);
    else setGlobalActionLoading(true);
    
    setError(null);
    try {
      const res = await fetch('/api/admin/fix-partner-access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerId ? { partnerId } : { forceRegenerate: false }),
      });
      
      if (!res.ok) throw new Error('Operation failed');
      
      await fetchPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
      setGlobalActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const missingCodes = partners.filter(p => !p.accessCode).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-2 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gold flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Access Code Management
            </h1>
            <p className="text-gray-500 mt-1">
              Verify and generate unique portal access codes for your partners.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchPartners}
              disabled={loading}
              className="p-2 bg-[#1a1a1a] border border-[#333] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
              title="Refresh List"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => generateCode()}
              disabled={globalActionLoading || loading || missingCodes === 0}
              className="px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {globalActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate Missing Codes
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
            <div className="text-gray-500 text-sm mb-1">Total Partners</div>
            <div className="text-3xl font-bold">{partners.length}</div>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
            <div className="text-gray-500 text-sm mb-1">Active Codes</div>
            <div className="text-3xl font-bold text-green-400">{partners.length - missingCodes}</div>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-red-900/30">
            <div className="text-gray-500 text-sm mb-1">Missing Codes</div>
            <div className="text-3xl font-bold text-red-400">{missingCodes}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg mb-8 flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Partners Table */}
        <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#222]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Partner Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        <p>Loading partner data...</p>
                      </div>
                    </td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No partners found in the system.
                    </td>
                  </tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-[#161616] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-gold transition-colors">{partner.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {partner.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-purple-400 font-mono">
                          <Ticket className="w-4 h-4" />
                          {partner.couponCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {partner.accessCode ? (
                          <div className="flex items-center gap-3">
                            <span className="font-mono bg-[#222] px-3 py-1 rounded text-gold border border-gold/20">
                              {partner.accessCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(partner.accessCode!, partner.id)}
                              className="text-gray-500 hover:text-white transition-colors p-1"
                              title="Copy Access Code"
                            >
                              {copiedId === partner.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-red-400 text-sm flex items-center gap-1 italic">
                            <AlertTriangle className="w-4 h-4" />
                            Missing Code
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => generateCode(partner.id)}
                          disabled={actionLoading === partner.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ml-auto ${
                            partner.accessCode 
                              ? 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] hover:text-white border border-[#333]' 
                              : 'bg-gold/20 text-gold hover:bg-gold/30 border border-gold/30'
                          }`}
                        >
                          {actionLoading === partner.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCcw className="w-3 h-3" />
                          )}
                          {partner.accessCode ? 'Reset Code' : 'Generate Code'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
