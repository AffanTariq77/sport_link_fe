import { paymentMethodName } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import { BranchFields } from '@/components/branch-fields';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { addAccount, applyAsVendor, createBranch } from './setup-actions';

export const metadata: Metadata = { title: 'Vendor · SportsLink' };

const vendorStatusText: Record<string, string> = {
  applied: 'Application received. Set up your venue and send it for review.',
  under_review: 'We are reviewing your application.',
  approved: 'Approved.',
  rejected: 'Your application was not approved.',
  suspended: 'Your vendor account is suspended.',
  blocked: 'Your vendor account is blocked for unpaid invoices.',
  banned: 'Your vendor account is banned.',
};
const branchStatusText: Record<string, string> = {
  draft: 'Draft: not visible to players',
  pending_visit: 'Sent for review: waiting for the site visit',
  live: 'Live',
  hidden: 'Hidden from search',
  suspended: 'Suspended',
  banned: 'Banned',
};
const accountStatusText: Record<string, string> = { pending: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected' };
const card = 'rounded-lg border p-4';

export default async function VendorPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const [{ data: setup }, { data: verification }] = await Promise.all([
    api.GET('/vendor/setup', { headers }),
    api.GET('/me/verification', { headers }),
  ]);
  const vendor = setup?.vendor;

  if (!vendor) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-6">
        <h1 className="text-2xl font-semibold">List your venue on SportsLink</h1>
        <p className="text-sm">
          Players book and pay you directly. You get a live calendar, manual bookings and payment checks in one place.
          Every venue is reviewed and visited by our team before it goes live.
        </p>
        {verification?.status === 'none' || verification?.status === 'rejected' ? (
          <p className="text-sm">
            First,{' '}
            <Link href="/onboarding/verify" className="underline">
              verify your identity
            </Link>
            . Payment accounts must be in the same name as your CNIC.
          </p>
        ) : (
          <ActionForm action={applyAsVendor} button="Apply">
            <label className={labelClass}>
              Business name
              <input name="businessName" required maxLength={120} className={input} />
            </label>
          </ActionForm>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">{vendor.businessName}</h1>
        <p className="text-sm">{vendorStatusText[vendor.status] ?? vendor.status}</p>
      </div>
      <Link href="/vendor/payments" className="text-sm underline">
        Payments to check
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Venues</h2>
        {setup.branches.map((b) => {
          const todo = b.checklist.filter((c) => !c.done);
          return (
            <Link key={b.id} href={`/vendor/branches/${b.id}`} className={`${card} hover:border-neutral-900`}>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm">{branchStatusText[b.status] ?? b.status}</p>
              <p className="text-sm">
                {b.courts.length} {b.courts.length === 1 ? 'court' : 'courts'}
                {b.status === 'draft' && (todo.length ? ` · ${todo.length} to do before review` : ' · ready for review')}
              </p>
            </Link>
          );
        })}
        <details className={card}>
          <summary className="cursor-pointer font-medium">Add a venue</summary>
          <div className="mt-3">
            <BranchFields action={createBranch} button="Add venue" />
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Where players pay you</h2>
        <p className="text-sm">
          Accounts must be in the same name as your CNIC. We check every new or changed account before players see it;
          a replaced account stays in use until then.
        </p>
        {setup.paymentAccounts.map((a) => (
          <div key={a.id} className={`${card} text-sm`}>
            <p className="font-medium">{paymentMethodName[a.method] ?? a.method}</p>
            <p>
              {a.accountTitle}
              {a.bankName ? ` · ${a.bankName}` : ''}
              {a.accountNumberEnding ? ` · ending ${a.accountNumberEnding}` : ''}
            </p>
            <p>{accountStatusText[a.status] ?? a.status}</p>
          </div>
        ))}
        <details className={card}>
          <summary className="cursor-pointer font-medium">Add an account</summary>
          <div className="mt-3">
            <ActionForm action={addAccount} button="Send for approval">
              <label className={labelClass}>
                Method
                <select name="method" className={input} defaultValue="jazzcash">
                  {['jazzcash', 'easypaisa', 'bank_transfer', 'cash'].map((m) => (
                    <option key={m} value={m}>
                      {paymentMethodName[m]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Account title, as on your CNIC
                <input name="accountTitle" required maxLength={120} className={input} />
              </label>
              <label className={labelClass}>
                Account, wallet number or IBAN (not needed for cash)
                <input name="accountNumber" maxLength={40} autoComplete="off" className={input} />
              </label>
              <label className={labelClass}>
                Bank name (bank transfer only)
                <input name="bankName" maxLength={80} className={input} />
              </label>
              {setup.paymentAccounts.length > 0 && (
                <label className={labelClass}>
                  Replaces
                  <select name="replacesAccountId" className={input} defaultValue="">
                    <option value="">Nothing, this is a new account</option>
                    {setup.paymentAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {paymentMethodName[a.method]} {a.accountNumberEnding ? `ending ${a.accountNumberEnding}` : a.accountTitle}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </ActionForm>
          </div>
        </details>
      </section>
    </main>
  );
}
