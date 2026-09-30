import { formatMoney } from '@sportslink/api-client';
import { Ban, CalendarCheck, Gauge, Wallet, type LucideIcon } from 'lucide-react';
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
const HEAT = ['var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)', 'var(--heat-5)'];
const card = 'rounded-2xl border bg-card p-4';
const h2 = 'text-xs font-extrabold uppercase tracking-widest text-muted';

function Stat({ icon: Icon, value, label, children }: { icon: LucideIcon; value: string | number; label: string; children?: React.ReactNode }) {
  return (
    <div className={`${card} flex flex-col gap-2`}>
      <span className="grid size-9 place-items-center rounded-full bg-accent/15 text-navy dark:text-accent">
        <Icon size={18} aria-hidden />
      </span>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {children}
    </div>
  );
}

/** Monthly average stars as a line on a fixed 1 to 5 scale, so small wobbles do not look like cliffs. */
function RatingLine({ trend }: { trend: { month: string; average: number; count: number }[] }) {
  const w = 600;
  const h = 160;
  const pad = { l: 28, r: 16, t: 12, b: 24 };
  const x = (i: number) => pad.l + (trend.length === 1 ? (w - pad.l - pad.r) / 2 : (i * (w - pad.l - pad.r)) / (trend.length - 1));
  const y = (v: number) => pad.t + ((5 - v) * (h - pad.t - pad.b)) / 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Average rating by month">
      {[1, 2, 3, 4, 5].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
            {v}
          </text>
        </g>
      ))}
      <polyline points={trend.map((t, i) => `${x(i)},${y(t.average)}`).join(' ')} fill="none" stroke="var(--chart-app)" strokeWidth="2" strokeLinejoin="round" />
      {trend.map((t, i) => (
        <g key={t.month}>
          <circle cx={x(i)} cy={y(t.average)} r="5" fill="var(--chart-app)" stroke="var(--card)" strokeWidth="2" />
          <circle cx={x(i)} cy={y(t.average)} r="14" fill="transparent">
            <title>{`${t.month}: ${t.average} stars from ${t.count} ${t.count === 1 ? 'review' : 'reviews'}`}</title>
          </circle>
          <text x={x(i)} y={h - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">
            {t.month}
          </text>
        </g>
      ))}
      {trend.length > 0 && (
        <text x={x(trend.length - 1)} y={y(trend.at(-1)!.average) - 10} textAnchor="end" fontSize="12" fontWeight="700" fill="var(--foreground)">
          {trend.at(-1)!.average}★
        </text>
      )}
    </svg>
  );
}

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
  const split = a.revenue.total || 1;
  const courts = [...a.revenue.byCourt].sort((x, y) => y.revenue - x.revenue);
  const top = Math.max(1, ...courts.map((c) => c.revenue));
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <Link href="/vendor" className="text-sm underline">
        Vendor
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl">Analytics</h1>
        <nav aria-label="Period" className="flex gap-1 rounded-full border bg-card p-1 text-sm font-bold">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/vendor/analytics?days=${d}`}
              aria-current={d === days ? 'page' : undefined}
              className={`rounded-full px-3 py-1 ${d === days ? 'bg-navy text-white hover:text-white' : 'text-muted'}`}
            >
              {d} days
            </Link>
          ))}
        </nav>
      </div>
      {q.done === 'reply' && <p className="rounded-xl border bg-card p-3 text-sm">Reply posted.</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CalendarCheck} value={a.bookings.total} label={`bookings · ${a.bookings.app} app, ${a.bookings.manual} walk-in`} />
        <Stat icon={Wallet} value={money(a.revenue.total)} label="booking value" />
        <Stat icon={Gauge} value={`${a.occupancy.percent}%`} label="of open hours booked">
          <span className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
            <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, a.occupancy.percent)}%` }} />
          </span>
        </Stat>
        <Stat icon={Ban} value={a.cancellations.total} label={`cancelled · ${a.cancellations.byPlayer} by players, ${a.cancellations.byVenue} by you · ${a.bookings.noShows} no-shows`} />
      </div>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className={h2}>Where the money comes from</h2>
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-surface">
          {a.revenue.app > 0 && <span title={`App ${money(a.revenue.app)}`} style={{ width: `${(a.revenue.app / split) * 100}%`, background: 'var(--chart-app)' }} />}
          {a.revenue.manual > 0 && <span title={`Walk-ins and phone ${money(a.revenue.manual)}`} style={{ width: `${(a.revenue.manual / split) * 100}%`, background: 'var(--chart-manual)' }} />}
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ background: 'var(--chart-app)' }} aria-hidden />
            From the app <span className="font-bold">{money(a.revenue.app)}</span>
            <span className="text-muted">{Math.round((a.revenue.app / split) * 100)}%</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ background: 'var(--chart-manual)' }} aria-hidden />
            Walk-ins and phone <span className="font-bold">{money(a.revenue.manual)}</span>
            <span className="text-muted">{Math.round((a.revenue.manual / split) * 100)}%</span>
          </li>
        </ul>
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className={h2}>Busy hours</h2>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th />
                {HOURS.map((h) => (
                  <th key={h} className="px-0.5 font-normal text-muted">
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d, wd) => (
                <tr key={d}>
                  <th className="pr-2 text-left font-bold">{d}</th>
                  {HOURS.map((h) => {
                    const n = a.occupancy.heatmap[wd]?.[h] ?? 0;
                    return (
                      <td
                        key={h}
                        title={`${d} ${String(h).padStart(2, '0')}:00, ${n} booked ${n === 1 ? 'hour' : 'hours'}`}
                        className="size-6 rounded"
                        style={{ background: n ? HEAT[Math.min(4, Math.ceil((5 * n) / peak) - 1)] : 'var(--surface)' }}
                      >
                        <span className="sr-only">{n}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          Quiet
          {HEAT.map((c) => (
            <span key={c} className="size-3 rounded-sm" style={{ background: c }} aria-hidden />
          ))}
          Busy
        </p>
      </section>

      <section className={`${card} flex flex-col gap-3`}>
        <h2 className={h2}>By court</h2>
        {courts.length === 0 && <p className="text-sm">No bookings in this period.</p>}
        <ul className="flex flex-col gap-3 text-sm">
          {courts.map((c) => (
            <li key={c.courtId} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3">
              <span className="truncate font-semibold" title={`${c.branch}, ${c.court}`}>
                {c.court}
                <span className="block truncate text-xs font-normal text-muted">{c.branch}</span>
              </span>
              <span className="h-3 overflow-hidden rounded-r bg-surface" aria-hidden>
                <span className="block h-full rounded-r" style={{ width: `${(c.revenue / top) * 100}%`, background: 'var(--chart-app)' }} />
              </span>
              <span className="text-right">
                <span className="font-bold">{money(c.revenue)}</span>
                <span className="block text-xs text-muted">
                  {c.bookings} {c.bookings === 1 ? 'booking' : 'bookings'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {calc && (
        <section className={`${card} flex flex-col gap-2 text-sm`}>
          <h2 className={h2}>Revenue calculator</h2>
          <p>
            The next 30 days at {calc.occupancy}% occupancy:
          </p>
          <p className="text-3xl font-black">
            {money(calc.projected)} <span className="text-sm font-normal text-muted">of {money(calc.fullMonth)} fully booked</span>
          </p>
          <form className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="days" value={days} />
            <label className="flex items-center gap-2">
              Occupancy %
              <input name="occupancy" type="number" min={0} max={100} defaultValue={calc.occupancy} className={`${input} w-24`} />
            </label>
            <button className="rounded-full bg-navy px-4 py-2 font-bold text-white">Recalculate</button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-3 text-sm">
        <h2 className={h2}>Reviews</h2>
        {a.ratingTrend.length > 1 && (
          <div className={card}>
            <RatingLine trend={a.ratingTrend} />
            <details className="text-xs">
              <summary className="text-muted">Show as a table</summary>
              <table className="mt-2">
                <tbody>
                  {a.ratingTrend.map((t) => (
                    <tr key={t.month}>
                      <th className="pr-4 text-left font-normal">{t.month}</th>
                      <td className="pr-4">{t.average}★</td>
                      <td>
                        {t.count} {t.count === 1 ? 'review' : 'reviews'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        )}
        {a.ratingTrend.length === 1 && (
          <p>
            {a.ratingTrend[0].month}: {a.ratingTrend[0].average}★ from {a.ratingTrend[0].count}
          </p>
        )}
        {a.reviews.length === 0 && <p>No reviews yet. Players can review you after they play.</p>}
        {a.reviews.map((r) => (
          <div key={r.id} className={`${card} flex flex-col gap-2`}>
            <p>
              <span className="text-accent-text" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}
                <span className="text-line">{'★'.repeat(5 - r.stars)}</span>
              </span>{' '}
              · {r.branch}
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
