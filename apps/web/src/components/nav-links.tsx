'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Header links with the current section highlighted. */
export function NavLinks({ links }: { links: readonly (readonly [string, string])[] }) {
  const path = usePathname();
  return (
    <div className="-mx-4 flex w-full gap-1 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:px-0">
      {links.map(([href, label]) => {
        const active = path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition-colors ${
              active ? 'bg-accent text-white' : 'text-muted hover:bg-surface hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
