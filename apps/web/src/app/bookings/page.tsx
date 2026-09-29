import { bookingStatusText, describePolicy, formatDay, formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { ActionForm } from '@sportslink/ui';
import { openBookingChat } from '../chats/actions';
import { answerRefund, cancelBooking } from './actions';

export const metadata: Metadata = { title: 'My bookings · SportsLink' };

const refundText: Record<string, string> = {
  due: 'the venue will send it',
  sent: 'the venue says it has been sent',
  received: 'received',
  disputed: 'our support team is looking into it',
};


export default async function BookingsPage(props: PageProps<'/bookings'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { held, error, cancelled } = await props.searchParams;
  const headers = await authHeaders();
  const [{ data: bookings }, { data: myRefunds }] = await Promise.all([
    api.GET('/bookings/mine', { headers }),
    api.GET('/refunds/mine', { headers }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      {typeof error === 'string' && <p className="rounded-md border p-3 text-sm">{error}</p>}
      {cancelled && (
        <p className="rounded-md border p-3 text-sm">
          Booking cancelled.{' '}
          {cancelled === 'refund' ? 'The venue will send your refund; confirm here when it arrives.' : 'No refund is due under the venue policy.'}
        </p>
      )}
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
              <div className="mt-2 flex flex-wrap gap-3">
                <ActionForm action={openBookingChat.bind(null, b.id)} button="Message the venue" className="flex" />
                <ActionForm action={cancelBooking.bind(null, b.id)} button="Cancel booking" className="flex" />
              </div>
            )}
            {b.status === 'confirmed' && (
              <p className="mt-1 text-xs">
                {b.policy.cancelRefund
                  ? `Cancel at least ${b.policy.cancelWindowHours} hours before for a refund of your advance.`
                  : 'This venue does not refund cancellations.'}
              </p>
            )}
            {myRefunds
              ?.filter((r) => r.bookingId === b.id)
              .map((r) => (
                <div key={r.id} className="mt-2 rounded-md border p-2 text-sm">
                  <p>
                    Refund {formatMoney(r.amount, r.currency)}: {refundText[r.status] ?? r.status}
                    {r.vendorReference && ` · reference ${r.vendorReference}`}
                  </p>
                  {r.status === 'sent' && (
                    <div className="mt-1 flex gap-3">
                      <ActionForm action={answerRefund.bind(null, r.id, true)} button="I received it" className="flex" />
                      <ActionForm action={answerRefund.bind(null, r.id, false)} button="It did not arrive" className="flex" />
                    </div>
                  )}
                </div>
              ))}
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
