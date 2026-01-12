'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Key, AlertCircle, Mail, Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

// Wrap the main content in a separate component to use with Suspense
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [deviceLimitError, setDeviceLimitError] = useState<{
    message: string;
    upsell?: { price: number; checkoutUrl: string };
  } | null>(null);

  // Check for code in URL (magic link)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setAccessCode(code);
      // Auto-submit if code is provided via magic link
      handleCodeSubmit(code);
    }
  }, [searchParams]);

  // Format access code as user types (XXXX-XXXX-XXXX-XXXX)
  function formatCode(value: string) {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join('-').slice(0, 19); // Max: XXXX-XXXX-XXXX-XXXX
  }

  async function handleCodeSubmit(code?: string) {
    const codeToSubmit = code || accessCode;
    if (!codeToSubmit || codeToSubmit.replace(/-/g, '').length < 16) {
      setError('Please enter your complete access code');
      return;
    }

    setLoading(true);
    setError('');
    setDeviceLimitError(null);

    try {
      // Read existing device fingerprint from cookie (if available)
      const existingFingerprint = document.cookie
        .split('; ')
        .find(row => row.startsWith('device_fingerprint='))
        ?.split('=')[1];

      const res = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: codeToSubmit,
          deviceType: 'web',
          deviceFingerprint: existingFingerprint || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorCode === 'DEVICE_LIMIT_EXCEEDED' && data.upsell) {
          setDeviceLimitError({
            message: data.message,
            upsell: data.upsell,
          });
        } else {
          setError(data.error || 'Invalid access code');
        }
        setLoading(false);
        return;
      }

      // Success - redirect to library
      const redirect = searchParams.get('redirect') || '/reader/home';
      router.push(redirect);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code');
        setResendLoading(false);
        return;
      }

      setResendSuccess(true);
      setResendLoading(false);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleCodeSubmit();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-onyx to-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-parchment">Welcome to the Kingdom</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your access code to begin reading</p>
        </div>

        {/* Device Limit Error with Upsell */}
        {deviceLimitError && (
          <div className="mb-6 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl border border-gold/30 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-parchment font-medium">Device Limit Reached</p>
                <p className="text-gray-400 text-sm mt-1">{deviceLimitError.message}</p>
              </div>
            </div>
            {deviceLimitError.upsell && (
              <Link
                href={deviceLimitError.upsell.checkoutUrl}
                className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-black font-semibold py-3 rounded-lg transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Device License (${deviceLimitError.upsell.price})
              </Link>
            )}
            <button
              onClick={() => setDeviceLimitError(null)}
              className="w-full mt-3 text-gray-400 hover:text-gray-300 text-sm"
            >
              Try a different code
            </button>
          </div>
        )}

        {/* Main Form */}
        {!deviceLimitError && (
          <form onSubmit={handleSubmit} className="bg-[#111] rounded-xl border border-[#222] p-6">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Access Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(formatCode(e.target.value))}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-4 text-white text-center text-lg tracking-widest font-mono placeholder-gray-600 focus:border-gold focus:outline-none transition"
                    maxLength={19}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check your email for your unique access code
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || accessCode.replace(/-/g, '').length < 16}
              className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access My Library'
              )}
            </button>

            {/* Device Info */}
            <p className="mt-4 text-center text-xs text-gray-500">
              🔒 Your license allows up to 2 devices
            </p>
          </form>
        )}

        {/* Resend Code Section */}
        {!deviceLimitError && (
          <div className="mt-6">
            {!showResend ? (
              <button
                onClick={() => setShowResend(true)}
                className="w-full text-center text-gray-400 hover:text-gold text-sm transition"
              >
                Don't have your code? <span className="text-gold">Resend it</span>
              </button>
            ) : (
              <div className="bg-[#111] rounded-xl border border-[#222] p-4">
                {resendSuccess ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-parchment font-medium">Code Sent!</p>
                    <p className="text-gray-400 text-sm mt-1">Check your email for your access code</p>
                    <button
                      onClick={() => { setShowResend(false); setResendSuccess(false); }}
                      className="mt-4 text-gold hover:underline text-sm"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Enter the email you used to purchase:</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition text-sm"
                      />
                      <button
                        onClick={handleResendCode}
                        disabled={resendLoading}
                        className="bg-gold/20 hover:bg-gold/30 text-gold px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-medium"
                      >
                        {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowResend(false)}
                      className="mt-3 text-gray-500 hover:text-gray-400 text-xs w-full text-center"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Purchase Link */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have the book yet?{' '}
          <Link href="/book" className="text-gold hover:underline">
            Get your copy
          </Link>
        </p>

      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-onyx to-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
