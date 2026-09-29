'use server';

import { toMinor } from '@sportslink/api-client';
import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { adminHeaders, api } from '@/lib/api';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const num = (form: FormData, name: string) => (text(form, name) ? Number(text(form, name)) : undefined);
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });
const local = (form: FormData, name: string) => `${text(form, name)}:00+05:00`; // ponytail: Pakistan time

export async function createTournament(_: FormState, form: FormData): Promise<FormState> {
  const typedFee = text(form, 'entryFee');
  const fee = !typedFee || Number(typedFee) === 0 ? 0 : toMinor(typedFee, 'PKR');
  if (fee === null) return { message: 'Enter the entry fee in rupees.' };
  const { data, error } = await api.POST('/admin/tournaments', {
    headers: await adminHeaders(),
    body: {
      sport: text(form, 'sport'),
      name: text(form, 'name'),
      format: text(form, 'format') as 'knockout' | 'league' | 'round_robin' | 'groups_knockout',
      teamEntry: text(form, 'entry') === 'team',
      entryFee: fee,
      prize: text(form, 'prize') || undefined,
      venue: text(form, 'venue'),
      registrationDeadline: local(form, 'registrationDeadline'),
      startsAt: local(form, 'startsAt'),
      endsAt: local(form, 'endsAt'),
      maxEntries: Number(text(form, 'maxEntries')),
      groupSize: num(form, 'groupSize'),
      payTo: text(form, 'payTo') || undefined,
      eligibility: {
        minAge: num(form, 'minAge'),
        maxAge: num(form, 'maxAge'),
        minRating: num(form, 'minRating'),
        maxRating: num(form, 'maxRating'),
        gender: text(form, 'gender') ? (text(form, 'gender') as 'male' | 'female') : null,
      },
    },
  });
  if (!data) return fail(error);
  redirect(`/tournaments/${data.id}`);
}

export async function entryDecision(id: string, entryId: string, decision: 'confirm' | 'reject' | 'withdraw' | 'unlock' | 'lock'): Promise<FormState> {
  const { error } = await api.POST('/admin/tournaments/{id}/entries/{entryId}/{decision}', {
    params: { path: { id, entryId, decision } },
    headers: await adminHeaders(),
    body: {},
  });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=1`);
}

export async function makeDraw(id: string): Promise<FormState> {
  const { error } = await api.POST('/admin/tournaments/{id}/draw', { params: { path: { id } }, headers: await adminHeaders() });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=1`);
}

export async function startKnockout(id: string): Promise<FormState> {
  const { error } = await api.POST('/admin/tournaments/{id}/knockout', { params: { path: { id } }, headers: await adminHeaders() });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=1`);
}

export async function enterResult(id: string, fixtureId: string, _: FormState, form: FormData): Promise<FormState> {
  const walkover = text(form, 'walkover');
  const { error } = await api.POST('/admin/tournaments/{id}/fixtures/{fixtureId}/result', {
    params: { path: { id, fixtureId } },
    headers: await adminHeaders(),
    body: walkover
      ? { walkover: true, winner: walkover as 'a' | 'b' }
      : { scoreA: num(form, 'scoreA'), scoreB: num(form, 'scoreB'), winner: (text(form, 'winner') || undefined) as 'a' | 'b' | undefined },
  });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=1`);
}

export async function cancelTournament(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/tournaments/{id}/cancel', { params: { path: { id } }, headers: await adminHeaders(), body: { reason: text(form, 'reason') } });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=1`);
}
