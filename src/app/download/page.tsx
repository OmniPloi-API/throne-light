'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Apple, 
  Monitor,
  Smartphone,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name?: string;
}

interface DownloadOption {
  id: string;
  platform: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  fileName: string;
  fileSize: string;
  downloadUrl: string;
  available: boolean;
  comingSoon?: boolean;
}

export default function DownloadPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Check auth
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login?redirect=/download');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        // Check library access
        const libRes = await fetch('/api/library');
        if (libRes.ok) {
          const books = await libRes.json();
          // User has purchased if they have any books in their library
          setHasPurchased(books.length > 0);
        }
      } catch (err) {
        console.error('Failed to check access:', err);
        setError('Failed to verify your access. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [router]);

  const downloadOptions: DownloadOption[] = [
    {
      id: 'macos',
      platform: 'macOS',
      icon: <Apple className="w-8 h-8" />,
      title: 'Throne Light Reader for Mac',
      subtitle: 'macOS 10.13+ (Intel & Apple Silicon)',
      fileName: 'Throne-Light-Reader-macOS-v1.0.4.dmg',
      fileSize: '~15 MB',
      downloadUrl: '/downloads/Throne-Light-Reader-macOS-v1.0.4.dmg',
      available: true,
    },
    {
      id: 'windows',
      platform: 'Windows',
      icon: <Monitor className="w-8 h-8" />,
      title: 'Throne Light Reader for Windows',
      subtitle: 'Windows 10/11 (64-bit)',
      fileName: 'Throne Light Reader_1.0.1_x64.msi',
      fileSize: '~18 MB',
      downloadUrl: '/downloads/Throne Light Reader_1.0.1_x64.msi',
      available: false,
      comingSoon: true,
    },
    {
      id: 'ios',
      platform: 'iOS',
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Throne Light Reader for iOS',
      subtitle: 'iPhone & iPad',
      fileName: 'App Store',
      fileSize: 'Free with purchase',
      downloadUrl: '#',
      available: false,
      comingSoon: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Image 
            src="/images/THRONELIGHT-CROWN.png" 
            alt="Crown" 
            width={48} 
            height={48} 
            className="w-12 h-12 mx-auto mb-4 animate-pulse" 
          />
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="border-b border-[#222] px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between relative">
            <Link href="/library" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Library</span>
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2">
              <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={32} height={32} className="w-8 h-8" />
            </div>
            <div className="w-32" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* No Access Message */}
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Purchase Required</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You need to purchase a book to download the Throne Light Reader app. 
            The app is included free with your book purchase.
          </p>
          <Link
            href="/checkout?book=crowded-bed-empty-throne&source=download"
            className="inline-block bg-gold hover:bg-gold/90 text-black font-semibold px-8 py-3 rounded-lg transition"
          >
            Purchase Book to Unlock
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          <Link href="/library" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Library</span>
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Image src="/images/THRONELIGHT-CROWN.png" alt="Crown" width={32} height={32} className="w-8 h-8" />
          </div>
          <div className="w-32" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Download className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Download Throne Light Reader</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Download the app for the best reading experience. Your purchase includes access on up to 2 devices.
          </p>
        </div>

        {/* Access Verified Badge */}
        <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg w-fit mx-auto">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300 text-sm">Purchase verified for {user?.email}</span>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 max-w-lg mx-auto">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Download Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {downloadOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-6 rounded-xl border transition-all ${
                option.available
                  ? 'bg-[#111] border-gold/30 hover:border-gold/60'
                  : 'bg-[#0d0d0d] border-[#222] opacity-60'
              }`}
            >
              {option.comingSoon && (
                <span className="absolute top-3 right-3 text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
              
              <div className={`mb-4 ${option.available ? 'text-gold' : 'text-gray-500'}`}>
                {option.icon}
              </div>
              
              <h3 className="font-semibold mb-1">{option.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{option.subtitle}</p>
              
              <div className="text-xs text-gray-600 mb-4">
                <p>{option.fileName}</p>
                <p>{option.fileSize}</p>
              </div>
              
              {option.available ? (
                <a
                  href={option.downloadUrl}
                  download
                  className="block w-full text-center bg-gold hover:bg-gold/90 text-black font-semibold py-3 rounded-lg transition"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download
                </a>
              ) : (
                <button
                  disabled
                  className="w-full text-center bg-[#222] text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">2-Device Limit</h3>
              <p className="text-gray-400 text-sm">
                Your purchase allows you to use the Throne Light Reader on up to <strong className="text-white">2 devices</strong> simultaneously. 
                If you log in on a third device, your oldest session will be automatically signed out.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Installation Instructions</h2>
          
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#222] rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Apple className="w-5 h-5 text-gray-400" />
                macOS
              </h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                <li>Download the DMG file above</li>
                <li>Double-click the downloaded file to open it</li>
                <li>Drag the Throne Light Reader app to your Applications folder</li>
                <li>Open the app and sign in with your account</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] px-4 py-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 Throne Light Publishing LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
