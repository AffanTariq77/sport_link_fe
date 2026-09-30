import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { createTeam } from './actions';
import { roleName } from './names';

export const metadata: Metadata = { title: 'Teams · SportsLink' };

export default async function TeamsPage() {
  if (!(await currentUser())) redirect('/sign-in');
  const headers = await authHeaders();
  const [{ data: mine, error }, { data: sports }] = await Promise.all([api.GET('/teams/mine', { headers }), api.GET('/sports')]);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <h1 className="text-2xl font-semibold">Teams</h1>
      {error && <p role="alert">{error.message}</p>}
      {mine?.length === 0 && <p className="text-sm">You are not in a team yet. Create one below, or ask a captain to invite you.</p>}
      <ul className="flex flex-col gap-2">
        {mine?.map((t) => (
          <li key={t.id}>
            <Link href={`/teams/${t.id}`} className="flex justify-between gap-3 rounded-xl border bg-card p-3 text-sm hover:border-accent">
              <span>
                <span className="block font-medium">{t.name}</span>
                <span className="block">
                  {t.sport}
                  {t.city && ` · ${t.city}`}
                </span>
              </span>
              <span className="self-center">{t.status === 'invited' ? 'Invited: open to answer' : roleName[t.role]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <details className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <summary className="cursor-pointer font-semibold">Create a team</summary>
        <ActionForm action={createTeam} button="Create team">
          <label className={labelClass}>
            Sport
            <select name="sport" required className={input}>
              {sports?.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Team name
            <input name="name" required minLength={2} maxLength={60} className={input} />
          </label>
          <label className={labelClass}>
            City (optional)
            <input name="city" maxLength={80} className={input} />
          </label>
        </ActionForm>
      </details>
    </main>
  );
}
