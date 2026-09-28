import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser, onboardingStep } from '@/lib/session';
import { signOut } from './actions';

export default async function Home() {
  const user = await currentUser();
  const step = user && (await onboardingStep(user));
  if (step) redirect(step);
  const verification = user && (await api.GET('/me/verification', { headers: await authHeaders() })).data;
  const vendor = user && (await api.GET('/vendor/access', { headers: await authHeaders() })).data?.vendors.length;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-semibold">SportsLink</h1>
      <p className="max-w-md text-base">Book a venue, fill your match, find players nearby.</p>
      {user ? (
        <form action={signOut} className="flex flex-col items-center gap-2">
          <p>You are signed in{user.name ? ` as ${user.name}` : ''}.</p>
          {verification?.status === 'pending' && <p className="text-sm">We are checking your ID and will let you know when it is done.</p>}
          {verification?.status === 'none' && (
            <Link href="/onboarding/verify" className="text-sm underline">
              Verify your identity
            </Link>
          )}
          <div className="flex gap-4">
            <Link href="/venues" className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900">
              Book a venue
            </Link>
            <Link href="/matches" className="px-4 py-2 underline">
              Matches
            </Link>
            <Link href="/bookings" className="px-4 py-2 underline">
              My bookings
            </Link>
          </div>
          <Link href="/vendor" className="text-sm underline">
            {vendor ? 'Vendor: your venues and payments' : 'List your venue'}
          </Link>
          <button className="text-sm underline">Sign out</button>
        </form>
      ) : (
        <Link href="/sign-in" className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900">
          Sign in
        </Link>
      )}
    </main>
  );
}
