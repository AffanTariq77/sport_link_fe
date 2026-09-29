import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Leaderboards · SportsLink' };

const chip = 'rounded-full border px-3 py-1 text-sm';
const on = 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900';

export default async function LeaderboardsPage(props: PageProps<'/leaderboards'>) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const q = await props.searchParams;
  const headers = await authHeaders();
  const [{ data: sports }, { data: me }] = await Promise.all([
    api.GET('/sports'),
    api.GET('/players/{id}', { params: { path: { id: user.id } }, headers }),
  ]);
  const myCity = me?.city;
  const sport = typeof q.sport === 'string' ? q.sport : sports?.[0]?.slug;
  const city = typeof q.city === 'string' && q.city ? q.city : undefined;
  const { data: rows, error } = sport
    ? await api.GET('/leaderboards/{sport}', { params: { path: { sport }, query: { city } }, headers })
    : { data: [], error: undefined };
  const link = (s: string, c?: string) => `/leaderboards?sport=${s}${c ? `&city=${encodeURIComponent(c)}` : ''}`;
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Leaderboards</h1>
      <nav aria-label="Sport" className="flex flex-wrap gap-2">
        {sports?.map((s) => (
          <Link key={s.slug} href={link(s.slug, city)} className={`${chip} ${sport === s.slug ? on : ''}`}>
            {s.name}
          </Link>
        ))}
      </nav>
      {sport && (
        <nav aria-label="Area" className="flex flex-wrap gap-2">
          <Link href={link(sport)} className={`${chip} ${!city ? on : ''}`}>
            Everywhere
          </Link>
          {myCity && (
            <Link href={link(sport, myCity)} className={`${chip} ${city === myCity ? on : ''}`}>
              {myCity}
            </Link>
          )}
        </nav>
      )}
      {error && <p role="alert">{error.message}</p>}
      {rows?.length === 0 && <p className="text-sm">No settled ratings yet. New players appear after a few rated matches.</p>}
      <ol className="flex flex-col gap-2">
        {rows?.map((r) => (
          <li key={r.id}>
            <Link href={`/players/${r.id}`} className="flex items-center gap-3 rounded-md border p-3 text-sm hover:border-neutral-900">
              <span className="w-6 text-right font-semibold">{r.rank}</span>
              <span className="flex-1">
                <span className="block font-medium">{r.name}</span>
                {r.city && <span className="block text-xs">{r.city}</span>}
              </span>
              <span>
                {r.rating} · {r.tier}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
