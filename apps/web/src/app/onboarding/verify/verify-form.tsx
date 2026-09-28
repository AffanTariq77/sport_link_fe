'use client';

import { useActionState } from 'react';
import { type FormState, submitDocument } from '../actions';
import { button, input, label, labelText } from '../fields';

const accept = 'image/jpeg,image/png,image/webp';

export function VerifyForm({ docLabel }: { docLabel: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitDocument, {});
  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <label className={label}>
        <span className={labelText}>{docLabel} number</span>
        <input name="docNumber" inputMode="numeric" placeholder="xxxxx-xxxxxxx-x" required maxLength={15} className={input} />
      </label>
      <label className={label}>
        <span className={labelText}>Photo of the front</span>
        <input name="front" type="file" accept={accept} capture="environment" required className={input} />
      </label>
      <label className={label}>
        <span className={labelText}>Photo of the back</span>
        <input name="back" type="file" accept={accept} capture="environment" required className={input} />
      </label>
      <p aria-live="polite" className="min-h-6 text-sm">
        {state.message}
      </p>
      <button disabled={pending} className={button}>
        {pending ? 'Uploading…' : 'Submit for review'}
      </button>
    </form>
  );
}
