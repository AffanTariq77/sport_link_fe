import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Chats · SportsLink' };

export default async function ChatsPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const { data } = await api.GET('/conversations', { headers: await authHeaders() });
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-semibold">Chats</h1>
      {data?.length === 0 && <p>No chats yet. Match chats open once you are in a match.</p>}
      <ul className="flex flex-col gap-2">
        {data?.map((c) => (
          <li key={c.id}>
            <Link href={`/chats/${c.id}`} className="flex justify-between gap-3 rounded-lg border p-3 text-sm hover:border-neutral-900">
              <span>
                <span className="block font-medium">{c.title}</span>
                <span className="block truncate">{c.lastMessage ?? 'No messages yet'}</span>
              </span>
              {c.unread > 0 && <span className="self-center rounded-full bg-accent hover:opacity-90 px-2 text-xs text-white">{c.unread}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
