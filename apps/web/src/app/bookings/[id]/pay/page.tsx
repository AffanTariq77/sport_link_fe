import { formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { PayForm } from './pay-form';

export const metadata: Metadata = { title: 'Pay advance · SportsLink' };

export default async function PayPage(props: PageProps<'/bookings/[id]/pay'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { data: info } = await api.GET('/bookings/{id}/payment', {
    params: { path: { id } },
    headers: await authHeaders(),
  });
  if (!info) notFound();
  const tz = info.timezone;
  const waiting = info.payments.some((p) => p.status === 'submitted');
  const rejected = info.payments.at(-1)?.status === 'rejected';
  const canPay = info.status === 'held' || (info.status === 'pending_payment' && !waiting);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-6">
      <Link href="/bookings" className="text-sm underline">
        My bookings
      </Link>
      <h1 className="text-2xl font-semibold">Pay the advance</h1>
      <p>
        Advance {formatMoney(info.advanceDue, info.currency)} of {formatMoney(info.total, info.currency)}. You pay the
        rest at the venue.
      </p>
      {info.status === 'held' && info.holdExpiresAt && (
        <p className="text-sm">Pay before {formatTime(info.holdExpiresAt, tz)} or the slot is released.</p>
      )}
      {waiting && (
        <p className="rounded-xl border bg-card p-3 text-sm">
          The venue is checking your payment
          {info.paymentDeadlineAt ? ` and should confirm by ${formatTime(info.paymentDeadlineAt, tz)}` : ''}.
        </p>
      )}
      {rejected && (
        <p className="rounded-xl border bg-card p-3 text-sm">
          The venue could not find your last payment. Check the transaction ID and submit it again.
        </p>
      )}
      {info.status === 'confirmed' && <p className="rounded-xl border bg-card p-3 text-sm">Your booking is confirmed.</p>}
      {!canPay && !waiting && info.status !== 'confirmed' && <p>This booking can no longer be paid.</p>}
      {canPay && <PayForm bookingId={id} info={info} />}
    </main>
  );
}
