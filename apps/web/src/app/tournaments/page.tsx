import { formatDay, formatMoney } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { formatName } from './text';

export const metadata: Metadata = { title: 'Tournaments · SportsLink' };
const tz = 'Asia/Karachi';

export default async function TournamentsPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const [{ data, error }, { data: programmes }] = await Promise.all([api.GET('/tournaments', { headers }), api.GET('/programmes', { headers })]);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Tournaments</h1>
      {error && <p role="alert">{error.message}</p>}
      {data?.length === 0 && <p className="text-sm">No tournaments yet. SportsLink announces them here.</p>}
      <ul className="flex flex-col gap-2">
        {data?.map((t) => (
          <li key={t.id}>
            <Link href={`/tournaments/${t.id}`} className="block rounded-xl border bg-card p-3 text-sm hover:border-accent">
              <span className="block font-medium">{t.name}</span>
              <span className="block">
                {t.sport} · {formatName[t.format]} · {t.teamEntry ? 'teams' : 'players'} · {t.entryFee ? formatMoney(t.entryFee, t.currency) : 'free'}
              </span>
              <span className="block">
                {t.venue} · starts {formatDay(t.startsAt, tz)} · {t.status === 'open' ? `entries close ${formatDay(t.registrationDeadline, tz)}` : t.status.replace('_', ' ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {programmes?.map((p) => (
        <section key={p.key} className="rounded-xl border bg-card border-dashed p-4 text-sm">
          <h2 className="font-semibold">{p.name}</h2>
          <p>{p.status === 'coming_soon' ? 'Coming soon.' : 'Open now.'}</p>
        </section>
      ))}
    </main>
  );
}
