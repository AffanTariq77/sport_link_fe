import { formatMoney } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';

export const metadata: Metadata = { title: 'Venues · SportsLink' };

const chip = 'rounded-full border px-3 py-1 text-sm';
const on = 'border-neutral-900 bg-accent hover:opacity-90 text-white dark:border-white';

export default async function VenuesPage(props: PageProps<'/venues'>) {
  const { sport } = await props.searchParams;
  const selected = typeof sport === 'string' ? sport : undefined;
  const [{ data: sports }, { data: venues, error }] = await Promise.all([
    api.GET('/sports'),
    api.GET('/venues', { params: { query: { sport: selected } } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Book a venue</h1>
      <nav aria-label="Sport" className="flex flex-wrap gap-2">
        <Link href="/venues" className={`${chip} ${!selected ? on : ''}`}>
          All sports
        </Link>
        {sports?.map((s) => (
          <Link key={s.slug} href={`/venues?sport=${s.slug}`} className={`${chip} ${selected === s.slug ? on : ''}`}>
            {s.name}
          </Link>
        ))}
      </nav>
      {error && <p>{error.message}</p>}
      {venues?.length === 0 && <p>No venues for this sport yet.</p>}
      <ul className="flex flex-col gap-3">
        {venues?.map((v) => (
          <li key={v.id}>
            <Link href={`/venues/${v.id}`} className="flex gap-4 rounded-lg border p-4 hover:border-neutral-900">
              {v.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- served by our own route
                <img src={v.photos[0]} alt="" className="h-20 w-28 shrink-0 rounded-md object-cover" />
              )}
              <span className="flex flex-col">
              <p className="font-semibold">{v.name}</p>
              <p className="text-sm">
                {v.city} · {v.sports.join(', ')} · {v.courtCount} {v.courtCount === 1 ? 'court' : 'courts'}
              </p>
              {v.fromPricePerHour !== null && (
                <p className="text-sm">From {formatMoney(v.fromPricePerHour, v.currency)} an hour</p>
              )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
