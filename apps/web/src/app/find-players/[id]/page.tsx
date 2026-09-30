import { formatDay, formatTime } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { answerRequest, closeRequest, convertToMatch, dropPlayer, openFindChat, pickPlayers } from '../actions';
import { LiveRefresh } from '../live';
import { statusText } from '../text';

export const metadata: Metadata = { title: 'Find Players · SportsLink' };
const tz = 'Asia/Karachi';

export default async function FindRequestPage(props: PageProps<'/find-players/[id]'>) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const { id } = await props.params;
  const { sent } = await props.searchParams;
  const headers = await authHeaders();
  const { data: r } = await api.GET('/find-players/{id}', { params: { path: { id } }, headers });
  if (!r) notFound();
  const live = r.status === 'open' || r.status === 'matched';
  const accepted = r.players.filter((p) => p.status === 'accepted');
  const picked = r.players.filter((p) => p.status === 'selected');
  const hosting =
    r.mine && picked.length && !r.matchId
      ? ((await api.GET('/matches/mine', { headers })).data ?? []).filter((m) => m.host.id === user.id && m.sport === r.sport && ['open', 'full'].includes(m.status))
      : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      {live && <LiveRefresh />}
      <Link href="/find-players" className="text-sm underline">
        Find Players
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">
          {r.sport}: {r.playersNeeded} {r.playersNeeded === 1 ? 'player' : 'players'} needed
        </h1>
        <p className="text-sm">
          {r.mine ? `Within ${r.radiusKm} km` : `${r.requester.name} · ${r.distance} away`} · {formatDay(r.windowStart, tz)},{' '}
          {formatTime(r.windowStart, tz)} to {formatTime(r.windowEnd, tz)} · {r.status}
        </p>
      </div>
      {r.mine && typeof sent === 'string' && (
        <p className="rounded-xl border bg-card p-3 text-sm">
          {sent === '0' ? (
            <>
              Nobody who matches is nearby right now. Try a wider radius, or <Link href="/matches" className="underline">join an open match</Link>.
            </>
          ) : (
            `Sent to ${sent} ${sent === '1' ? 'player' : 'players'} nearby. More are asked if not enough say yes.`
          )}
        </p>
      )}

      {!r.mine && (
        <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">
            {r.myStatus === 'notified' && r.status !== 'open' ? 'This game has its players now. Thanks for looking.' : (statusText[r.myStatus ?? ''] ?? '')}
          </p>
          {r.myStatus === 'notified' && r.status === 'open' && (
            <div className="flex gap-3">
              <ActionForm action={answerRequest.bind(null, r.id, true)} button="I can play" className="flex" />
              <ActionForm action={answerRequest.bind(null, r.id, false)} button="Not this time" className="flex" />
            </div>
          )}
          {r.myStatus === 'selected' && <ActionForm action={openFindChat.bind(null, r.id)} button="Open the group chat" className="flex" />}
          {r.matchId && (
            <Link href={`/matches/${r.matchId}`} className="underline">
              See the match
            </Link>
          )}
        </section>
      )}

      {r.mine && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Players who said yes</h2>
            {accepted.length === 0 && <p className="text-sm">No one yet. This page updates by itself.</p>}
            {accepted.length > 0 && live && (
              <ActionForm action={pickPlayers.bind(null, r.id)} button="Pick these players">
                {accepted.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm">
                    <input type="checkbox" name="pick" value={p.id} />
                    <span>
                      <Link href={`/players/${p.id}`} className="font-medium underline">
                        {p.name}
                      </Link>{' '}
                      · {p.distance} · rating {p.rating ?? 'new'}
                      {p.provisional && p.rating ? ' (provisional)' : ''}
                      {p.behaviour !== null && ` · ${p.behaviour}★`}
                    </span>
                  </label>
                ))}
              </ActionForm>
            )}
          </section>
          {picked.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Picked</h2>
              {picked.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                  <span>
                    {p.name} · {p.distance}
                  </span>
                  {live && <ActionForm action={dropPlayer.bind(null, r.id, p.id)} button="Remove" className="flex" />}
                </div>
              ))}
              <ActionForm action={openFindChat.bind(null, r.id)} button="Open the group chat" className="flex" />
            </section>
          )}
          {picked.length > 0 && !r.matchId && (
            <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
              <h2 className="font-semibold">Make it a match</h2>
              <p>
                Agree the venue and time in the chat, then <Link href="/matches/new" className="underline">create the match</Link> and add your picked
                players to it here.
              </p>
              {hosting.length > 0 && (
                <ActionForm action={convertToMatch.bind(null, r.id)} button="Add them to this match" className="flex flex-wrap items-center gap-3">
                  <select name="matchId" aria-label="Your match" className={input}>
                    {hosting.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.venue.name} · {formatDay(m.startAt, m.timezone)} {formatTime(m.startAt, m.timezone)}
                      </option>
                    ))}
                  </select>
                </ActionForm>
              )}
            </section>
          )}
          {r.matchId && (
            <Link href={`/matches/${r.matchId}`} className="text-sm underline">
              See the match
            </Link>
          )}
          {live && <ActionForm action={closeRequest.bind(null, r.id)} button="Close this request" className="flex" />}
        </>
      )}
    </main>
  );
}
