import { formatDay, formatMoney, formatTime, paymentMethodName } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { UnlistedWarning } from '@/components/unlisted-warning';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { openMatchChat } from '../../chats/actions';
import { cancelMatch, decideRequest, joinMatch, leaveMatch, payShare, removePlayer } from '../actions';

export const metadata: Metadata = { title: 'Match · SportsLink' };

const playerStatusText: Record<string, string> = {
  requested: 'Asked to join',
  approved: 'Approved, paying their share',
  confirmed: 'Playing',
  waitlisted: 'On the waitlist',
  declined: 'Declined',
  withdrawn: 'Left',
  removed: 'Removed',
};
const myStatusText: Record<string, string> = {
  ...playerStatusText,
  requested: 'You asked to join. The host approves every player.',
  approved: 'Approved: pay your share below to confirm your place.',
  confirmed: 'You are playing.',
  waitlisted: 'You are on the waitlist.',
};
const doneText: Record<string, string> = {
  requested: 'Request sent. The host approves every player.',
  paid: 'Payment sent. The venue will confirm it.',
  left: 'You have left this match.',
  cancelled: 'Match cancelled.',
};

export default async function MatchPage(props: PageProps<'/matches/[id]'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { done } = await props.searchParams;
  const headers = await authHeaders();
  const { data: m } = await api.GET('/matches/{id}', { params: { path: { id } }, headers });
  if (!m) notFound();
  const tz = m.timezone;
  const pay =
    m.me && ['approved', 'confirmed'].includes(m.me.status) && m.listed
      ? (await api.GET('/matches/{id}/pay', { params: { path: { id } }, headers })).data
      : undefined;
  const open = m.status === 'open' || m.status === 'full';

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <Link href="/matches" className="text-sm underline">
        Matches
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">
          {m.sport} · {formatDay(m.startAt, tz)}, {formatTime(m.startAt, tz)} to {formatTime(m.endAt, tz)}
        </h1>
        <p className="text-sm">
          {m.venue.name}, {m.venue.detail}
          {!m.listed && ' · not listed on SportsLink'}
        </p>
        <p className="text-sm">
          {m.slotsFilled} of {m.slotsTotal} players · host {m.host.name ?? 'Player'} · {m.status}
          {m.pricePerPlayer !== null && m.currency && ` · ${formatMoney(m.pricePerPlayer, m.currency)} per player`}
        </p>
        <p className="text-xs">Joining closes {formatDay(m.joinCutoffAt, tz)}, {formatTime(m.joinCutoffAt, tz)}.</p>
      </div>
      {typeof done === 'string' && doneText[done] && <p className="rounded-md border p-3 text-sm">{doneText[done]}</p>}
      {(m.isHost || (m.me && ['approved', 'confirmed'].includes(m.me.status))) && (
        <ActionForm action={openMatchChat.bind(null, m.id)} button="Open the match chat" className="flex" />
      )}

      {m.canJoin && (
        <ActionForm action={joinMatch.bind(null, m.id)} button="Ask to join">
          {!m.listed && <UnlistedWarning />}
          {m.pricePerPlayer !== null && m.currency && (
            <p className="text-sm">If the host approves you, you pay {formatMoney(m.pricePerPlayer, m.currency)} to the venue.</p>
          )}
        </ActionForm>
      )}

      {m.me && <p className="text-sm font-medium">{myStatusText[m.me.status] ?? m.me.status}</p>}
      {pay && m.me?.status === 'approved' && pay.shareStatus !== 'submitted' && (
        <section className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
          <h2 className="font-semibold">Pay your share: {pay.amount !== null && formatMoney(pay.amount, pay.currency)}</h2>
          {pay.shareStatus === 'rejected' && <p>The venue could not find your last payment. Check the ID and try again.</p>}
          <ActionForm action={payShare.bind(null, m.id)} button="I have paid">
            {pay.accounts.map((a) => (
              <label key={a.method} className="flex gap-3 rounded-md border p-3">
                <input type="radio" name="method" value={a.method} required defaultChecked={a === pay.accounts[0]} />
                <span>
                  <span className="block font-medium">{paymentMethodName[a.method]}</span>
                  <span className="block">{a.accountTitle}</span>
                  {a.bankName && <span className="block">{a.bankName}</span>}
                  {a.accountNumber && <span className="block font-mono">{a.accountNumber}</span>}
                </span>
              </label>
            ))}
            <label className={labelClass}>
              Transaction ID from your receipt
              <input name="txnReference" required minLength={4} maxLength={40} className={input} />
            </label>
          </ActionForm>
        </section>
      )}
      {pay?.shareStatus === 'submitted' && <p className="text-sm">The venue is checking your payment.</p>}
      {m.me && open && ['requested', 'approved', 'confirmed', 'waitlisted'].includes(m.me.status) && (
        <ActionForm action={leaveMatch.bind(null, m.id)} button="Leave this match" className="flex" />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{m.isHost ? 'Players and requests' : 'Players'}</h2>
        {m.players.length === 0 && <p className="text-sm">No one has joined yet.</p>}
        {m.players.map((p) => (
          <div key={p.userId} className="flex flex-col gap-2 rounded-md border p-3 text-sm">
            <p>
              <span className="font-medium">{p.name ?? 'Player'}</span> · {playerStatusText[p.status] ?? p.status}
              {m.isHost && p.shareStatus && ` · payment ${p.shareStatus}`}
            </p>
            {m.isHost && open && ['requested', 'waitlisted'].includes(p.status) && (
              <ActionForm action={decideRequest.bind(null, m.id, p.userId)} button="Save" className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input type="radio" name="decision" value="approve" required /> Approve
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="decision" value="decline" /> Decline
                </label>
              </ActionForm>
            )}
            {m.isHost && open && ['approved', 'confirmed'].includes(p.status) && (
              <ActionForm action={removePlayer.bind(null, m.id, p.userId)} button="Remove" className="flex" />
            )}
          </div>
        ))}
      </section>
      {m.isHost && open && <ActionForm action={cancelMatch.bind(null, m.id)} button="Cancel match" className="flex" />}
    </main>
  );
}
