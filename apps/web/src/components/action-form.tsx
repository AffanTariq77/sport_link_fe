'use client';

import { type ReactNode, useActionState } from 'react';

export type FormState = { message?: string };
type Action = (state: FormState, form: FormData) => Promise<FormState>;

/** A form wired to a server action, with a pending state and the action's message (errors, usually). */
export function ActionForm({
  action,
  button,
  children,
  className = 'flex flex-col gap-3',
}: {
  action: Action;
  button: string;
  children?: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {state.message && (
        <p aria-live="polite" className="text-sm">
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Saving…' : button}
      </button>
    </form>
  );
}

export const input = 'w-full rounded-md border border-neutral-400 bg-transparent px-3 py-2 text-base';
export const labelClass = 'flex flex-col gap-1 text-sm font-medium';
