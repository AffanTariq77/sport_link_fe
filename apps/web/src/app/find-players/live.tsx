'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Refreshes the page while the request is live, so new players show up without reloading. */
// ponytail: polling every few seconds until realtime (Socket.IO) lands.
export function LiveRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}
