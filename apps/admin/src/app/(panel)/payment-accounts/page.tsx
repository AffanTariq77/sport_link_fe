import { paymentMethodName } from '@sportslink/api-client';
import { ActionForm } from '@sportslink/ui';
import { adminHeaders, api } from '@/lib/api';
import { decideAccount } from '../actions';

export default async function PaymentAccounts(props: PageProps<'/payment-accounts'>) {
  const { done } = await props.searchParams;
  const { data } = await api.GET('/admin/payment-accounts', {
    params: { query: { status: 'pending' } },
    headers: await adminHeaders(),
  });
  return (
    <>
      <h1 className="text-2xl font-semibold">Payment accounts</h1>
      <p className="text-sm">
        Approve only when the account title matches the owner&apos;s CNIC name. This blocks a fake account being
        swapped into a real listing.
      </p>
      {done && <p className="text-sm">Decision saved.</p>}
      {data?.length === 0 && <p>Nothing waiting.</p>}
      {data?.map((a) => (
        <section key={a.id} className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <p className="text-base font-semibold">
            {paymentMethodName[a.method] ?? a.method} · {a.vendor.businessName}
          </p>
          <p>
            Title <span className="font-medium">{a.accountTitle}</span> · owner on CNIC{' '}
            <span className="font-medium">{a.ownerName ?? 'no name'}</span>
            {a.ownerName && a.ownerName.toLowerCase() !== a.accountTitle.toLowerCase() && ' · names differ'}
          </p>
          {a.accountNumber && (
            <p>
              {a.bankName ? `${a.bankName} · ` : ''}
              <span className="font-mono">{a.accountNumber}</span>
            </p>
          )}
          {a.replacesAccountId && <p>Replaces an existing account, which stays in use until this is approved.</p>}
          <ActionForm action={decideAccount.bind(null, a.id)} button="Save decision" className="flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" name="decision" value="approve" required /> Approve
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="decision" value="reject" /> Reject
            </label>
          </ActionForm>
        </section>
      ))}
    </>
  );
}
