import { formatDay, formatMoney, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { submitSeriesPayment } from '../../../actions';
import { PayForm } from '../../../[id]/pay/pay-form';

export const metadata: Metadata = { title: 'Pay for every week · SportsLink' };

export default async function SeriesPayPage(props: PageProps<'/bookings/series/[id]/pay'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const headers = await authHeaders();
  const weeks = ((await api.GET('/bookings/mine', { headers })).data ?? [])
    .filter((b) => b.seriesId === id && b.status === 'held')
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  if (!weeks.length) notFound();
  const first = weeks[0]!;
  const { data: info } = await api.GET('/bookings/{id}/payment', { params: { path: { id: first.id } }, headers });
  if (!info) notFound();
  const tz = first.venue.timezone;
  const total = weeks.reduce((s, w) => s + w.advanceDue, 0);
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-6">
      <Link href="/bookings" className="text-sm underline">
        My bookings
      </Link>
      <h1 className="text-2xl font-semibold">Pay for every week</h1>
      <p>
        {first.venue.name}, {first.court.name}: {weeks.length} weeks. Send one transfer of {formatMoney(total, first.currency)} for all the advances.
      </p>
      <ul className="text-sm">
        {weeks.map((w) => (
          <li key={w.id}>
            {formatDay(w.startAt, tz)}, {formatTime(w.startAt, tz)} · advance {formatMoney(w.advanceDue, w.currency)}
          </li>
        ))}
      </ul>
      {first.holdExpiresAt && <p className="text-sm">Pay before {formatTime(first.holdExpiresAt, tz)} or the weeks are released.</p>}
      <PayForm bookingId={first.id} info={info} submit={submitSeriesPayment.bind(null, id)} />
    </main>
  );
}
