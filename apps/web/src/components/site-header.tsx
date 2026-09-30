import { Bell, CircleUser } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { NavLinks, TabBar } from './nav-links';

/** Navy top bar for signed-in users with the unread notification count, plus the phone tab bar. */
export async function SiteHeader() {
  const user = await currentUser();
  if (!user?.name) return null;
  const { data } = await api.GET('/notifications', { headers: await authHeaders() });
  const unread = data?.unread ?? 0;
  return (
    <>
      <header className="sticky top-0 z-20 bg-navy text-white">
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 text-sm">
          <Link href="/" className="mr-auto text-lg font-black tracking-widest">
            SPORTS<span className="text-accent">LINK</span>
          </Link>
          {!user.locked && <NavLinks />}
          <Link
            href="/notifications"
            className="relative rounded-full p-2 hover:bg-white/10"
            aria-label={`Notifications, ${unread} unread`}
          >
            <Bell size={20} aria-hidden />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-accent px-1 text-center text-xs font-bold text-on-accent">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Link>
          <Link href="/account" className="rounded-full p-2 hover:bg-white/10" aria-label="Your account">
            <CircleUser size={20} aria-hidden />
          </Link>
        </nav>
      </header>
      {!user.locked && <TabBar />}
    </>
  );
}
