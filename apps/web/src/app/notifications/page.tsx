import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Notifications · SportsLink' };

// ponytail: launch-market time zone, as in chats; use the user's country time zone when a second market opens.
const when = (d: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

export default async function NotificationsPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const { data, error } = await api.GET('/notifications', { headers });
  // Opening the list counts as reading it; unread ones stay highlighted on this visit.
  if (data?.unread) await api.POST('/notifications/read', { headers, body: {} });
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {error && <p role="alert">Could not load notifications. Please try again.</p>}
      {data?.items.length === 0 && <p>Nothing yet. Booking, payment, match and chat updates will appear here.</p>}
      <ul className="flex flex-col gap-2">
        {data?.items.map((n) => {
          const body = (
            <>
              <span className="flex justify-between gap-3">
                <span className="font-medium">{n.title}</span>
                <span className="shrink-0 text-xs text-muted">{when(n.createdAt)}</span>
              </span>
              <span className="block">{n.body}</span>
            </>
          );
          const cls = `block rounded-xl border bg-card p-3 text-sm ${n.readAt ? '' : 'border-accent'}`;
          return (
            <li key={n.id}>
              {n.link ? (
                <Link href={n.link} className={`${cls} hover:bg-surface`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
