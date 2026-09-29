import Link from 'next/link';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

const LINKS = [
  ['/venues', 'Venues'],
  ['/matches', 'Matches'],
  ['/find-players', 'Find Players'],
  ['/bookings', 'Bookings'],
  ['/chats', 'Chats'],
  ['/teams', 'Teams'],
  ['/tournaments', 'Tournaments'],
  ['/leaderboards', 'Rankings'],
] as const;

/** Top navigation for signed-in users, with the unread notification count. */
export async function SiteHeader() {
  const user = await currentUser();
  if (!user?.name) return null;
  const { data } = await api.GET('/notifications', { headers: await authHeaders() });
  const unread = data?.unread ?? 0;
  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
        <Link href="/" className="mr-auto font-semibold">
          SportsLink
        </Link>
        <Link href="/notifications" className="hover:underline sm:order-last" aria-label={`Notifications, ${unread} unread`}>
          Notifications
          {unread > 0 && (
            <span className="ml-1 rounded-full bg-neutral-900 px-2 text-xs text-white dark:bg-white dark:text-neutral-900">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>
        {!user.locked && (
          <div className="flex w-full flex-wrap gap-x-4 gap-y-1 sm:w-auto">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="hover:underline">
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
