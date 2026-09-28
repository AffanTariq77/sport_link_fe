import { formatMoney } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';
import { recordVisit, scheduleVisit, setBilling, setBranchStatus } from '../actions';

const STATUSES = ['pending_visit', 'live', 'draft', 'hidden', 'suspended', 'banned'] as const;
const statusName: Record<string, string> = {
  pending_visit: 'Waiting for visit',
  live: 'Live',
  draft: 'Draft',
  hidden: 'Hidden',
  suspended: 'Suspended',
  banned: 'Banned',
};

export default async function Venues(props: PageProps<'/venues'>) {
  const q = await props.searchParams;
  const status = STATUSES.find((s) => s === q.status) ?? 'pending_visit';
  const { data } = await api.GET('/admin/branches', { params: { query: { status } }, headers: await adminHeaders() });
  return (
    <>
      <h1 className="text-2xl font-semibold">Venues</h1>
      {q.done && <p className="text-sm">Saved.</p>}
      <nav className="flex flex-wrap gap-2 text-sm">
        {STATUSES.map((s) => (
          <Link key={s} href={`/venues?status=${s}`} className={`rounded-full border px-3 py-1 ${s === status ? 'border-neutral-900 font-semibold' : ''}`}>
            {statusName[s]}
          </Link>
        ))}
      </nav>
      {data?.length === 0 && <p>No venues here.</p>}
      {data?.map((b) => (
        <section key={b.id} className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
          <div>
            <p className="text-base font-semibold">{b.name}</p>
            <p>
              {b.address}, {b.city} · {b.courtCount} {b.courtCount === 1 ? 'court' : 'courts'}
            </p>
            <p>
              {b.vendor.businessName} ({b.vendor.status}) · owner {b.owner.name ?? 'no name'}, identity{' '}
              <span className="font-medium">{b.ownerVerification}</span>
            </p>
            <p>
              Billing:{' '}
              {b.vendor.billingModel === 'percentage'
                ? `${(b.vendor.commissionBps ?? 0) / 100}% commission`
                : `${formatMoney(b.vendor.monthlyFee ?? 0, 'PKR')} a month`}
            </p>
            {b.visit && (
              <p>
                Site visit: {b.visit.result}
                {b.visit.scheduledAt && `, ${new Date(b.visit.scheduledAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })}`}
                {b.visit.notes && ` · ${b.visit.notes}`}
              </p>
            )}
          </div>
          {b.status === 'pending_visit' && (
            <div className="grid gap-4 md:grid-cols-2">
              <ActionForm action={scheduleVisit.bind(null, b.id)} button="Schedule visit">
                <label className={labelClass}>
                  Visit date and time (Pakistan time)
                  <input type="datetime-local" name="scheduledAt" required className={input} />
                </label>
              </ActionForm>
              <ActionForm action={recordVisit.bind(null, b.id)} button="Record visit">
                <fieldset className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="decision" value="pass" required /> Passed: goes live
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="decision" value="fail" /> Failed
                  </label>
                </fieldset>
                <label className={labelClass}>
                  Notes, shown to the vendor
                  <input name="notes" maxLength={2000} className={input} />
                </label>
              </ActionForm>
            </div>
          )}
          <details>
            <summary className="cursor-pointer">Billing and status</summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <ActionForm action={setBilling.bind(null, b.vendor.id)} button="Save billing">
                <label className={labelClass}>
                  Model
                  <select name="billingModel" defaultValue={b.vendor.billingModel} className={input}>
                    <option value="percentage">Commission per booking</option>
                    <option value="monthly">Monthly plan</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Percent, or rupees a month
                  <input
                    name="value"
                    inputMode="decimal"
                    required
                    defaultValue={
                      b.vendor.billingModel === 'percentage'
                        ? (b.vendor.commissionBps ?? 0) / 100
                        : (b.vendor.monthlyFee ?? 0) / 100
                    }
                    className={input}
                  />
                </label>
              </ActionForm>
              <ActionForm action={setBranchStatus.bind(null, b.id)} button="Change status">
                <label className={labelClass}>
                  New status
                  <select name="status" defaultValue="suspended" className={input}>
                    <option value="live">Live</option>
                    <option value="hidden">Hidden from search</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Reason
                  <input name="reason" required minLength={3} maxLength={500} className={input} />
                </label>
              </ActionForm>
            </div>
          </details>
        </section>
      ))}
    </>
  );
}
