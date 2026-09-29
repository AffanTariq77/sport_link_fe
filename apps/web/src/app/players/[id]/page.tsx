import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { tagName } from '../../matches/[id]/result';

export const metadata: Metadata = { title: 'Player · SportsLink' };

export default async function PlayerPage(props: PageProps<'/players/[id]'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { data: p } = await api.GET('/players/{id}', { params: { path: { id } }, headers: await authHeaders() });
  if (!p) notFound();
  const b = p.behaviour;
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="text-sm">
          {[p.city, p.verified ? 'ID verified' : null, `${p.matchesPlayed} ${p.matchesPlayed === 1 ? 'match' : 'matches'} played`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Skill ratings</h2>
        {p.ratings.length === 0 && <p className="text-sm">No rated matches yet.</p>}
        <ul className="flex flex-col gap-2">
          {p.ratings.map((r) => (
            <li key={r.slug} className="flex justify-between rounded-md border p-3 text-sm">
              <span className="font-medium">{r.sport}</span>
              <span>
                {r.rating} · {r.provisional ? 'Provisional' : r.tier} · {r.games} {r.games === 1 ? 'game' : 'games'}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2 text-sm">
        <h2 className="text-lg font-semibold">Behaviour</h2>
        {b.count === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <>
            <p>
              {b.average} out of 5 from {b.count} {b.count === 1 ? 'review' : 'reviews'}
            </p>
            {b.topTags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {b.topTags.map((t) => (
                  <li key={t.tag} className="rounded-full border px-3 py-1">
                    {tagName(t.tag)} ({t.count})
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
