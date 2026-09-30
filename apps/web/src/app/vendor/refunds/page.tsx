import { formatDay, formatMoney, formatTime, paymentMethodName } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { refundSent } from '../setup-actions';

export const metadata: Metadata = { title: 'Refunds to send · SportsLink' };

const reasonText: Record<string, string> = {
  player_cancelled: 'Player cancelled in time',
  vendor_cancelled: 'You cancelled',
  left_match: 'Player left the match in time',
  match_cancelled: 'Host cancelled the match',
};

export default async function RefundsPage(props: PageProps<'/vendor/refunds'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { saved } = await props.searchParams;
  const { data } = await api.GET('/vendor/refunds', { headers: await authHeaders() });
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <Link href="/vendor" className="text-sm underline">
        Vendor
      </Link>
      <h1 className="text-2xl font-semibold">Refunds to send</h1>
      <p className="text-sm">Send each refund back the way the player paid, then enter the transfer reference.</p>
      {saved && <p className="rounded-xl border bg-card p-3 text-sm">Marked as sent. The player will confirm when it arrives.</p>}
      {data?.length === 0 && <p>No refunds to send.</p>}
      {data?.map((r) => (
        <section key={r.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
          <p className="text-base font-semibold">
            {formatMoney(r.amount, r.currency)} to {r.playerName ?? 'the player'}
            {r.paidMethod && ` by ${paymentMethodName[r.paidMethod]}`}
          </p>
          <p>
            {reasonText[r.reason] ?? r.reason} · {r.booking.branch}, {r.booking.court} · {formatDay(r.booking.startAt, r.booking.timezone)}{' '}
            {formatTime(r.booking.startAt, r.booking.timezone)}
            {r.status === 'disputed' && ' · the player says it has not arrived'}
          </p>
          <ActionForm action={refundSent.bind(null, r.id)} button="Mark as sent">
            <input name="reference" required minLength={3} maxLength={60} placeholder="Transfer reference" className={input} />
          </ActionForm>
        </section>
      ))}
    </main>
  );
}
