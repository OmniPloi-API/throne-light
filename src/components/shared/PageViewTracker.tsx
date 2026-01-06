'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Create unique key for this page view to prevent duplicate tracking
    const pageKey = `${pathname}${searchParams.toString()}`;
    if (trackedRef.current.has(pageKey)) return;
    trackedRef.current.add(pageKey);

    // Get partner ID from URL if present
    const partnerId = searchParams.get('ref') || searchParams.get('partner');
    
    // Track the page view (works for both partner and direct traffic)
    fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: partnerId || 'direct', // Use 'direct' for non-partner traffic
        type: 'PAGE_VIEW',
      }),
    }).catch(err => console.error('Failed to track page view:', err));
  }, [pathname, searchParams]);

  return null;
}
