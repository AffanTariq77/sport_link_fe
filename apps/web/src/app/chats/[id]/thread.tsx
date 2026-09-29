"use client";

import type { Schemas } from "@sportslink/api-client";
import { input, keepValues } from "@sportslink/ui";
import { useActionState, useEffect, useRef, useState } from "react";
import { reportChat, type SendState, sendMessage } from "../actions";

type Message = Schemas["ChatThread"]["messages"][number];
const POLL_MS = 4000; // ponytail: polling until realtime (Socket.IO, spec 2) is added

export function Thread({
  id,
  initial,
  timeZone,
}: {
  id: string;
  initial: Message[];
  timeZone: string;
}) {
  const [list, setList] = useState(initial);
  const [state, action, pending] = useActionState<SendState, FormData>(
    sendMessage.bind(null, id),
    {},
  );
  const [reportState, reportAction] = useActionState<SendState, FormData>(
    reportChat.bind(null, id),
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Poll for new messages; also run straight after sending.
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const last = list.at(-1)?.createdAt;
      const res = await fetch(
        `/chats/${id}/poll${last ? `?after=${encodeURIComponent(last)}` : ""}`,
        { cache: "no-store" },
      );
      if (!stop && res.ok) {
        const data = (await res.json()) as Schemas["ChatThread"];
        if (data.messages.length)
          setList((prev) => [
            ...prev,
            ...data.messages.filter((m) => !prev.some((p) => p.id === m.id)),
          ]);
      }
    };
    const timer = setInterval(tick, POLL_MS);
    void tick();
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [id, list, state.sentAt]);

  useEffect(() => {
    if (state.sentAt) formRef.current?.reset();
  }, [state.sentAt]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [list.length]);

  const time = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(iso));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border p-3">
        {list.length === 0 && (
          <li className="text-sm">No messages yet. Say hello.</li>
        )}
        {list.map((m) => (
          <li
            key={m.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.mine ? "self-end bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "self-start border"}`}
          >
            {!m.mine && (
              <p className="text-xs font-medium">
                {m.senderName ?? "SportsLink"}
              </p>
            )}
            <p className="whitespace-pre-wrap">{m.body}</p>
            <p className="text-right text-[10px] opacity-70">
              {time(m.createdAt)}
            </p>
          </li>
        ))}
        <div ref={bottom} />
      </ul>
      <form
        ref={formRef}
        onSubmit={keepValues(action)}
        className="flex flex-col gap-2"
      >
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={2}
          defaultValue={state.warning ? state.body : undefined}
          placeholder="Message"
          className={input}
        />
        {state.warning && (
          <div className="rounded-md border-2 border-neutral-900 p-3 text-sm">
            <p>{state.warning}</p>
            <button
              name="confirmPhone"
              value="1"
              disabled={pending}
              className="mt-2 underline"
            >
              Send anyway
            </button>
          </div>
        )}
        {state.message && <p className="text-sm">{state.message}</p>}
        <button
          disabled={pending}
          className="self-end rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Send
        </button>
      </form>
      <details className="text-sm">
        <summary className="cursor-pointer underline">Report this chat</summary>
        <form
          onSubmit={keepValues(reportAction)}
          className="mt-2 flex flex-col gap-2"
        >
          <select name="reason" className={input} defaultValue="abuse">
            <option value="abuse">Abuse or harassment</option>
            <option value="scam">Scam or fake payment</option>
            <option value="safety">Safety concern</option>
            <option value="other">Something else</option>
          </select>
          <textarea
            name="details"
            maxLength={1000}
            rows={2}
            placeholder="What happened (optional)"
            className={input}
          />
          <button className="self-start rounded-md border px-3 py-1">
            Send report
          </button>
          {reportState.message && <p>{reportState.message}</p>}
        </form>
      </details>
    </div>
  );
}
