'use client';

import { keepValues } from '@sportslink/ui';
import { useActionState } from 'react';
import { signIn, type SignInState } from '../actions';

const input = 'w-full rounded-md border border-neutral-400 px-3 py-2 text-base';
const button = 'w-full rounded-md bg-accent hover:opacity-90 px-3 py-2 font-medium text-white disabled:opacity-50';

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { step: 'phone', phone: '' });

  return (
    <form onSubmit={keepValues(action)} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Mobile number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
          defaultValue={state.phone}
          readOnly={state.step === 'code'}
          required
          className={input}
        />
      </label>
      {state.step === 'code' && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Code</span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            className={input}
          />
        </label>
      )}
      <p aria-live="polite" className="min-h-6 text-sm">
        {state.message}
      </p>
      <button disabled={pending} className={button}>
        {state.step === 'phone' ? 'Send code' : 'Sign in'}
      </button>
      {state.step === 'code' && (
        <button name="resend" value="1" formNoValidate disabled={pending} className="text-sm underline">
          Send a new code
        </button>
      )}
    </form>
  );
}
