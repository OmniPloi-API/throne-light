'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Copy, Check, ArrowRight, Key } from 'lucide-react';

export default function CodePage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === 'string' ? params.code.toUpperCase() : '';
  const [copied, setCopied] = useState(false);

  // Format code for display (XXXX-XXXX-XXXX-XXXX)
  const formattedCode = code.replace(/[^A-Z0-9]/g, '').match(/.{1,4}/g)?.join('-') || code;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formattedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f3] to-[#f9efe6] flex flex-col items-center justify-center p-4">
      {/* Crown Logo */}
      <div className="mb-8">
        <Image 
          src="/images/THRONELIGHT-CROWN.png" 
          alt="Throne Light" 
          width={64} 
          height={64}
          className="w-16 h-16"
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#c9a961]/30 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#c9a961]/20 flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-[#c9a961]" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Your Access Code</h1>
          <p className="text-gray-500 text-sm">Tap the button below to copy your code</p>
        </div>

        {/* Code Display */}
        <div className="bg-gradient-to-br from-[#c9a961]/15 to-[#c9a961]/5 border-2 border-[#c9a961] rounded-xl p-6 mb-6">
          <p className="text-[#c9a961] text-2xl md:text-3xl font-bold text-center font-mono tracking-wider break-all">
            {formattedCode}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-[#c9a961] hover:bg-[#b8954f] text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Code
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#c9a961]/20"></div>
          <span className="text-[#c9a961]/50 text-sm">or</span>
          <div className="flex-1 h-px bg-[#c9a961]/20"></div>
        </div>

        {/* Login Link */}
        <Link
          href={`/login?code=${formattedCode}&redirect=/reader`}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-[#c9a961] border-2 border-[#c9a961] hover:bg-[#c9a961]/10 transition-all"
        >
          Open Reader Instantly
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-center text-gray-400 text-xs mt-6">
          Valid for 2 devices • Keep this code safe
        </p>
      </div>

      {/* Footer */}
      <p className="text-gray-400 text-sm mt-8">
        © 2025 Throne Light Publishing LLC
      </p>
    </div>
  );
}
