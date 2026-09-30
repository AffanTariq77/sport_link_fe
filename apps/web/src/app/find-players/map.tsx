'use client';

import 'leaflet/dist/leaflet.css';
import type { Circle, Map, Marker } from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { shareLocation } from './actions';

// ponytail: OpenStreetMap's public tiles are for light use only; move to a keyed tile provider before launch.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const LAHORE: [number, number] = [31.5204, 74.3587]; // launch city, shown until the player shares a location

type Point = [number, number];

/**
 * The player's own search area: their position (kept in the browser, the API stores only a rounded area)
 * and the radius they are asking within. Other players are never pinned; they appear as distance bands only.
 * Follows the `radiusKm` field of the surrounding form when there is one.
 */
export function RadiusMap({ radiusKm, searching = false, hasLocation }: { radiusKm: number; searching?: boolean; hasLocation: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const circle = useRef<Circle | null>(null);
  const you = useRef<Marker | null>(null);
  const [here, setHere] = useState<Point | null>(null);
  const [km, setKm] = useState(radiusKm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Show the player's position without a prompt when they have already allowed it.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => p.state === 'granted' && navigator.geolocation.getCurrentPosition((g) => setHere([g.coords.latitude, g.coords.longitude])))
      .catch(() => undefined);
  }, []);

  // Track the radius field while the player types.
  useEffect(() => {
    const field = box.current?.closest('main')?.querySelector<HTMLInputElement>('input[name=radiusKm]');
    if (!field) return;
    const sync = () => Number(field.value) > 0 && setKm(Number(field.value));
    field.addEventListener('input', sync);
    return () => field.removeEventListener('input', sync);
  }, []);

  useEffect(() => {
    let gone = false;
    import('leaflet').then((L) => {
      if (gone || !box.current) return;
      if (!map.current) {
        map.current = L.map(box.current, { zoomControl: false }).setView(LAHORE, 11);
        L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION, className: 'map-tiles' }).addTo(map.current);
      }
      const m = map.current;
      if (!here) return;
      circle.current?.remove();
      you.current?.remove();
      circle.current = L.circle(here, {
        radius: km * 1000,
        color: '#ff6b1a',
        weight: 2,
        fillColor: '#ff6b1a',
        fillOpacity: 0.12,
        className: searching ? 'radius-pulse' : '',
      }).addTo(m);
      you.current = L.marker(here, {
        icon: L.divIcon({ className: '', html: '<span class="you-dot" aria-label="You"></span>', iconSize: [22, 22] }),
        interactive: false,
      }).addTo(m);
      m.fitBounds(circle.current.getBounds(), { padding: [16, 16] });
    });
    return () => {
      gone = true;
    };
  }, [here, km, searching]);

  useEffect(() => () => void map.current?.remove(), []);

  const share = () => {
    if (!navigator.geolocation) return setMessage('This browser cannot share a location.');
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        setHere([p.coords.latitude, p.coords.longitude]);
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
    <div className="relative isolate overflow-hidden rounded-2xl border bg-card">
      <div ref={box} className="h-72 w-full sm:h-96" role="img" aria-label={`Map of your search area, ${km} km around you`} />
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex items-start justify-between gap-2">
        <span className="rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white shadow">
          {searching ? `Searching within ${km} km…` : `Within ${km} km`}
        </span>
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-on-accent shadow disabled:opacity-50"
        >
          <LocateFixed size={14} aria-hidden />
          {busy ? 'Finding you…' : here || hasLocation ? 'Update my location' : 'Share my location'}
        </button>
      </div>
      {message && (
        <p role="status" className="border-t p-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
