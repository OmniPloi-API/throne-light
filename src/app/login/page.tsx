'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to library
      router.push('/library');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-onyx to-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={48} height={48} className="w-12 h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-parchment">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to access your library</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111] rounded-xl border border-[#222] p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* One Device Notice */}
          <p className="mt-4 text-center text-xs text-gray-500">
            🔒 For security, only one device can be logged in at a time.
          </p>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-gold hover:underline">
            Create one
          </Link>
        </p>

        {/* Back to Home */}
        <p className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
