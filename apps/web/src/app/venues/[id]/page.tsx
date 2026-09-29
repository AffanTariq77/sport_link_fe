import { describePolicy, formatDay, formatMoney, formatTime, nextDates, paymentMethodName } from '@sportslink/api-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { currentUser } from '@/lib/session';
import { holdSlot } from '../../bookings/actions';

const chip = 'rounded-full border px-3 py-1 text-sm';
const on = 'border-neutral-900 bg-accent hover:opacity-90 text-white dark:border-white';

export default async function VenuePage(props: PageProps<'/venues/[id]'>) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const { data: venue } = await api.GET('/venues/{id}', { params: { path: { id } } });
  if (!venue) notFound();
  const { data: reviews } = await api.GET('/venues/{id}/reviews', { params: { path: { id } } });

  const court = venue.courts.find((c) => c.id === query.court) ?? venue.courts[0];
  const dates = nextDates(venue.timezone, 7);
  const date = typeof query.date === 'string' && dates.includes(query.date) ? query.date : dates[0]!;
  const [{ data: day }, user] = await Promise.all([
    court
      ? api.GET('/courts/{id}/slots', { params: { path: { id: court.id }, query: { date } } })
      : Promise.resolve({ data: undefined }),
    currentUser(),
  ]);
  const link = (c: string, d: string) => `/venues/${venue.id}?court=${c}&date=${d}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <Link href="/venues" className="text-sm underline">
          All venues
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{venue.name}</h1>
        <p className="text-sm">
          {venue.address}, {venue.city}
        </p>
        {venue.facilities.length > 0 && <p className="text-sm">{venue.facilities.join(', ').replaceAll('_', ' ')}</p>}
      </div>

      {venue.photos.length > 0 && (
        <ul className="-mx-6 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6" aria-label="Photos">
          {venue.photos.map((url, i) => (
            <li key={url} className="w-4/5 shrink-0 snap-start sm:w-2/3">
              {/* eslint-disable-next-line @next/next/no-img-element -- served by our own route */}
              <img src={url} alt={`${venue.name} photo ${i + 1}`} className="aspect-video w-full rounded-lg border object-cover" />
            </li>
          ))}
        </ul>
      )}

      {reviews && reviews.count > 0 && (
        <details className="rounded-lg border p-4 text-sm">
          <summary className="cursor-pointer font-semibold">
            {reviews.average} out of 5 · {reviews.count} {reviews.count === 1 ? 'review' : 'reviews'}
          </summary>
          <ul className="mt-2 flex flex-col gap-3">
            {reviews.reviews.map((r) => (
              <li key={r.id}>
                <p>
                  {'★'.repeat(r.stars)} · {r.author}
                </p>
                {r.comment && <p>{r.comment}</p>}
                {r.reply && <p className="border-l-2 pl-2">Venue: {r.reply}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <section className="flex flex-col gap-1 rounded-lg border p-4 text-sm">
        <h2 className="font-semibold">Before you book</h2>
        {describePolicy(venue.policy, venue.currency).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          You pay the venue directly
          {venue.paymentMethods.length ? ` by ${venue.paymentMethods.map((m) => paymentMethodName[m] ?? m).join(', ')}` : ''}.
        </p>
      </section>

      <nav aria-label="Court" className="flex flex-wrap gap-2">
        {venue.courts.map((c) => (
          <Link key={c.id} href={link(c.id, date)} className={`${chip} ${c.id === court?.id ? on : ''}`}>
            {c.name}
          </Link>
        ))}
      </nav>
      {court && (
        <nav aria-label="Day" className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <Link key={d} href={link(court.id, d)} className={`${chip} ${d === date ? on : ''}`}>
              {formatDay(`${d}T12:00:00Z`, 'UTC')}
            </Link>
          ))}
        </nav>
      )}

      {day && day.slots.length === 0 && <p>No slots on this day.</p>}
      {day && day.slots.length > 0 && (
        <form action={holdSlot} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <input type="hidden" name="courtId" value={court!.id} />
          {day.slots.map((s) => (
            <button
              key={s.startAt}
              name="slot"
              value={`${s.startAt}|${s.endAt}`}
              disabled={!s.available || !user}
              className="rounded-md border p-2 text-left text-sm enabled:hover:border-neutral-900 disabled:opacity-40"
            >
              <span className="block font-medium">
                {formatTime(s.startAt, venue.timezone)} to {formatTime(s.endAt, venue.timezone)}
              </span>
              <span className="block">{s.available ? formatMoney(s.price, day.currency) : 'Booked'}</span>
            </button>
          ))}
        </form>
      )}
      {user && venue.policy.recurringAllowed && court && day && day.slots.some((s) => s.available) && (
        <details className="rounded-lg border p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Book the same slot every week</summary>
          <form action="/bookings/weekly" className="mt-2 flex flex-wrap items-end gap-3">
            <input type="hidden" name="court" value={court.id} />
            <input type="hidden" name="venue" value={venue.id} />
            <label className="flex flex-col gap-1">
              Slot
              <select name="slot" className="rounded-md border px-3 py-2">
                {day.slots
                  .filter((s) => s.available)
                  .map((s) => (
                    <option key={s.startAt} value={`${s.startAt}|${s.endAt}`}>
                      {formatDay(s.startAt, venue.timezone)} {formatTime(s.startAt, venue.timezone)} to {formatTime(s.endAt, venue.timezone)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Weeks
              <input name="weeks" type="number" min={2} max={12} defaultValue={4} className="w-20 rounded-md border px-3 py-2" />
            </label>
            <button className="rounded-md border px-4 py-2 font-medium">Check the weeks</button>
          </form>
        </details>
      )}
      {!user && (
        <p className="text-sm">
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>{' '}
          to book a slot.
        </p>
      )}
    </main>
  );
}
