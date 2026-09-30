import { formatDay, formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Matches · SportsLink' };

const chip = 'rounded-full border px-3 py-1 text-sm font-semibold';
const on = 'border-accent bg-accent hover:opacity-90 text-on-accent';
type Match = NonNullable<Awaited<ReturnType<typeof load>>['open']>[number];

async function load(sport?: string) {
  const headers = await authHeaders();
  const [open, mine, sports] = await Promise.all([
    api.GET('/matches', { params: { query: { sport } }, headers }),
    api.GET('/matches/mine', { headers }),
    api.GET('/sports'),
  ]);
  return { open: open.data, mine: mine.data, sports: sports.data };
}

function MatchCard({ m }: { m: Match }) {
  const [weekday, day, month] = formatDay(m.startAt, m.timezone).split(' ');
  const left = m.slotsTotal - m.slotsFilled;
  return (
    <Link href={`/matches/${m.id}`} className="flex overflow-hidden rounded-2xl border bg-card text-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
      <span className="flex w-20 shrink-0 flex-col items-center justify-center bg-navy py-3 text-white">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">{weekday}</span>
        <span className="text-3xl font-black leading-none">{day}</span>
        <span className="text-xs uppercase text-white/70">{month}</span>
        <span className="mt-1 text-sm font-bold">{formatTime(m.startAt, m.timezone)}</span>
      </span>
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-on-accent">{m.sport}</span>
          {m.filters.gender === 'female' && <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold">Women only</span>}
          {m.filters.verifiedOnly && <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold">Verified players</span>}
          {!m.listed && <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold">Unlisted venue</span>}
          {m.pricePerPlayer !== null && m.currency && (
            <span className="ml-auto font-extrabold">
              {formatMoney(m.pricePerPlayer, m.currency)}
              <span className="font-normal text-muted"> each</span>
            </span>
          )}
        </span>
        <span className="text-base font-bold">{m.venue.name}</span>
        <span className="text-muted">
          {m.venue.detail} · host {m.host.name ?? 'Player'}
        </span>
        <span className="flex items-center gap-3">
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
            <span className="block h-full rounded-full bg-accent" style={{ width: `${(m.slotsFilled / m.slotsTotal) * 100}%` }} />
          </span>
          <span className="text-xs font-bold">
            {m.slotsFilled}/{m.slotsTotal} · {left > 0 ? `${left} ${left === 1 ? 'spot' : 'spots'} left` : 'Full'}
          </span>
        </span>
      </span>
    </Link>
  );
}

export default async function MatchesPage(props: PageProps<'/matches'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { sport } = await props.searchParams;
  const selected = typeof sport === 'string' ? sport : undefined;
  const { open, mine, sports } = await load(selected);
  const upcomingMine = mine?.filter((m) => m.status !== 'cancelled') ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Matches</h1>
        <Link href="/matches/new" className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-on-accent hover:opacity-90">
          Create a match
        </Link>
      </div>
      {upcomingMine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted">Your matches</h2>
          {upcomingMine.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </section>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted">Open matches</h2>
        <nav aria-label="Sport" className="flex flex-wrap gap-2">
          <Link href="/matches" className={`${chip} ${!selected ? on : 'bg-card'}`}>
            All sports
          </Link>
          {sports?.map((s) => (
            <Link key={s.slug} href={`/matches?sport=${s.slug}`} className={`${chip} ${selected === s.slug ? on : 'bg-card'}`}>
              {s.name}
            </Link>
          ))}
        </nav>
        {open?.length === 0 && <p>No open matches right now. Create one and invite players.</p>}
        {open?.map((m) => (
          <MatchCard key={m.id} m={m} />
        ))}
      </section>
    </main>
  );
}
