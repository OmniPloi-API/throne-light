'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, LogIn, Mail, Send } from 'lucide-react';

export default function PartnerLogin() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partners/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.toUpperCase() }),
      });

      if (response.ok) {
        const { partner } = await response.json();
        // Store partner info in session
        sessionStorage.setItem('partnerId', partner.id);
        sessionStorage.setItem('partnerName', partner.name);
        // Redirect directly to their profile
        router.push(`/partner?id=${partner.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid access code');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partners/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail }),
      });

      if (response.ok) {
        setRequestSent(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send access code');
      }
    } catch (err) {
      setError('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">Partner Portal</h1>
          <p className="text-gray-400">Throne Light Publishing</p>
          <p className="text-gray-500 text-sm mt-2">Access your partner dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-8">
          {!showRequestAccess ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="px-4 py-3 bg-red-900/30 border border-red-500 rounded text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition font-mono tracking-widest text-center text-lg"
                      placeholder="XXXX-XXXX-XXXX"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    Enter your unique partner access code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !accessCode.trim()}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Access Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#222] text-center">
                <button
                  onClick={() => setShowRequestAccess(true)}
                  className="text-gold hover:text-gold/80 text-sm transition"
                >
                  Don't have your access code? Request it here
                </button>
              </div>
            </>
          ) : (
            <>
              {requestSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Access Code Sent!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    If your email is registered as a partner, you'll receive your access code shortly.
                  </p>
                  <button
                    onClick={() => {
                      setShowRequestAccess(false);
                      setRequestSent(false);
                      setRequestEmail('');
                    }}
                    className="text-gold hover:text-gold/80 text-sm transition"
                  >
                    ← Back to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestAccess} className="space-y-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Request Access Code</h3>
                    <p className="text-gray-400 text-sm">
                      Enter your email and we'll send your access code if you're a registered partner.
                    </p>
                  </div>

                  {error && (
                    <div className="px-4 py-3 bg-red-900/30 border border-red-500 rounded text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition"
                        placeholder="partner@example.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !requestEmail.trim()}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Access Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestAccess(false);
                      setError('');
                    }}
                    className="w-full text-gray-400 hover:text-white text-sm transition"
                  >
                    ← Back to login
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Team Member Access */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mt-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-2">Are you a team member?</p>
            <Link 
              href="/partner/team-login"
              className="text-blue-400 hover:text-blue-300 text-sm transition inline-flex items-center gap-1"
            >
              Team Member Access →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-gold hover:text-gold/80 text-sm transition inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
