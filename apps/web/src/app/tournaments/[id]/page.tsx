import { formatDay, formatMoney, formatTime, paymentMethodName } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { enterTournament, payEntry, withdrawEntry } from '../actions';
import { entryText, formatName } from '../text';

export const metadata: Metadata = { title: 'Tournament · SportsLink' };
const tz = 'Asia/Karachi';
const doneText: Record<string, string> = {
  entered: 'You are entered.',
  paid: 'Thanks. SportsLink will check your payment.',
  withdrawn: 'Entry withdrawn.',
};
const stageName: Record<string, string> = { group: 'Group', league: 'League', knockout: 'Knockout' };

export default async function TournamentPage(props: PageProps<'/tournaments/[id]'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { done } = await props.searchParams;
  const headers = await authHeaders();
  const { data: t } = await api.GET('/tournaments/{id}', { params: { path: { id } }, headers });
  if (!t) notFound();
  const myTeams = t.teamEntry
    ? ((await api.GET('/teams/mine', { headers })).data ?? []).filter((x) => x.status === 'active' && x.role !== 'member' && x.sport === t.sport)
    : [];
  const e = t.eligibility;
  const rules = [
    e.minAge || e.maxAge ? `ages ${e.minAge ?? 'any'} to ${e.maxAge ?? 'any'}` : null,
    e.gender ? `${e.gender} only` : null,
    e.minRating || e.maxRating ? `rating ${e.minRating ?? 0} to ${e.maxRating ?? 'any'}` : null,
    e.verifiedOnly ? 'verified players' : null,
  ].filter(Boolean);
  const stages = [...new Set(t.fixtures.map((f) => f.stage))];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <Link href="/tournaments" className="text-sm underline">
        Tournaments
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">{t.name}</h1>
        <p className="text-sm">
          {t.sport} · {formatName[t.format]} · {t.teamEntry ? 'team entry' : 'individual entry'} · {t.status.replace('_', ' ')}
        </p>
        <p className="text-sm">
          {t.venue} · {formatDay(t.startsAt, tz)} to {formatDay(t.endsAt, tz)} · entries close {formatDay(t.registrationDeadline, tz)},{' '}
          {formatTime(t.registrationDeadline, tz)}
        </p>
        <p className="text-sm">
          Entry {t.entryFee ? formatMoney(t.entryFee, t.currency) : 'free'}
          {t.prize && ` · prize: ${t.prize}`} · {t.entries.filter((x) => x.status === 'confirmed').length} of {t.maxEntries} places taken
          {rules.length > 0 && ` · open to ${rules.join(', ')}`}
        </p>
      </div>
      {typeof done === 'string' && doneText[done] && <p className="rounded-xl border bg-card p-3 text-sm">{doneText[done]}</p>}

      {t.registrationOpen && t.mine.length === 0 && (t.teamEntry ? myTeams.length > 0 : true) && (
        <ActionForm action={enterTournament.bind(null, t.id)} button={t.teamEntry ? 'Enter my team' : 'Enter'} className="flex flex-wrap items-center gap-3">
          {t.teamEntry && (
            <select name="teamId" aria-label="Your team" className={input}>
              {myTeams.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          )}
        </ActionForm>
      )}
      {t.registrationOpen && t.teamEntry && t.mine.length === 0 && myTeams.length === 0 && (
        <p className="text-sm">
          Team captains enter this tournament. <Link href="/teams" className="underline">Create or join a team</Link>.
        </p>
      )}

      {t.mine.map((m) => (
        <section key={m.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-sm">
          <p className="font-semibold">
            {m.name}: {entryText[m.status] ?? m.status}
          </p>
          {(m.status === 'pending_payment' || m.status === 'rejected') && (
            <>
              <p>
                Pay {formatMoney(t.entryFee, t.currency)} to: {t.payTo}
              </p>
              <p className="text-xs">Paid to {t.feePayee === 'venue' ? 'the host venue' : 'SportsLink'} directly. SportsLink checks the transaction ID.</p>
              <ActionForm action={payEntry.bind(null, t.id, m.id)} button="I have paid">
                <label className={labelClass}>
                  Paid with
                  <select name="method" className={input}>
                    {(['jazzcash', 'easypaisa', 'bank_transfer'] as const).map((x) => (
                      <option key={x} value={x}>
                        {paymentMethodName[x]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Transaction ID from your receipt
                  <input name="txnReference" required minLength={4} maxLength={40} className={input} />
                </label>
              </ActionForm>
            </>
          )}
          {t.registrationOpen && <ActionForm action={withdrawEntry.bind(null, t.id, m.id)} button="Withdraw" className="flex" />}
        </section>
      ))}

      {t.tables.map((table) => (
        <section key={table.group ?? 0} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{table.group ? `Group ${table.group}` : 'Table'}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Entrant</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>+/-</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r.entryId} className="border-t">
                    <td className="py-1">{r.name}</td>
                    <td>{r.played}</td>
                    <td>{r.won}</td>
                    <td>{r.drawn}</td>
                    <td>{r.lost}</td>
                    <td>{r.difference}</td>
                    <td className="font-medium">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {stages.map((stage) => (
        <section key={stage} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{stageName[stage] ?? stage} fixtures</h2>
          {t.fixtures
            .filter((f) => f.stage === stage && f.status !== 'bye')
            .map((f) => (
              <div key={f.id} className="flex justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                <span>
                  Round {f.round}
                  {f.groupNo ? ` · group ${f.groupNo}` : ''}: {f.a ?? 'to be decided'} v {f.b ?? 'to be decided'}
                </span>
                <span className="shrink-0">
                  {f.status === 'completed' ? `${f.scoreA}-${f.scoreB}` : f.status === 'walkover' ? `walkover: ${f.winner}` : 'to play'}
                </span>
              </div>
            ))}
        </section>
      ))}
      {t.entries.length > 0 && t.fixtures.length === 0 && (
        <section className="flex flex-col gap-1 text-sm">
          <h2 className="text-lg font-semibold">Entrants</h2>
          {t.entries.map((x) => (
            <p key={x.id}>{x.name}</p>
          ))}
        </section>
      )}
    </main>
  );
}
