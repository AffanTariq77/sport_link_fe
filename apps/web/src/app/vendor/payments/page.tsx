import { formatDay, formatMoney, formatTime, paymentMethodName } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { Decision } from './decision';

export const metadata: Metadata = { title: 'Payments to check · SportsLink' };

export default async function VendorPaymentsPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const [{ data: access }, { data: queue }] = await Promise.all([
    api.GET('/vendor/access', { headers }),
    api.GET('/vendor/payments', { headers }),
  ]);
  if (!access?.vendors.length) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-semibold">Payments to check</h1>
      <p className="text-sm">
        Check each transaction ID in your account before confirming. Your confirmation is what confirms the booking.
      </p>
      {queue?.length === 0 && <p>Nothing to check right now.</p>}
      <ul className="flex flex-col gap-3">
        {queue?.map((q) => {
          const tz = q.branch.timezone;
          return (
            <li key={q.id} className="rounded-xl border bg-card p-4 text-sm">
              <p className="font-semibold">
                {formatMoney(q.series?.advanceTotal ?? q.advanceAmount, q.booking.currency)} by {paymentMethodName[q.method ?? ''] ?? q.method}
              </p>
              {q.series && <p className="font-medium">Weekly booking: one payment for {q.series.weeks} weeks, starting with this slot.</p>}
              <p>
                Transaction ID <span className="font-mono">{q.txnReference}</span>
              </p>
              <p>
                {q.playerName ?? 'Player'} · {q.branch.name}, {q.court} · {formatDay(q.booking.startAt, tz)},{' '}
                {formatTime(q.booking.startAt, tz)} to {formatTime(q.booking.endAt, tz)}
              </p>
              {q.booking.paymentDeadlineAt && <p>Confirm by {formatTime(q.booking.paymentDeadlineAt, tz)}</p>}
              <Decision id={q.id} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
