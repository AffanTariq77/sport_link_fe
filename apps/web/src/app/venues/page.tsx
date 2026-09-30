import { formatMoney } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';

export const metadata: Metadata = { title: 'Venues · SportsLink' };

const chip = 'rounded-full border px-3 py-1 text-sm font-semibold';
const on = 'border-accent bg-accent hover:opacity-90 text-on-accent';

export default async function VenuesPage(props: PageProps<'/venues'>) {
  const { sport } = await props.searchParams;
  const selected = typeof sport === 'string' ? sport : undefined;
  const [{ data: sports }, { data: venues, error }] = await Promise.all([
    api.GET('/sports'),
    api.GET('/venues', { params: { query: { sport: selected } } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-3xl">Book a venue</h1>
      <nav aria-label="Sport" className="flex flex-wrap gap-2">
        <Link href="/venues" className={`${chip} ${!selected ? on : 'bg-card'}`}>
          All sports
        </Link>
        {sports?.map((s) => (
          <Link key={s.slug} href={`/venues?sport=${s.slug}`} className={`${chip} ${selected === s.slug ? on : 'bg-card'}`}>
            {s.name}
          </Link>
        ))}
      </nav>
      {error && <p>{error.message}</p>}
      {venues?.length === 0 && <p>No venues for this sport yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {venues?.map((v) => (
          <li key={v.id}>
            <Link href={`/venues/${v.id}`} className="block overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
              <span className="relative grid aspect-video place-items-center bg-navy">
                {v.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- served by our own route
                  <img src={v.photos[0]} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-accent" aria-hidden>
                    {v.name.slice(0, 1)}
                  </span>
                )}
                {v.fromPricePerHour !== null && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-accent px-3 py-1 text-sm font-black text-on-accent">
                    From {formatMoney(v.fromPricePerHour, v.currency)}/hr
                  </span>
                )}
              </span>
              <span className="flex flex-col gap-2 p-4">
                <span className="text-lg font-extrabold">{v.name}</span>
                <span className="text-sm text-muted">
                  {v.city} · {v.courtCount} {v.courtCount === 1 ? 'court' : 'courts'}
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {v.sports.map((sp) => (
                    <span key={sp} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold">
                      {sp}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
