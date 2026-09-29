import { formatMoney } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { replyToReview } from './actions';

export const metadata: Metadata = { title: 'Analytics · SportsLink' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

export default async function VendorAnalytics(props: PageProps<'/vendor/analytics'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const q = await props.searchParams;
  const days = q.days === '7' || q.days === '90' ? Number(q.days) : 30;
  const occupancy = typeof q.occupancy === 'string' && q.occupancy ? Number(q.occupancy) : undefined;
  const headers = await authHeaders();
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const [{ data: a, error }, { data: calc }] = await Promise.all([
    api.GET('/vendor/analytics', { headers, params: { query: { from: iso(from), to: iso(new Date(to.getTime() + 86_400_000)) } } }),
    api.GET('/vendor/analytics/calculator', { headers, params: { query: { occupancy } } }),
  ]);
  if (!a) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-6">
        <Link href="/vendor" className="text-sm underline">
          Vendor
        </Link>
        <p role="alert">{error?.message ?? 'Analytics are not available.'}</p>
      </main>
    );
  }
  const money = (n: number) => formatMoney(n, a.currency);
  const peak = Math.max(1, ...a.occupancy.heatmap.flat());
  const card = 'rounded-lg border p-4';
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 p-6">
      <Link href="/vendor" className="text-sm underline">
        Vendor
      </Link>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      {q.done === 'reply' && <p className="rounded-md border p-3 text-sm">Reply posted.</p>}
      <nav aria-label="Period" className="flex gap-2 text-sm">
        {[7, 30, 90].map((d) => (
          <Link key={d} href={`/vendor/analytics?days=${d}`} className={`rounded-full border px-3 py-1 ${d === days ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''}`}>
            Last {d} days
          </Link>
        ))}
      </nav>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={card}>
          <p className="text-2xl font-semibold">{a.bookings.total}</p>
          <p className="text-sm">
            bookings ({a.bookings.app} app, {a.bookings.manual} walk-in)
          </p>
        </div>
        <div className={card}>
          <p className="text-2xl font-semibold">{money(a.revenue.total)}</p>
          <p className="text-sm">booking value</p>
        </div>
        <div className={card}>
          <p className="text-2xl font-semibold">{a.occupancy.percent}%</p>
          <p className="text-sm">of open hours booked</p>
        </div>
        <div className={card}>
          <p className="text-2xl font-semibold">{a.cancellations.total}</p>
          <p className="text-sm">
            cancelled ({a.cancellations.byPlayer} by players, {a.cancellations.byVenue} by you) · {a.bookings.noShows} no-shows
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Busy hours</h2>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th />
                {HOURS.map((h) => (
                  <th key={h} className="px-1 font-normal">
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d, wd) => (
                <tr key={d}>
                  <th className="pr-2 text-left font-normal">{d}</th>
                  {HOURS.map((h) => {
                    const n = a.occupancy.heatmap[wd]?.[h] ?? 0;
                    return (
                      <td
                        key={h}
                        title={`${d} ${h}:00, ${n} booked hours`}
                        className="h-6 w-6 border border-white dark:border-neutral-900"
                        style={{ backgroundColor: n ? `rgba(22, 163, 74, ${0.15 + (0.85 * n) / peak})` : 'transparent' }}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2 text-sm">
        <h2 className="text-lg font-semibold">By court</h2>
        {a.revenue.byCourt.map((c) => (
          <p key={c.courtId}>
            {c.branch}, {c.court}: {c.bookings} bookings · {money(c.revenue)}
          </p>
        ))}
        <p>
          From the app {money(a.revenue.app)} · walk-ins and phone bookings {money(a.revenue.manual)}
        </p>
      </section>

      {calc && (
        <section className={`${card} flex flex-col gap-2 text-sm`}>
          <h2 className="text-lg font-semibold">Revenue calculator</h2>
          <p>
            The next 30 days at {calc.occupancy}% occupancy: <span className="font-semibold">{money(calc.projected)}</span> (fully booked {money(calc.fullMonth)}).
          </p>
          <form className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="days" value={days} />
            <label className="flex items-center gap-2">
              Occupancy %
              <input name="occupancy" type="number" min={0} max={100} defaultValue={calc.occupancy} className={`${input} w-24`} />
            </label>
            <button className="rounded-md border px-3 py-2 font-medium">Recalculate</button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-3 text-sm">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {a.ratingTrend.length > 0 && (
          <p>
            Rating by month:{' '}
            {a.ratingTrend.map((t) => `${t.month} ${t.average}★ (${t.count})`).join(' · ')}
          </p>
        )}
        {a.reviews.length === 0 && <p>No reviews yet. Players can review you after they play.</p>}
        {a.reviews.map((r) => (
          <div key={r.id} className={`${card} flex flex-col gap-2`}>
            <p>
              {'★'.repeat(r.stars)} · {r.branch}
            </p>
            {r.comment && <p>{r.comment}</p>}
            {r.reply ? (
              <p className="border-l-2 pl-2">You replied: {r.reply}</p>
            ) : (
              <ActionForm action={replyToReview.bind(null, r.id)} button="Reply" className="flex flex-wrap items-center gap-2">
                <input name="reply" required maxLength={500} aria-label="Reply" className={input} />
              </ActionForm>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
