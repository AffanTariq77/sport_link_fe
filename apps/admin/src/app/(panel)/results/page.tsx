import { ActionForm, input, labelClass } from '@sportslink/ui';
import { adminHeaders, api } from '@/lib/api';
import { decideResult } from '../actions';

const outcomeText = { a: 'Side A won', b: 'Side B won', draw: 'Draw' } as const;

export default async function Results(props: PageProps<'/results'>) {
  const { done } = await props.searchParams;
  const { data, error } = await api.GET('/admin/results/disputed', { headers: await adminHeaders() });
  return (
    <>
      <h1 className="text-2xl font-semibold">Disputed results</h1>
      <p className="text-sm">Your decision is final, logged, and updates the players&apos; ratings. Void removes the result and any rating change.</p>
      {done && <p className="text-sm">Saved.</p>}
      {error && <p role="alert">{error.message}</p>}
      {data?.length === 0 && <p>No disputes.</p>}
      {data?.map((r) => (
        <section key={r.id} className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <p className="text-base font-semibold">
            Match on {new Date(r.startAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <p>Side A: {r.sideANames.join(', ')}</p>
          <p>Side B: {r.sideBNames.join(', ')}</p>
          <p>
            Submitted: {outcomeText[r.outcome]}
            {r.score && ` · ${r.score}`}
          </p>
          {r.disputeNote && <p>Dispute: {r.disputeNote}</p>}
          <ActionForm action={decideResult.bind(null, r.id)} button="Decide">
            <fieldset className="flex flex-wrap gap-4">
              {(['a', 'b', 'draw'] as const).map((o) => (
                <label key={o} className="flex items-center gap-1">
                  <input type="radio" name="outcome" value={o} required /> {outcomeText[o]}
                </label>
              ))}
              <label className="flex items-center gap-1">
                <input type="radio" name="outcome" value="void" /> Void
              </label>
            </fieldset>
            <label className={labelClass}>
              Reason (shown to the players)
              <input name="note" required minLength={3} maxLength={500} className={input} />
            </label>
          </ActionForm>
        </section>
      ))}
    </>
  );
}
