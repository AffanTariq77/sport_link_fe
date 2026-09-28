import { formatDay, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { MatchForm } from './match-form';

export const metadata: Metadata = { title: 'Create a match · SportsLink' };

const isUpcoming = (iso: string) => new Date(iso).getTime() > Date.now();

export default async function NewMatchPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const [{ data: sports }, { data: myBookings }, { data: mine }] = await Promise.all([
    api.GET('/sports'),
    api.GET('/bookings/mine', { headers }),
    api.GET('/matches/mine', { headers }),
  ]);
  // Bookings the host has secured (advance paid or being checked) that do not have a match yet.
  const used = new Set(mine?.map((m) => m.bookingId) ?? []);
  const bookings =
    myBookings
      ?.filter((b) => (b.status === 'confirmed' || b.status === 'pending_payment') && isUpcoming(b.startAt))
      .filter((b) => !used.has(b.id))
      .map((b) => ({
        id: b.id,
        label: `${b.venue.name}, ${b.court.name} · ${formatDay(b.startAt, b.venue.timezone)} ${formatTime(b.startAt, b.venue.timezone)}`,
      })) ?? [];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-6">
      <Link href="/matches" className="text-sm underline">
        Matches
      </Link>
      <h1 className="text-2xl font-semibold">Create a match</h1>
      <MatchForm sports={sports ?? []} bookings={bookings} />
    </main>
  );
}
