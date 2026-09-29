import { formatDay, formatTime } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { createRequest, saveAvailability } from './actions';
import { ShareLocation } from './live';
import { statusText } from './text';

export const metadata: Metadata = { title: 'Find Players · SportsLink' };
const tz = 'Asia/Karachi';

export default async function FindPlayersPage(props: PageProps<'/find-players'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { done } = await props.searchParams;
  const headers = await authHeaders();
  const [{ data: me }, { data: mine }, { data: sports }] = await Promise.all([
    api.GET('/me/availability', { headers }),
    api.GET('/find-players', { headers }),
    api.GET('/sports'),
  ]);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Find Players</h1>
      <p className="text-sm">Short of players? Ask players nearby. They accept, you pick who joins, then agree the details in chat.</p>
      {done === 'saved' && <p className="rounded-md border p-3 text-sm">Saved.</p>}

      {mine && mine.incoming.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Players needed near you</h2>
          {mine.incoming.map((r) => (
            <Link key={r.id} href={`/find-players/${r.id}`} className="flex justify-between gap-3 rounded-lg border p-3 text-sm hover:border-neutral-900">
              <span>
                <span className="block font-medium">
                  {r.sport} · {r.distance} away
                </span>
                <span className="block">
                  {r.requester} · until {formatDay(r.windowEnd, tz)}, {formatTime(r.windowEnd, tz)}
                </span>
              </span>
              <span className="self-center">{statusText[r.myStatus] ?? r.myStatus}</span>
            </Link>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="font-semibold">Ask for players</h2>
        {!me?.hasLocation && <p className="text-sm">Share your location first so we can find players near you.</p>}
        <ShareLocation label={me?.hasLocation ? 'Update my location' : 'Share my location'} />
        <ActionForm action={createRequest} button="Send request">
          <label className={labelClass}>
            Sport
            <select name="sport" required className={input}>
              {sports?.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Players needed
              <input name="playersNeeded" type="number" min={1} max={20} defaultValue={2} required className={input} />
            </label>
            <label className={labelClass}>
              Within (km)
              <input name="radiusKm" type="number" min={1} max={25} defaultValue={5} required className={input} />
            </label>
          </div>
          <label className={labelClass}>
            When
            <select name="window" defaultValue="now" className={input}>
              <option value="now">Now (next 3 hours)</option>
              <option value="today">Today</option>
              <option value="custom">Choose a time</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              From (if choosing)
              <input name="startAt" type="datetime-local" className={input} />
            </label>
            <label className={labelClass}>
              Until
              <input name="endAt" type="datetime-local" className={input} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Minimum rating
              <input name="minRating" type="number" min={0} max={4000} step={50} className={input} />
            </label>
            <label className={labelClass}>
              Maximum rating
              <input name="maxRating" type="number" min={0} max={4000} step={50} className={input} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="verifiedOnly" /> Verified players only
          </label>
        </ActionForm>
      </section>

      {mine && mine.sent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Your requests</h2>
          {mine.sent.map((r) => (
            <Link key={r.id} href={`/find-players/${r.id}`} className="flex justify-between rounded-lg border p-3 text-sm hover:border-neutral-900">
              <span className="font-medium">{r.sport}</span>
              <span>{r.status}</span>
            </Link>
          ))}
        </section>
      )}

      {me && (
        <details className="flex flex-col gap-3 rounded-lg border p-4">
          <summary className="cursor-pointer font-semibold">Alerts for you</summary>
          <ActionForm action={saveAvailability} button="Save">
            <label className={labelClass}>
              Alert me
              <select name="alertMode" defaultValue={me.alertMode} className={input}>
                <option value="available">Only when I am available to play</option>
                <option value="always">Always</option>
                <option value="off">Never</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="available" defaultChecked={me.available} /> I am available to play now
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="quietHoursOk" defaultChecked={me.quietHoursOk} /> Alerts at night are fine
            </label>
          </ActionForm>
        </details>
      )}
    </main>
  );
}
