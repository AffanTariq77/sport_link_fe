import { formatDay } from '@sportslink/api-client';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { answerInvite, invitePlayer, leaveTeam, openTeamChat, removeMember, setMemberRole } from '../actions';
import { roleName } from '../names';

export const metadata: Metadata = { title: 'Team · SportsLink' };

const doneText: Record<string, string> = {
  invited: 'Invite sent. They join once they accept.',
  joined: 'You joined the team.',
  removed: 'Removed.',
  role: 'Role changed.',
};
const resultText = { won: 'Won', lost: 'Lost', draw: 'Draw' } as const;

export default async function TeamPage(props: PageProps<'/teams/[id]'>) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const { id } = await props.params;
  const { done } = await props.searchParams;
  const { data: t } = await api.GET('/teams/{id}', { params: { path: { id } }, headers: await authHeaders() });
  if (!t) notFound();
  const leader = t.myRole === 'captain' || t.myRole === 'vice_captain';

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6">
      <Link href="/teams" className="text-sm underline">
        Teams
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">{t.name}</h1>
        <p className="text-sm">
          {t.sport}
          {t.city && ` · ${t.city}`}
          {t.rating && ` · rating ${t.rating.rating} ${t.rating.provisional ? '(provisional)' : `· ${t.rating.tier}`}`}
        </p>
      </div>
      {typeof done === 'string' && doneText[done] && <p className="rounded-md border p-3 text-sm">{doneText[done]}</p>}

      {t.invited && (
        <section className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
          <p className="font-semibold">You are invited to join {t.name}.</p>
          <div className="flex gap-3">
            <ActionForm action={answerInvite.bind(null, t.id, true)} button="Join the team" className="flex" />
            <ActionForm action={answerInvite.bind(null, t.id, false)} button="Decline" className="flex" />
          </div>
        </section>
      )}

      {t.myRole && (
        <div className="flex flex-wrap gap-3">
          <ActionForm action={openTeamChat.bind(null, t.id)} button="Open the team chat" className="flex" />
          {leader && (
            <Link href={`/matches/new?team=${t.id}`} className="rounded-md border px-4 py-2 text-sm font-medium">
              Create a team match
            </Link>
          )}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Players</h2>
        {t.members.map((m) => (
          <div key={m.id} className="flex flex-col gap-2 rounded-md border p-3 text-sm">
            <p>
              <Link href={`/players/${m.id}`} className="font-medium underline">
                {m.name}
              </Link>{' '}
              · {m.status === 'invited' ? 'Invited' : roleName[m.role]}
              {m.id === user.id && ' (you)'}
            </p>
            {t.myRole === 'captain' && m.id !== user.id && m.status === 'active' && (
              <ActionForm action={setMemberRole.bind(null, t.id, m.id)} button="Change role" className="flex flex-wrap items-center gap-3">
                <select name="role" defaultValue={m.role} aria-label={`Role for ${m.name}`} className={input}>
                  <option value="member">Member</option>
                  <option value="vice_captain">Vice captain</option>
                  <option value="captain">Captain (hand over)</option>
                </select>
              </ActionForm>
            )}
            {leader && m.id !== user.id && m.role !== 'captain' && (
              <ActionForm action={removeMember.bind(null, t.id, m.id)} button={m.status === 'invited' ? 'Cancel invite' : 'Remove'} className="flex" />
            )}
          </div>
        ))}
      </section>

      {leader && (
        <section className="flex flex-col gap-3 rounded-lg border p-4">
          <h2 className="font-semibold">Invite a player</h2>
          <ActionForm action={invitePlayer.bind(null, t.id)} button="Send invite">
            <label className={labelClass}>
              Their SportsLink phone number
              <input name="phone" type="tel" required inputMode="tel" placeholder="0300 1234567" className={input} />
            </label>
          </ActionForm>
        </section>
      )}

      <section className="flex flex-col gap-2 text-sm">
        <h2 className="text-lg font-semibold">Team matches</h2>
        {t.matches.length === 0 && <p>No team matches yet.</p>}
        {t.matches.map((m) => (
          <Link key={m.id} href={`/matches/${m.id}`} className="flex justify-between rounded-md border p-3 hover:border-neutral-900">
            <span>
              {formatDay(m.startAt, 'Asia/Karachi')} · {m.opponent ? `v ${m.opponent}` : 'waiting for an opponent'}
            </span>
            <span>
              {m.result ? resultText[m.result] : m.status.replace('_', ' ')}
              {m.score && ` · ${m.score}`}
            </span>
          </Link>
        ))}
      </section>

      {t.myRole && <ActionForm action={leaveTeam.bind(null, t.id)} button="Leave the team" className="flex" />}
    </main>
  );
}
