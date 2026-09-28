import { formatMoney } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';
import { runBilling, settleInvoice } from '../actions';

const STATUSES = ['issued', 'overdue', 'paid', 'written_off'] as const;
const name: Record<string, string> = { issued: 'Issued', overdue: 'Overdue', paid: 'Paid', written_off: 'Written off' };

export default async function Invoices(props: PageProps<'/invoices'>) {
  const q = await props.searchParams;
  const status = STATUSES.find((s) => s === q.status) ?? 'issued';
  const { data } = await api.GET('/admin/invoices', { params: { query: { status } }, headers: await adminHeaders() });
  return (
    <>
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <p className="text-sm">Invoices are issued on the 1st of each month. Overdue invoices hide the venue at 21 days and block the vendor at 30.</p>
      <ActionForm action={runBilling} button="Run billing now" className="flex items-center gap-3 text-sm" />
      {q.done && <p className="text-sm">Saved.</p>}
      <nav className="flex flex-wrap gap-2 text-sm">
        {STATUSES.map((s) => (
          <Link key={s} href={`/invoices?status=${s}`} className={`rounded-full border px-3 py-1 ${s === status ? 'border-neutral-900 font-semibold' : ''}`}>
            {name[s]}
          </Link>
        ))}
      </nav>
      {data?.length === 0 && <p>No invoices here.</p>}
      {data?.map((inv) => (
        <section key={inv.id} className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <p className="text-base font-semibold">
            {inv.vendor.businessName} · {inv.periodStart.slice(0, 7)} · {formatMoney(inv.amount, inv.currency)}
          </p>
          <p>
            {name[inv.status] ?? inv.status} · vendor {inv.vendor.status}
            {inv.dueAt && ` · due ${new Date(inv.dueAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi' })}`}
          </p>
          {inv.proofUploaded && (
            <a href={`/invoice-proof/${inv.id}`} target="_blank" rel="noreferrer" className="underline">
              View proof of payment
            </a>
          )}
          {(inv.status === 'issued' || inv.status === 'overdue') && (
            <ActionForm action={settleInvoice.bind(null, inv.id)} button="Save">
              <fieldset className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input type="radio" name="decision" value="paid" required /> Payment received
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="decision" value="write_off" /> Write off
                </label>
              </fieldset>
              <label className={labelClass}>
                Reason (for a write-off)
                <input name="reason" maxLength={500} className={input} />
              </label>
            </ActionForm>
          )}
        </section>
      ))}
    </>
  );
}
