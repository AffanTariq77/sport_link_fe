"use client";

import { useActionState } from "react";
import { type DecisionState, decidePayment } from "../actions";

export function Decision({ id }: { id: string }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(
    decidePayment,
    {},
  );
  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-2">
        <button
          name="decision"
          value="confirm"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Money received
        </button>
        <details className="text-sm">
          <summary className="cursor-pointer rounded-md border px-3 py-2">
            Not received
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <input
              name="reason"
              placeholder="What was wrong, for example no payment with this ID"
              className="rounded-md border px-3 py-2"
            />
            <button
              name="decision"
              value="reject"
              disabled={pending}
              className="rounded-md border px-3 py-2"
            >
              Reject payment
            </button>
          </div>
        </details>
      </div>
      {state.message && <p className="text-sm">{state.message}</p>}
    </form>
  );
}
