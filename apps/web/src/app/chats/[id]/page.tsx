import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authHeaders, currentUser } from "@/lib/session";
import { blockPerson } from "../actions";
import { Thread } from "./thread";

export const metadata: Metadata = { title: "Chat · SportsLink" };

export default async function ChatPage(props: PageProps<"/chats/[id]">) {
  if (!(await currentUser())) redirect("/sign-in");
  const { id } = await props.params;
  const headers = await authHeaders();
  const [{ data: thread }, { data: list }] = await Promise.all([
    api.GET("/conversations/{id}/messages", {
      params: { path: { id } },
      headers,
    }),
    api.GET("/conversations", { headers }),
  ]);
  if (!thread) notFound();
  const title = list?.find((c) => c.id === id)?.title ?? "Chat";
  const others = [
    ...new Map(
      thread.messages
        .filter((m) => !m.mine && m.senderId)
        .map((m) => [m.senderId!, m.senderName]),
    ).entries(),
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <Link href="/chats" className="text-sm underline">
        Chats
      </Link>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-xs">
        Keep chatting here: SportsLink never shows your phone number to other
        players.
      </p>
      {/* ponytail: Pakistan time for chat timestamps; a per-user zone once other countries launch */}
      <Thread id={id} initial={thread.messages} timeZone="Asia/Karachi" />
      {others.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer underline">Block someone</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map(([userId, name]) => (
              <form
                key={userId}
                action={blockPerson.bind(null, userId, `/chats/${id}`)}
              >
                <button className="rounded-md border px-3 py-1">
                  Block {name ?? "player"}
                </button>
              </form>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
