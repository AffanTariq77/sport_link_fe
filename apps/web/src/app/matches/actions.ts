'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const num = (form: FormData, name: string) => (text(form, name) ? Number(text(form, name)) : undefined);
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function createMatch(_: FormState, form: FormData): Promise<FormState> {
  const where = text(form, 'where');
  const genderFilter = text(form, 'gender');
  const local = (name: string) => `${text(form, name)}:00+05:00`; // ponytail: Pakistan time until other countries launch
  const { data, error } = await api.POST('/matches', {
    headers: await authHeaders(),
    body: {
      sport: text(form, 'sport'),
      bookingId: where === 'booking' ? text(form, 'bookingId') : undefined,
      unlisted:
        where === 'unlisted'
          ? {
              name: text(form, 'venueName'),
              address: text(form, 'venueAddress'),
              latitude: Number(text(form, 'latitude')),
              longitude: Number(text(form, 'longitude')),
              startAt: local('startAt'),
              endAt: local('endAt'),
            }
          : undefined,
      acceptedUnlistedWarning: form.get('acceptedUnlistedWarning') === 'on',
      teamId: text(form, 'teamId') || undefined,
      opponentTeamId: text(form, 'opponentTeamId') || undefined,
      slotsTotal: Number(text(form, 'slotsTotal')),
      hostBrings: Number(text(form, 'hostBrings')),
      filters: {
        gender: genderFilter === 'female' || genderFilter === 'male' ? genderFilter : null,
        minAge: num(form, 'minAge'),
        maxAge: num(form, 'maxAge'),
        verifiedOnly: form.get('verifiedOnly') === 'on',
        minRating: num(form, 'minRating'),
        maxRating: num(form, 'maxRating'),
      },
    },
  });
  if (!data) return fail(error);
  redirect(`/matches/${data.id}`);
}

export async function joinMatch(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/join', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { acceptedUnlistedWarning: form.get('acceptedUnlistedWarning') === 'on' },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=requested`);
}

export async function decideRequest(id: string, userId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/requests/{userId}/{decision}', {
    params: { path: { id, userId, decision: form.get('decision') === 'approve' ? 'approve' : 'decline' } },
    headers: await authHeaders(),
  });
  if (error) return fail(error);
  redirect(`/matches/${id}`);
}

export async function removePlayer(id: string, userId: string): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/players/{userId}/remove', {
    params: { path: { id, userId } },
    headers: await authHeaders(),
  });
  if (error) return fail(error);
  redirect(`/matches/${id}`);
}

export async function leaveMatch(id: string): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/leave', { params: { path: { id } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=left`);
}

export async function cancelMatch(id: string): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/cancel', { params: { path: { id } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=cancelled`);
}

export async function payShare(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/pay', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: {
      method: text(form, 'method') as 'jazzcash' | 'easypaisa' | 'bank_transfer',
      txnReference: text(form, 'txnReference'),
    },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=paid`);
}

export async function submitResult(id: string, players: string[], _: FormState, form: FormData): Promise<FormState> {
  const side = (s: string) => players.filter((p) => text(form, `side-${p}`) === s);
  const { error } = await api.POST('/matches/{id}/result', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: {
      sideA: side('a'),
      sideB: side('b'),
      outcome: text(form, 'outcome') as 'a' | 'b' | 'draw',
      score: text(form, 'score') || undefined,
    },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=result`);
}

export async function respondToResult(id: string, _: FormState, form: FormData): Promise<FormState> {
  const agree = text(form, 'answer') === 'agree';
  const { error } = await api.POST('/matches/{id}/result/respond', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { agree, note: text(form, 'note') || undefined },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=${agree ? 'confirmed' : 'disputed'}`);
}

export async function reviewPlayer(id: string, toUserId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/reviews', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: {
      toUserId,
      stars: Number(text(form, 'stars')),
      tags: form.getAll('tags').map(String),
      comment: text(form, 'comment') || undefined,
    },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=reviewed`);
}

export async function acceptChallenge(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/matches/{id}/challenge', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { teamId: text(form, 'teamId') },
  });
  if (error) return fail(error);
  redirect(`/matches/${id}?done=challenge`);
}
