'use client';

import { type FormEvent, type ReactNode, startTransition, useActionState } from 'react';

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
    <form onSubmit={keepValues(formAction)} className={className}>
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

/**
 * Submit handler that runs a server action without React 19's automatic form reset, so a form that comes back
 * with an error keeps what the person typed (and attached).
 */
export function keepValues(formAction: (form: FormData) => void) {
  return async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    await shrinkImages(form);
    startTransition(() => formAction(form));
  };
}

const SHRINK_OVER = 1_000_000; // bytes
const MAX_SIDE = 1600; // px: ID text and venue photos stay sharp

/**
 * Re-encodes large photos as JPEG of at most 1600 px a side, in the browser, before upload. Hosting caps request
 * bodies (Vercel: 4.5 MB), and phone photos are often bigger than that on their own. A photo the browser cannot
 * decode is sent as it is, and the API's own checks still apply.
 */
async function shrinkImages(form: FormData) {
  for (const [key, value] of [...form.entries()]) {
    if (!(value instanceof File) || !value.type.startsWith('image/') || value.size <= SHRINK_OVER) continue;
    try {
      const bitmap = await createImageBitmap(value);
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/jpeg', 0.85));
      if (blob) form.set(key, new File([blob], value.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
    } catch {
      // keep the original
    }
  }
}

export const input = 'w-full rounded-md border border-neutral-400 bg-transparent px-3 py-2 text-base';
export const labelClass = 'flex flex-col gap-1 text-sm font-medium';
