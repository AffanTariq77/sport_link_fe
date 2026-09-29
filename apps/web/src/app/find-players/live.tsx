'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shareLocation } from './actions';

/** Shares the browser's position (rounded by the API). Nothing is sent until the player presses the button. */
export function ShareLocation({ label = 'Share my location' }: { label?: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const share = () => {
    if (!navigator.geolocation) return setMessage('This browser cannot share a location.');
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const r = await shareLocation(p.coords.latitude, p.coords.longitude);
        setBusy(false);
        setMessage(r.message ?? 'Location shared. Only a rounded area is kept, and others see distance bands only.');
      },
      () => {
        setBusy(false);
        setMessage('Location permission was not given.');
      },
      { maximumAge: 300_000, timeout: 15_000 },
    );
  };
  return (
    <div className="flex flex-col gap-1 text-sm">
      <button type="button" onClick={share} disabled={busy} className="self-start rounded-md border px-4 py-2 font-medium disabled:opacity-50">
        {busy ? 'Finding you…' : label}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}

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
