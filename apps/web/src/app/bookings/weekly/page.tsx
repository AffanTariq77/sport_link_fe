import { formatDay, formatTime } from '@sportslink/api-client';
import { ActionForm } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { holdWeekly } from '../actions';

export const metadata: Metadata = { title: 'Weekly booking · SportsLink' };

export default async function WeeklyPage(props: PageProps<'/bookings/weekly'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const q = await props.searchParams;
  const [startAt = '', endAt = ''] = String(q.slot ?? '').split('|');
  const courtId = String(q.court ?? '');
  const weeks = Number(q.weeks ?? 4);
  const back = `/venues/${String(q.venue ?? '')}`;
  const { data, error } = await api.POST('/bookings/recurring/check', {
    headers: await authHeaders(),
    body: { courtId, startAt, endAt, weeks },
  });
  const tz = 'Asia/Karachi'; // ponytail: launch-market time zone, as elsewhere on the web app
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-6">
      <Link href={back} className="text-sm underline">
        Back to the venue
      </Link>
      <h1 className="text-2xl font-semibold">Book every week</h1>
      {error && <p role="alert">{error.message}</p>}
      {data && (
        <>
          <p className="text-sm">
            All weeks are held together and paid upfront in one transfer. Taken weeks are left out; untick any week you do not want.
          </p>
          <ActionForm action={holdWeekly.bind(null, courtId, startAt, endAt, data.map((w) => new Date(w.startAt).toISOString()))} button="Hold these weeks">
            {data.map((w) => (
              <label key={w.startAt} className={`flex items-center gap-3 rounded-xl border bg-card p-3 text-sm ${w.free ? '' : 'opacity-50'}`}>
                <input type="checkbox" name="week" value={new Date(w.startAt).toISOString()} defaultChecked={w.free} disabled={!w.free} />
                {formatDay(w.startAt, tz)}, {formatTime(w.startAt, tz)} to {formatTime(w.endAt, tz)}
                {!w.free && ' · already booked'}
              </label>
            ))}
          </ActionForm>
        </>
      )}
    </main>
  );
}
