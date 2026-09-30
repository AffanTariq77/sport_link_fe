'use client';

import { CalendarDays, Home, LocateFixed, MessageCircle, Volleyball, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

// The five things players do most; the rest are a tap away from Home.
const TABS: [string, string, LucideIcon][] = [
  ['/', 'Home', Home],
  ['/venues', 'Book', CalendarDays],
  ['/matches', 'Matches', Volleyball],
  ['/find-players', 'Find', LocateFixed],
  ['/chats', 'Chats', MessageCircle],
];

function useActive() {
  const path = usePathname();
  return (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));
}

/** Desktop links in the navy top bar, with the current section highlighted. */
export function NavLinks() {
  const active = useActive();
  return (
    <div className="hidden gap-1 lg:flex">
      {LINKS.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? 'page' : undefined}
          className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
            active(href) ? 'bg-accent text-on-accent' : 'text-white/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/** Fixed bottom tab bar on phones and tablets. */
export function TabBar() {
  const active = useActive();
  return (
    <nav
      id="tab-bar"
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 bg-navy pb-[env(safe-area-inset-bottom)] text-white lg:hidden"
    >
      {TABS.map(([href, label, Icon]) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-xs font-bold ${active(href) ? 'text-accent' : 'text-white/65'}`}
        >
          <Icon size={22} strokeWidth={active(href) ? 2.5 : 2} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
