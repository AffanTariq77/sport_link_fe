import { bookingStatusText, describePolicy, formatDay, formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { ActionForm } from '@sportslink/ui';
import { openBookingChat } from '../chats/actions';

export const metadata: Metadata = { title: 'My bookings · SportsLink' };


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
              {bookingStatusText[b.status] ?? b.status} · {formatMoney(b.total, b.currency)}
              {b.advanceDue > 0 && ` · advance ${formatMoney(b.advanceDue, b.currency)}`}
            </p>
            {b.status === 'held' && b.holdExpiresAt && (
              <p className="mt-2 text-sm">
                We are holding this slot until {formatTime(b.holdExpiresAt, b.venue.timezone)}. Pay the advance before
                then to keep it.
              </p>
            )}
            {['held', 'pending_payment', 'confirmed'].includes(b.status) && (
              <ActionForm action={openBookingChat.bind(null, b.id)} button="Message the venue" className="mt-2 flex" />
            )}
            {(b.status === 'held' || b.status === 'pending_payment') && (
              <Link href={`/bookings/${b.id}/pay`} className="mt-2 inline-block text-sm font-medium underline">
                {b.status === 'held' ? 'Pay advance' : 'Payment details'}
              </Link>
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
