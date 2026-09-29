import Link from 'next/link';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { NavLinks } from './nav-links';

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
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
        <Link href="/" className="mr-auto text-lg font-bold tracking-tight">
          Sports<span className="text-accent">Link</span>
        </Link>
        <Link
          href="/notifications"
          className="rounded-full px-3 py-1.5 font-medium text-muted hover:bg-surface hover:text-foreground sm:order-last"
          aria-label={`Notifications, ${unread} unread`}
        >
          Notifications
          {unread > 0 && (
            <span className="ml-1 rounded-full bg-accent px-2 text-xs text-white">{unread > 99 ? '99+' : unread}</span>
          )}
        </Link>
        <Link href="/account" className="rounded-full px-3 py-1.5 font-medium text-muted hover:bg-surface hover:text-foreground sm:order-last">
          Account
        </Link>
        {!user.locked && <NavLinks links={LINKS} />}
      </nav>
    </header>
  );
}
