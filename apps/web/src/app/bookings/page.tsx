import { describePolicy, formatDay, formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'My bookings · SportsLink' };

const statusText: Record<string, string> = {
  held: 'Held for you',
  pending_payment: 'Waiting for payment',
  confirmed: 'Confirmed',
  completed: 'Played',
  cancelled: 'Cancelled',
  no_show: 'No-show',
  expired: 'Expired',
};

export default async function BookingsPage(props: PageProps<'/bookings'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { held, error } = await props.searchParams;
  const { data: bookings } = await api.GET('/bookings/mine', { headers: await authHeaders() });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      {typeof error === 'string' && <p className="rounded-md border p-3 text-sm">{error}</p>}
      {bookings?.length === 0 && (
        <p>
          No bookings yet.{' '}
          <Link href="/venues" className="underline">
            Find a venue
          </Link>
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {bookings?.map((b) => (
          <li key={b.id} className={`rounded-lg border p-4 ${b.id === held ? 'border-neutral-900' : ''}`}>
            <p className="font-semibold">
              {b.venue.name} · {b.court.name}
            </p>
            <p className="text-sm">
              {formatDay(b.startAt, b.venue.timezone)}, {formatTime(b.startAt, b.venue.timezone)} to{' '}
              {formatTime(b.endAt, b.venue.timezone)}
            </p>
            <p className="text-sm">
              {statusText[b.status] ?? b.status} · {formatMoney(b.total, b.currency)}
              {b.advanceDue > 0 && ` · advance ${formatMoney(b.advanceDue, b.currency)}`}
            </p>
            {b.status === 'held' && b.holdExpiresAt && (
              <p className="mt-2 text-sm">
                We are holding this slot until {formatTime(b.holdExpiresAt, b.venue.timezone)}. Paying the advance in
                the app is not available yet, so this hold will expire.
              </p>
            )}
            {b.status === 'held' && (
              <ul className="mt-2 text-sm">
                {describePolicy(b.policy, b.currency).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
