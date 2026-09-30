import { formatMoney } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { uploadInvoiceProof } from '../setup-actions';

export const metadata: Metadata = { title: 'Billing · SportsLink' };

const statusText: Record<string, string> = {
  issued: 'To pay',
  overdue: 'Overdue',
  paid: 'Paid',
  written_off: 'Written off',
  draft: 'Draft',
  void: 'Void',
};
const month = (d: string) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`));
const day = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' }).format(new Date(iso));

export default async function BillingPage(props: PageProps<'/vendor/billing'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { saved } = await props.searchParams;
  const { data } = await api.GET('/vendor/billing', { headers: await authHeaders() });
  if (!data?.length) redirect('/vendor');

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/vendor" className="text-sm underline">
        Vendor
      </Link>
      <h1 className="text-2xl font-semibold">Billing</h1>
      {saved && <p className="rounded-xl border bg-card p-3 text-sm">Proof uploaded. Our finance team will confirm it.</p>}
      {data.map((v) => (
        <div key={v.vendorId} className="flex flex-col gap-4">
          <section className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-semibold">So far in {month(v.running.periodStart)}</p>
            <p className="text-2xl font-semibold">{formatMoney(v.running.amount, v.running.currency)}</p>
            <p>
              {v.running.billingModel === 'percentage'
                ? `${v.running.bookings} completed ${v.running.bookings === 1 ? 'booking' : 'bookings'} at ${(v.running.commissionBps ?? 0) / 100}% commission`
                : `Monthly plan of ${formatMoney(v.running.monthlyFee ?? 0, v.running.currency)}`}
            </p>
            <p className="text-xs">You are invoiced on the 1st of each month for the month before.</p>
          </section>
          <section className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-semibold">How to pay SportsLink</p>
            <p className="whitespace-pre-wrap">{v.payTo || 'Our payment details are sent with your invoice.'}</p>
          </section>
          <h2 className="text-lg font-semibold">Invoices</h2>
          {v.invoices.length === 0 && <p className="text-sm">No invoices yet.</p>}
          {v.invoices.map((inv) => (
            <details key={inv.id} className="rounded-xl border bg-card p-4 text-sm" open={inv.status === 'issued' || inv.status === 'overdue'}>
              <summary className="cursor-pointer font-medium">
                {month(inv.periodStart)} · {formatMoney(inv.amount, inv.currency)} · {statusText[inv.status] ?? inv.status}
                {inv.dueAt && (inv.status === 'issued' || inv.status === 'overdue') && ` · due ${day(inv.dueAt)}`}
              </summary>
              <ul className="mt-2 flex flex-col gap-1">
                {inv.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{l.description}</span>
                    <span>{formatMoney(l.amount, inv.currency)}</span>
                  </li>
                ))}
              </ul>
              {(inv.status === 'issued' || inv.status === 'overdue') && (
                <div className="mt-3">
                  {inv.proofUploaded && <p className="mb-2">Proof uploaded. Waiting for our finance team.</p>}
                  <ActionForm action={uploadInvoiceProof.bind(null, v.vendorId, inv.id)} button={inv.proofUploaded ? 'Upload again' : 'Upload proof of payment'}>
                    <input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required className={input} />
                  </ActionForm>
                </div>
              )}
            </details>
          ))}
        </div>
      ))}
    </main>
  );
}
