import Link from 'next/link';
import { currentUser } from '@/lib/session';
import { signOut } from './actions';

export default async function Home() {
  const user = await currentUser();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-semibold">SportsLink</h1>
      <p className="max-w-md text-base">Book a venue, fill your match, find players nearby. Coming soon.</p>
      {user ? (
        <form action={signOut} className="flex flex-col items-center gap-2">
          <p>You are signed in{user.name ? ` as ${user.name}` : ''}.</p>
          {user.status === 'pending_verification' && <p className="text-sm">Your identity is not verified yet.</p>}
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
