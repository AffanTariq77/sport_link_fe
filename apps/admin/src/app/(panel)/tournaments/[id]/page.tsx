import { paymentMethodName } from '@sportslink/api-client';
import { ActionForm, input } from '@sportslink/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminHeaders, api } from '@/lib/api';
import { cancelTournament, entryDecision, enterResult, makeDraw, startKnockout } from '../actions';

export default async function Tournament(props: PageProps<'/tournaments/[id]'>) {
  const { id } = await props.params;
  const { done } = await props.searchParams;
  const headers = await adminHeaders();
  const [{ data: t }, { data: entries }] = await Promise.all([
    api.GET('/admin/tournaments/{id}', { params: { path: { id } }, headers }),
    api.GET('/admin/tournaments/{id}/entries', { params: { path: { id } }, headers }),
  ]);
  if (!t) notFound();
  const open = t.fixtures.filter((f) => f.status === 'scheduled' && f.entryA && f.entryB);
  return (
    <>
      <Link href="/tournaments" className="text-sm underline">
        Tournaments
      </Link>
      <h1 className="text-2xl font-semibold">{t.name}</h1>
      <p className="text-sm">
        {t.sport} · {t.format.replace('_', ' ')} · {t.status.replace('_', ' ')} · entries close {new Date(t.registrationDeadline).toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })}
      </p>
      {done && <p className="text-sm">Saved.</p>}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Entries</h2>
        {entries?.length === 0 && <p className="text-sm">No entries yet.</p>}
        {entries?.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
            <span className="font-medium">{e.name}</span>
            <span>{e.status.replace('_', ' ')}</span>
            {e.txnReference && (
              <span>
                {e.method && paymentMethodName[e.method]} · <span className="font-mono">{e.txnReference}</span>
              </span>
            )}
            {e.status === 'submitted' && (
              <>
                <ActionForm action={entryDecision.bind(null, id, e.id, 'confirm')} button="Money received" className="flex" />
                <ActionForm action={entryDecision.bind(null, id, e.id, 'reject')} button="Not received" className="flex" />
              </>
            )}
            {e.status === 'confirmed' && t.status === 'in_progress' && (
              <ActionForm action={entryDecision.bind(null, id, e.id, 'withdraw')} button="Withdraw (walkovers)" className="flex" />
            )}
            {t.teamEntry && e.status === 'confirmed' && (
              <ActionForm
                action={entryDecision.bind(null, id, e.id, e.rosterUnlocked ? 'lock' : 'unlock')}
                button={e.rosterUnlocked ? 'Lock roster' : 'Allow roster changes'}
                className="flex"
              />
            )}
          </div>
        ))}
      </section>

      {(t.status === 'open' || t.status === 'closed') && <ActionForm action={makeDraw.bind(null, id)} button="Make the draw" className="flex" />}
      {t.format === 'groups_knockout' && t.status === 'in_progress' && !t.fixtures.some((f) => f.stage === 'knockout') && (
        <ActionForm action={startKnockout.bind(null, id)} button="Groups finished: start the knockout" className="flex" />
      )}

      {open.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Results to enter</h2>
          {open.map((f) => (
            <ActionForm key={f.id} action={enterResult.bind(null, id, f.id)} button="Save result" className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
              <span className="font-medium">
                {f.stage} round {f.round}
                {f.groupNo ? ` group ${f.groupNo}` : ''}: {f.a} v {f.b}
              </span>
              <input name="scoreA" type="number" min={0} max={999} aria-label={`${f.a} score`} className={`${input} w-20`} />
              <input name="scoreB" type="number" min={0} max={999} aria-label={`${f.b} score`} className={`${input} w-20`} />
              <select name="winner" aria-label="Winner if level" className={input}>
                <option value="">Winner by score</option>
                <option value="a">{f.a} went through</option>
                <option value="b">{f.b} went through</option>
              </select>
              <select name="walkover" aria-label="Walkover" className={input}>
                <option value="">No walkover</option>
                <option value="a">Walkover to {f.a}</option>
                <option value="b">Walkover to {f.b}</option>
              </select>
            </ActionForm>
          ))}
        </section>
      )}

      {t.tables.map((table) => (
        <section key={table.group ?? 0} className="flex flex-col gap-1 text-sm">
          <h2 className="text-lg font-semibold">{table.group ? `Group ${table.group}` : 'Table'}</h2>
          {table.rows.map((r) => (
            <p key={r.entryId}>
              {r.name}: {r.points} pts ({r.won}-{r.drawn}-{r.lost}, {r.difference >= 0 ? '+' : ''}
              {r.difference})
            </p>
          ))}
        </section>
      ))}

      {!['completed', 'cancelled'].includes(t.status) && (
        <ActionForm action={cancelTournament.bind(null, id)} button="Cancel tournament" className="flex max-w-xl flex-wrap items-center gap-3">
          <input name="reason" required minLength={3} maxLength={300} placeholder="Reason, shown to entrants" className={input} />
        </ActionForm>
      )}
    </>
  );
}
