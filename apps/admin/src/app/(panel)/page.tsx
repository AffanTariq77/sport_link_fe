import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';

export default async function Overview() {
  const { data } = await api.GET('/admin/overview', { headers: await adminHeaders() });
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
    </>
  );
}
