import { bookingStatusText, formatDay, formatMoney, formatTime, nextDates } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { blockSlot, manualBooking, markNoShow } from '../setup-actions';

export const metadata: Metadata = { title: 'Calendar · SportsLink' };

const sourceText: Record<string, string> = { app: 'App booking', manual: 'Walk-in', block: 'Blocked' };
const chip = 'rounded-full border px-3 py-1 text-sm';

/** Yesterday (to mark no-shows) and the next seven days at the venue. */
function calendarDays(timeZone: string) {
  const yesterday = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(Date.now() - 86_400_000));
  return [yesterday, ...nextDates(timeZone, 7)];
}
const hasStarted = (iso: string) => new Date(iso).getTime() <= Date.now();
const on = 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900';

export default async function CalendarPage(props: PageProps<'/vendor/calendar'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const q = await props.searchParams;
  const headers = await authHeaders();
  const { data: access } = await api.GET('/vendor/access', { headers });
  const all = access?.vendors.flatMap((v) => v.branches) ?? [];
  if (!all.length) redirect('/vendor');
  const branch = all.find((b) => b.id === q.branch) ?? all[0]!;
  const days = calendarDays(branch.timezone);
  const date = typeof q.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.date) ? q.date : days[1]!;
  const back = `/vendor/calendar?branch=${branch.id}&date=${date}`;
  const { data: day, error } = await api.GET('/vendor/calendar', {
    params: { query: { branchId: branch.id, date } },
    headers,
  });
  const tz = branch.timezone;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 p-6">
      <Link href="/vendor" className="text-sm underline">
        Vendor
      </Link>
      <h1 className="text-2xl font-semibold">Calendar</h1>
      {all.length > 1 && (
        <nav className="flex flex-wrap gap-2">
          {all.map((b) => (
            <Link key={b.id} href={`/vendor/calendar?branch=${b.id}&date=${date}`} className={`${chip} ${b.id === branch.id ? on : ''}`}>
              {b.name}
            </Link>
          ))}
        </nav>
      )}
      <nav aria-label="Day" className="flex flex-wrap gap-2">
        {days.map((d) => (
          <Link key={d} href={`/vendor/calendar?branch=${branch.id}&date=${d}`} className={`${chip} ${d === date ? on : ''}`}>
            {formatDay(`${d}T12:00:00Z`, 'UTC')}
          </Link>
        ))}
      </nav>
      {error && <p>{error.message}</p>}
      {day?.courts.map((court) => (
        <section key={court.id} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{court.name}</h2>
          {court.slots.length === 0 && <p className="text-sm">Closed on this day.</p>}
          <ul className="flex flex-col gap-2">
            {court.slots.map((s) => {
              const booking = court.bookings.find((b) => b.startAt < s.endAt && b.endAt > s.startAt);
              const time = `${formatTime(s.startAt, tz)} to ${formatTime(s.endAt, tz)}`;
              if (booking) {
                return (
                  <li key={s.startAt} className="rounded-md border border-neutral-900 p-3 text-sm">
                    <p className="font-medium">
                      {time} · {sourceText[booking.source]} · {booking.name ?? 'Player'}
                    </p>
                    <p>
                      {booking.source === 'block' ? 'Not bookable' : bookingStatusText[booking.status] ?? booking.status}
                      {booking.source !== 'block' && ` · ${formatMoney(booking.total, booking.currency)}`}
                      {booking.customerPhone && ` · ${booking.customerPhone}`}
                    </p>
                    {booking.status === 'confirmed' && booking.source !== 'block' && hasStarted(booking.startAt) && (
                      <ActionForm action={markNoShow.bind(null, back, booking.id)} button="Mark as no-show" className="mt-2 flex" />
                    )}
                  </li>
                );
              }
              const past = hasStarted(s.startAt);
              return (
                <li key={s.startAt} className="rounded-md border p-3 text-sm">
                  <p>{time} · free</p>
                  {!past && (
                    <details className="mt-1">
                      <summary className="cursor-pointer underline">Add a walk-in or block this slot</summary>
                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        <ActionForm action={manualBooking.bind(null, back)} button="Book walk-in">
                          <input type="hidden" name="courtId" value={court.id} />
                          <input type="hidden" name="startAt" value={s.startAt} />
                          <input type="hidden" name="endAt" value={s.endAt} />
                          <input name="customerName" required maxLength={80} placeholder="Customer name" className={input} />
                          <input name="customerPhone" maxLength={20} placeholder="Phone (optional, private)" className={input} />
                        </ActionForm>
                        <ActionForm action={blockSlot.bind(null, back)} button="Block">
                          <input type="hidden" name="courtId" value={court.id} />
                          <input type="hidden" name="startAt" value={s.startAt} />
                          <input type="hidden" name="endAt" value={s.endAt} />
                          <input name="reason" required maxLength={120} placeholder="Reason, for example maintenance" className={input} />
                        </ActionForm>
                      </div>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
