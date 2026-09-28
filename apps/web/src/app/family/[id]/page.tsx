import { bookingStatusText, formatDay, formatTime } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Your child · SportsLink' };

export default async function FamilyPage(props: PageProps<'/family/[id]'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { data } = await api.GET('/me/wards/{id}/activity', { params: { path: { id } }, headers: await authHeaders() });
  if (!data) notFound();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-6">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-semibold">{data.minor.name ?? 'Your child'}</h1>
      <h2 className="font-semibold">Upcoming bookings</h2>
      {data.bookings.length === 0 && <p className="text-sm">None.</p>}
      {data.bookings.map((b) => (
        <p key={b.id} className="rounded-md border p-3 text-sm">
          {b.venue}, {b.court} · {formatDay(b.startAt, b.timezone)} {formatTime(b.startAt, b.timezone)} · {bookingStatusText[b.status] ?? b.status}
        </p>
      ))}
      <h2 className="font-semibold">Matches</h2>
      {data.matches.length === 0 && <p className="text-sm">None.</p>}
      {data.matches.map((m) => (
        <p key={m.id} className="rounded-md border p-3 text-sm">
          {m.sport} · {formatDay(m.startAt, 'Asia/Karachi')} {formatTime(m.startAt, 'Asia/Karachi')} · {m.role === 'host' ? 'hosting' : m.role}
        </p>
      ))}
    </main>
  );
}
