'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Shield, Loader2, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import Image from 'next/image';

function AddDeviceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const licenseCode = searchParams.get('license');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licenseInfo, setLicenseInfo] = useState<{
    email: string;
    activeDevices: number;
    maxDevices: number;
  } | null>(null);

  useEffect(() => {
    if (licenseCode) {
      // Validate the license and get info
      fetch('/api/reader/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseCode, action: 'validate' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setLicenseInfo({
              email: data.email,
              activeDevices: data.activeDevices,
              maxDevices: data.maxDevices,
            });
          }
        })
        .catch(() => {});
    }
  }, [licenseCode]);

  async function handleCheckout() {
    if (!licenseCode) {
      setError('No license code provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/add-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (!licenseCode) {
    return (
      <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Request</h1>
          <p className="text-gray-400 mb-6">No license code provided.</p>
          <Link href="/login" className="text-gold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image 
              src="/images/THRONELIGHT-CROWN.png" 
              alt="Crown" 
              width={48} 
              height={48} 
              className="w-12 h-12 mx-auto mb-4" 
            />
          </Link>
          <h1 className="text-2xl font-bold">Add Another Device</h1>
          <p className="text-gray-400 text-sm mt-1">Expand your reading kingdom</p>
        </div>

        {/* Product Card */}
        <div className="bg-[#111] rounded-xl border border-[#222] p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-parchment">+1 Device License</h2>
              <p className="text-gray-400 text-sm mt-1">
                Add one additional device to your existing license
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Instant activation on new device</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Same access code - no new login needed</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Read on 3 devices total</span>
            </div>
          </div>

          {/* Current Status */}
          {licenseInfo && (
            <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 border border-[#222]">
              <p className="text-xs text-gray-500 mb-2">Current License Status</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Active Devices</span>
                <span className="text-gold font-mono">
                  {licenseInfo.activeDevices} / {licenseInfo.maxDevices}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400 text-sm">After Purchase</span>
                <span className="text-green-400 font-mono">
                  {licenseInfo.activeDevices} / {licenseInfo.maxDevices + 1}
                </span>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#222]">
            <span className="text-gray-400">One-time payment</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-gold">$5.99</span>
              <span className="text-gray-500 text-sm ml-1">USD</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Add Device - $5.99
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment via Stripe • Instant activation
          </p>
        </div>

        {/* Back Link */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AddDevicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    }>
      <AddDeviceContent />
    </Suspense>
  );
}
