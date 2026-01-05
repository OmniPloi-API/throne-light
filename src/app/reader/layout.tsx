'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        
        if (!res.ok) {
          // Not authenticated - redirect to login
          router.push('/login?redirect=/reader');
          return;
        }
        
        const data = await res.json();
        if (!data.user) {
          router.push('/login?redirect=/reader');
          return;
        }
        
        // User is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login?redirect=/reader');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
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
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
