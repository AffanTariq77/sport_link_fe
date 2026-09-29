import { formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import Link from 'next/link';
import { respondToResult, reviewPlayer, submitResult } from '../actions';

export const tagName = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).replaceAll('_', ' ');
const card = 'flex flex-col gap-3 rounded-lg border p-4 text-sm';

/** Result, confirmation and behaviour reviews once the match has been played (spec 11). */
export function ResultSection({ matchId, state, me, tz }: { matchId: string; state: Schemas['MatchResultState']; me: string; tz: string }) {
  const name = (id: string) => state.participants.find((p) => p.id === id)?.name ?? 'Player';
  const names = (ids: string[]) => ids.map(name).join(', ');
  const r = state.result;
  if (!state.finished) return null;
  return (
    <>
      {state.canSubmit && (
        <section className={card}>
          <h2 className="font-semibold">Add the result</h2>
          <p>Put each player on a side. The other side confirms it; ratings change once it is confirmed.</p>
          <ActionForm action={submitResult.bind(null, matchId, state.participants.map((p) => p.id))} button="Submit result">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="font-medium">Player</th>
                  <th className="font-medium">Side A</th>
                  <th className="font-medium">Side B</th>
                </tr>
              </thead>
              <tbody>
                {state.participants.map((p, i) => (
                  <tr key={p.id}>
                    <td className="py-1">{p.id === me ? `${p.name} (you)` : p.name}</td>
                    <td>
                      <input type="radio" name={`side-${p.id}`} value="a" required defaultChecked={i % 2 === 0} aria-label={`${p.name} on side A`} />
                    </td>
                    <td>
                      <input type="radio" name={`side-${p.id}`} value="b" defaultChecked={i % 2 === 1} aria-label={`${p.name} on side B`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className={labelClass}>
              Result
              <select name="outcome" required className={input}>
                <option value="a">Side A won</option>
                <option value="b">Side B won</option>
                <option value="draw">Draw</option>
              </select>
            </label>
            <label className={labelClass}>
              Score (optional)
              <input name="score" maxLength={60} placeholder="6-4 6-3" className={input} />
            </label>
          </ActionForm>
        </section>
      )}

      {r && (
        <section className={card}>
          <h2 className="font-semibold">Result</h2>
          <p>
            Side A: {names(r.sideA)}
            <br />
            Side B: {names(r.sideB)}
          </p>
          <p className="font-medium">
            {r.outcome === 'draw' ? 'Draw' : `Side ${r.outcome.toUpperCase()} won`}
            {r.score && ` · ${r.score}`}
          </p>
          <p>
            {r.status === 'pending' && `Waiting for the other side to confirm by ${formatDay(r.confirmBy, tz)}, ${formatTime(r.confirmBy, tz)}.`}
            {r.status === 'confirmed' && 'Confirmed. Ratings are updated.'}
            {r.status === 'disputed' && 'Disputed. SportsLink will review it and decide.'}
          </p>
          {state.canRespond && (
            <ActionForm action={respondToResult.bind(null, matchId)} button="Send">
              <label className="flex items-center gap-2">
                <input type="radio" name="answer" value="agree" required /> This is right
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="answer" value="dispute" /> This is wrong
              </label>
              <label className={labelClass}>
                If it is wrong, what happened?
                <textarea name="note" maxLength={500} rows={2} className={input} />
              </label>
            </ActionForm>
          )}
        </section>
      )}

      {state.reviewable.length > 0 && (
        <section className={card}>
          <h2 className="font-semibold">Review the players</h2>
          <p>Only about behaviour. Reviews never change skill ratings.</p>
          {state.reviewable.map((p) =>
            p.reviewed ? (
              <p key={p.id}>
                <Link href={`/players/${p.id}`} className="underline">
                  {p.name}
                </Link>{' '}
                · reviewed
              </p>
            ) : (
              <details key={p.id} className="rounded-md border p-3">
                <summary className="cursor-pointer">{p.name}</summary>
                <ActionForm action={reviewPlayer.bind(null, matchId, p.id)} button="Send review">
                  <label className={labelClass}>
                    Stars
                    <select name="stars" required defaultValue="5" className={input}>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <fieldset className="flex flex-wrap gap-3">
                    <legend className="mb-1 font-medium">Tags</legend>
                    {state.reviewTags.map((t) => (
                      <label key={t} className="flex items-center gap-1">
                        <input type="checkbox" name="tags" value={t} /> {tagName(t)}
                      </label>
                    ))}
                  </fieldset>
                  <label className={labelClass}>
                    Comment (optional, only our team sees it)
                    <input name="comment" maxLength={300} className={input} />
                  </label>
                </ActionForm>
              </details>
            ),
          )}
        </section>
      )}
    </>
  );
}
