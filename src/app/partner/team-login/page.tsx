'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Users, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function TeamLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Request access states
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestPartnerName, setRequestPartnerName] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/partners/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessCode: accessCode.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid access code or email');
        setLoading(false);
        return;
      }

      // Store team member session
      localStorage.setItem('teamMemberSession', JSON.stringify({
        id: data.member.id,
        partnerId: data.member.partnerId,
        name: data.member.name,
        email: data.member.email,
        role: data.member.role,
        partnerName: data.partnerName,
      }));

      router.push('/partner/team-dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);

    try {
      const res = await fetch('/api/partners/team-access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestEmail.trim().toLowerCase(),
          name: requestName.trim(),
          partnerName: requestPartnerName.trim(),
          message: requestMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRequestError(data.error || 'Failed to submit request');
        setRequestLoading(false);
        return;
      }

      setRequestSuccess(true);
    } catch (err) {
      setRequestError('An error occurred. Please try again.');
    }
    setRequestLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-serif text-gold mb-2">Team Member Access</h1>
          <p className="text-gray-400 text-sm">
            Access your partner's dashboard with your team credentials
          </p>
        </div>

        {!showRequestAccess ? (
          <>
            {/* Login Form */}
            <form onSubmit={handleLogin} className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Access Code
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="TM-XXXXXXXX"
                    required
                    autoComplete="off"
                    className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono placeholder:text-gray-600 focus:border-gold/50 focus:outline-none tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !accessCode}
                className="w-full py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Access Dashboard'}
              </button>
            </form>

            {/* Request Access Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-2">
                Don't have an access code or forgot it?
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="text-gold hover:text-gold/80 text-sm underline underline-offset-4"
              >
                Request Access
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Request Access Form */}
            {requestSuccess ? (
              <div className="bg-[#111] border border-[#222] rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl text-white font-semibold mb-2">Request Submitted</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Your access request has been sent to the partner. They will review and respond to your request.
                </p>
                <button
                  onClick={() => {
                    setShowRequestAccess(false);
                    setRequestSuccess(false);
                    setRequestEmail('');
                    setRequestName('');
                    setRequestPartnerName('');
                    setRequestMessage('');
                  }}
                  className="text-gold hover:text-gold/80 text-sm underline underline-offset-4"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg text-white font-semibold">Request Access</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Submit a request to your partner for dashboard access
                  </p>
                </div>

                {requestError && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{requestError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Name"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Partner Name *</label>
                  <input
                    type="text"
                    value={requestPartnerName}
                    onChange={(e) => setRequestPartnerName(e.target.value)}
                    placeholder="Name of the partner you're joining"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Let the partner know why you need access..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requestLoading || !requestEmail || !requestName || !requestPartnerName}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestLoading ? 'Submitting...' : 'Submit Request'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRequestAccess(false)}
                  className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Back to Login
                </button>
              </form>
            )}
          </>
        )}

        {/* Partner Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">
            Are you a partner?{' '}
            <Link href="/partner/login" className="text-gold hover:text-gold/80 underline underline-offset-2">
              Partner Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
