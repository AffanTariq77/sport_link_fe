import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/api';
import { logout } from '../login/actions';

const NAV = [
  ['/', 'Overview', 'analytics.view'],
  ['/verifications', 'Identity checks', 'verification.review'],
  ['/venues', 'Venues', 'venues.approve'],
  ['/payment-accounts', 'Payment accounts', 'payment_accounts.approve'],
  ['/invoices', 'Invoices', 'billing.view'],
  ['/users', 'Users and bans', 'users.ban'],
  ['/reports', 'Reports and disputes', 'reports.review'],
  ['/audit', 'Audit log', 'audit.view'],
] as const;

export default async function PanelLayout({ children }: LayoutProps<'/'>) {
  const me = await currentAdmin();
  if (!me) redirect('/login');
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <nav className="flex flex-wrap gap-3 border-b p-4 text-sm md:w-56 md:flex-col md:border-r md:border-b-0">
        <p className="font-semibold">SportsLink Admin</p>
        {NAV.filter(([, , permission]) => me.permissions.includes(permission)).map(([href, label]) => (
          <Link key={href} href={href} className="underline">
            {label}
          </Link>
        ))}
        <p className="text-xs md:mt-auto">
          {me.admin.name} · {me.admin.role.replace('_', ' ')}
        </p>
        <form action={logout}>
          <button className="text-xs underline">Sign out</button>
        </form>
      </nav>
      <main className="flex flex-1 flex-col gap-5 p-6">{children}</main>
    </div>
  );
}
