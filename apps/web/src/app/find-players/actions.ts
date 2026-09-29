'use server';

import type { FormState } from '@sportslink/ui';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const num = (form: FormData, name: string) => (text(form, name) ? Number(text(form, name)) : undefined);
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

/** Called from the browser with its position; the API rounds it to about 500 m before storing. */
export async function shareLocation(latitude: number, longitude: number): Promise<FormState> {
  const { error } = await api.PUT('/me/location', { headers: await authHeaders(), body: { latitude, longitude } });
  if (error) return fail(error);
  refresh();
  return {};
}

export async function saveAvailability(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.PUT('/me/availability', {
    headers: await authHeaders(),
    body: {
      alertMode: text(form, 'alertMode') as 'always' | 'available' | 'off',
      available: form.get('available') === 'on',
      quietHoursOk: form.get('quietHoursOk') === 'on',
    },
  });
  if (error) return fail(error);
  redirect('/find-players?done=saved');
}

export async function createRequest(_: FormState, form: FormData): Promise<FormState> {
  const window = text(form, 'window') as 'now' | 'today' | 'custom';
  const local = (name: string) => (text(form, name) ? `${text(form, name)}:00+05:00` : undefined); // ponytail: Pakistan time
  const { data, error } = await api.POST('/find-players', {
    headers: await authHeaders(),
    body: {
      sport: text(form, 'sport'),
      playersNeeded: Number(text(form, 'playersNeeded')),
      radiusKm: Number(text(form, 'radiusKm')),
      window,
      startAt: window === 'custom' ? local('startAt') : undefined,
      endAt: window === 'custom' ? local('endAt') : undefined,
      filters: { minRating: num(form, 'minRating'), maxRating: num(form, 'maxRating'), verifiedOnly: form.get('verifiedOnly') === 'on' },
    },
  });
  if (!data) return fail(error);
  redirect(`/find-players/${data.id}?sent=${data.notified}`);
}

export async function answerRequest(id: string, accept: boolean): Promise<FormState> {
  const { error } = await api.POST('/find-players/{id}/respond', { params: { path: { id } }, headers: await authHeaders(), body: { accept } });
  if (error) return fail(error);
  redirect(`/find-players/${id}`);
}

export async function pickPlayers(id: string, _: FormState, form: FormData): Promise<FormState> {
  const userIds = form.getAll('pick').map(String);
  if (!userIds.length) return { message: 'Tick the players you want.' };
  const { error } = await api.POST('/find-players/{id}/select', { params: { path: { id } }, headers: await authHeaders(), body: { userIds } });
  if (error) return fail(error);
  redirect(`/find-players/${id}`);
}

export async function dropPlayer(id: string, userId: string): Promise<FormState> {
  const { error } = await api.POST('/find-players/{id}/players/{userId}/remove', { params: { path: { id, userId } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(`/find-players/${id}`);
}

export async function closeRequest(id: string): Promise<FormState> {
  const { error } = await api.POST('/find-players/{id}/close', { params: { path: { id } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(`/find-players/${id}`);
}

export async function convertToMatch(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/find-players/{id}/convert', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { matchId: text(form, 'matchId') },
  });
  if (error) return fail(error);
  redirect(`/matches/${text(form, 'matchId')}`);
}

export async function openFindChat(requestId: string) {
  const { data } = await api.POST('/conversations/find/{requestId}', { params: { path: { requestId } }, headers: await authHeaders() });
  if (data) redirect(`/chats/${data.id}`);
  return { message: 'The chat opens once the organiser picks you.' };
}
