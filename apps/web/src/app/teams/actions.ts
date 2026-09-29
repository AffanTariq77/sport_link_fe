'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function createTeam(_: FormState, form: FormData): Promise<FormState> {
  const { data, error } = await api.POST('/teams', {
    headers: await authHeaders(),
    body: { sport: text(form, 'sport'), name: text(form, 'name'), city: text(form, 'city') || undefined },
  });
  if (!data) return fail(error);
  redirect(`/teams/${data.id}`);
}

export async function invitePlayer(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/teams/{id}/invites', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { phone: text(form, 'phone') },
  });
  if (error) return fail(error);
  redirect(`/teams/${id}?done=invited`);
}

export async function answerInvite(id: string, accept: boolean): Promise<FormState> {
  const { error } = await api.POST('/teams/{id}/invites/respond', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { accept },
  });
  if (error) return fail(error);
  redirect(accept ? `/teams/${id}?done=joined` : '/teams');
}

export async function leaveTeam(id: string): Promise<FormState> {
  const { error } = await api.POST('/teams/{id}/leave', { params: { path: { id } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect('/teams');
}

export async function removeMember(id: string, userId: string): Promise<FormState> {
  const { error } = await api.POST('/teams/{id}/members/{userId}/remove', {
    params: { path: { id, userId } },
    headers: await authHeaders(),
  });
  if (error) return fail(error);
  redirect(`/teams/${id}?done=removed`);
}

export async function setMemberRole(id: string, userId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/teams/{id}/members/{userId}/role', {
    params: { path: { id, userId } },
    headers: await authHeaders(),
    body: { role: text(form, 'role') as 'captain' | 'vice_captain' | 'member' },
  });
  if (error) return fail(error);
  redirect(`/teams/${id}?done=role`);
}

export async function openTeamChat(teamId: string) {
  const { data } = await api.POST('/conversations/team/{teamId}', { params: { path: { teamId } }, headers: await authHeaders() });
  if (data) redirect(`/chats/${data.id}`);
  return { message: 'Join the team to use its chat.' };
}
