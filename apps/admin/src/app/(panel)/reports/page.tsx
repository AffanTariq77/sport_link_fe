import { ActionForm, input, labelClass } from '@sportslink/ui';
import { adminHeaders, api } from '@/lib/api';
import { resolveReport } from '../actions';

const reasonText: Record<string, string> = {
  duplicate_document: 'Identity document already used by another account',
  duplicate_transaction_reference: 'Payment reference already used for another booking',
  payment_rejected: 'Vendor rejected a payment (dispute)',
};

export default async function Reports(props: PageProps<'/reports'>) {
  const { done } = await props.searchParams;
  const { data } = await api.GET('/admin/reports', { headers: await adminHeaders() });
  return (
    <>
      <h1 className="text-2xl font-semibold">Reports and disputes</h1>
      <p className="text-sm">Reports involving minors are shown first.</p>
      {done && <p className="text-sm">Saved.</p>}
      {data?.length === 0 && <p>Nothing open.</p>}
      {data?.map((r) => (
        <section key={r.id} className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <p className="text-base font-semibold">
            {r.involvesMinor && 'Minor involved · '}
            {reasonText[r.reason] ?? r.reason}
          </p>
          <p>
            {r.targetType} {r.targetId.slice(0, 8)} · from {r.reporterName ?? 'system'} ·{' '}
            {new Date(r.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })}
          </p>
          {r.details && <p>{r.details}</p>}
          <ActionForm action={resolveReport.bind(null, r.id)} button="Resolve">
            <fieldset className="flex gap-4">
              <label className="flex items-center gap-1">
                <input type="radio" name="decision" value="actioned" required /> Action taken
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="decision" value="dismissed" /> Dismiss
              </label>
            </fieldset>
            <label className={labelClass}>
              Note
              <input name="note" required minLength={3} maxLength={500} className={input} />
            </label>
          </ActionForm>
        </section>
      ))}
    </>
  );
}
