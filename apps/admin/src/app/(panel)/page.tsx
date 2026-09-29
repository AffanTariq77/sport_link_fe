import { formatMoney } from '@sportslink/api-client';
import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';

export default async function Overview() {
  const headers = await adminHeaders();
  const [{ data }, { data: a }] = await Promise.all([api.GET('/admin/overview', { headers }), api.GET('/admin/analytics', { headers })]);
  const cards = [
    ['/verifications', 'Identity checks waiting', data?.verificationsPending],
    ['/venues', 'Venues waiting for a visit', data?.venuesPending],
    ['/payment-accounts', 'Payment accounts to approve', data?.accountsPending],
    ['/reports', 'Open reports and disputes', data?.reportsOpen],
  ] as const;
  return (
    <>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(([href, label, count]) => (
          <Link key={href} href={href} className="rounded-lg border p-4 hover:border-neutral-900">
            <p className="text-3xl font-semibold">{count ?? '–'}</p>
            <p className="text-sm">{label}</p>
          </Link>
        ))}
      </div>
      {a && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Last 30 days</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              [a.bookingValue.map((v) => formatMoney(v.amount, v.currency)).join(' + ') || formatMoney(0, 'PKR'), `booking value (${a.bookingValue.reduce((n, v) => n + v.count, 0)} bookings)`],
              [formatMoney(a.commission.collected, 'PKR'), `commission collected · ${formatMoney(a.commission.due, 'PKR')} due`],
              [String(a.activeUsers), `active players · ${a.newUsers} new`],
              [a.retention === null ? '–' : `${a.retention}%`, 'kept from the 30 days before'],
            ].map(([big, small]) => (
              <div key={small} className="rounded-lg border p-4">
                <p className="text-xl font-semibold">{big}</p>
                <p className="text-sm">{small}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <h3 className="font-semibold">Top venues</h3>
              {a.topVenues.map((v) => (
                <p key={v.branchId}>
                  {v.name}, {v.city}: {v.bookings}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">Cities</h3>
              {a.cities.map((c) => (
                <p key={c.city}>
                  {c.city}: {c.bookings}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">Sports</h3>
              {a.sports.map((x) => (
                <p key={x.sport}>
                  {x.sport}: {x.bookings}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
