'use client';

import { keepValues } from '@sportslink/ui';
import type { Schemas } from '@sportslink/api-client';
import { paymentMethodName } from '@sportslink/api-client';
import { useActionState, useState } from 'react';
import { type PayState, submitPayment } from '../../actions';

const input = 'w-full rounded-md border border-neutral-400 px-3 py-2 text-base bg-transparent';
const button =
  'w-full rounded-md bg-accent hover:opacity-90 px-3 py-2 font-medium text-white disabled:opacity-50';

export function PayForm({
  bookingId,
  info,
  submit,
}: {
  bookingId: string;
  info: Schemas['PayInfo'];
  /** Another payment action, for example every week of a weekly booking. */
  submit?: (prev: PayState, form: FormData) => Promise<PayState>;
}) {
  const [state, action, pending] = useActionState<PayState, FormData>(submit ?? submitPayment.bind(null, bookingId), {});
  const [method, setMethod] = useState(info.accounts[0]?.method ?? (info.payAtVenueAllowed ? 'cash' : ''));

  return (
    <form onSubmit={keepValues(action)} className="flex w-full flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">How did you pay?</legend>
        {info.accounts.map((a) => (
          <label key={a.method} className="flex gap-3 rounded-md border p-3">
            <input
              type="radio"
              name="method"
              value={a.method}
              checked={method === a.method}
              onChange={() => setMethod(a.method)}
            />
            <span className="text-sm">
              <span className="block font-medium">{paymentMethodName[a.method] ?? a.method}</span>
              <span className="block">{a.accountTitle}</span>
              {a.bankName && <span className="block">{a.bankName}</span>}
              {a.accountNumber && <span className="block font-mono">{a.accountNumber}</span>}
            </span>
          </label>
        ))}
        {info.payAtVenueAllowed && (
          <label className="flex gap-3 rounded-md border p-3">
            <input type="radio" name="method" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} />
            <span className="text-sm font-medium">Pay everything at the venue</span>
          </label>
        )}
      </fieldset>
      {method !== 'cash' && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Transaction ID from your receipt</span>
          <input name="txnReference" required minLength={4} maxLength={40} autoComplete="off" className={input} />
          <span className="text-xs">A screenshot is not enough: the venue checks this ID against its account.</span>
        </label>
      )}
      <p aria-live="polite" className="min-h-6 text-sm">
        {state.message}
      </p>
      <button disabled={pending || !method} className={button}>
        {method === 'cash' ? 'Confirm booking' : 'I have paid'}
      </button>
    </form>
  );
}
