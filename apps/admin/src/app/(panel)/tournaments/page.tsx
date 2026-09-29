import { ActionForm, input, labelClass } from '@sportslink/ui';
import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';
import { createTournament } from './actions';

export default async function Tournaments() {
  const headers = await adminHeaders();
  const [{ data }, { data: sports }] = await Promise.all([api.GET('/admin/tournaments', { headers }), api.GET('/sports')]);
  return (
    <>
      <h1 className="text-2xl font-semibold">Tournaments</h1>
      <ul className="flex flex-col gap-2 text-sm">
        {data?.length === 0 && <li>No tournaments yet.</li>}
        {data?.map((t) => (
          <li key={t.id}>
            <Link href={`/tournaments/${t.id}`} className="underline">
              {t.name}
            </Link>{' '}
            · {t.sport} · {t.status.replace('_', ' ')}
          </li>
        ))}
      </ul>
      <details className="flex max-w-2xl flex-col gap-3 rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">Create a tournament</summary>
        <ActionForm action={createTournament} button="Create tournament">
          <label className={labelClass}>
            Name
            <input name="name" required minLength={3} maxLength={100} className={input} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Sport
              <select name="sport" className={input}>
                {sports?.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Format
              <select name="format" className={input}>
                <option value="knockout">Knockout</option>
                <option value="league">League (home and away)</option>
                <option value="round_robin">Round robin</option>
                <option value="groups_knockout">Groups then knockout</option>
              </select>
            </label>
            <label className={labelClass}>
              Entry
              <select name="entry" className={input}>
                <option value="individual">Individual players</option>
                <option value="team">Teams</option>
              </select>
            </label>
            <label className={labelClass}>
              Maximum entries
              <input name="maxEntries" type="number" min={2} max={256} defaultValue={16} required className={input} />
            </label>
            <label className={labelClass}>
              Entry fee (Rs, 0 for free)
              <input name="entryFee" inputMode="decimal" defaultValue="0" className={input} />
            </label>
            <label className={labelClass}>
              Group size (groups format)
              <input name="groupSize" type="number" min={3} max={8} defaultValue={4} className={input} />
            </label>
          </div>
          <label className={labelClass}>
            Where entrants pay (required if there is a fee)
            <input name="payTo" maxLength={300} placeholder="Account title, method and number" className={input} />
          </label>
          <label className={labelClass}>
            Venue
            <input name="venue" required minLength={2} maxLength={200} className={input} />
          </label>
          <label className={labelClass}>
            Prize (optional)
            <input name="prize" maxLength={200} className={input} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className={labelClass}>
              Entries close
              <input name="registrationDeadline" type="datetime-local" required className={input} />
            </label>
            <label className={labelClass}>
              Starts
              <input name="startsAt" type="datetime-local" required className={input} />
            </label>
            <label className={labelClass}>
              Ends
              <input name="endsAt" type="datetime-local" required className={input} />
            </label>
          </div>
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="mb-1 text-sm font-medium">Eligibility (optional)</legend>
            <label className={labelClass}>
              Minimum age
              <input name="minAge" type="number" min={5} max={100} className={input} />
            </label>
            <label className={labelClass}>
              Maximum age
              <input name="maxAge" type="number" min={5} max={100} className={input} />
            </label>
            <label className={labelClass}>
              Minimum rating
              <input name="minRating" type="number" min={0} max={4000} className={input} />
            </label>
            <label className={labelClass}>
              Maximum rating
              <input name="maxRating" type="number" min={0} max={4000} className={input} />
            </label>
            <label className={labelClass}>
              Gender
              <select name="gender" className={input}>
                <option value="">Anyone</option>
                <option value="female">Women</option>
                <option value="male">Men</option>
              </select>
            </label>
          </fieldset>
        </ActionForm>
      </details>
    </>
  );
}
