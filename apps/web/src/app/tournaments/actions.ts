'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function enterTournament(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/tournaments/{id}/entries', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { teamId: text(form, 'teamId') || undefined },
  });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=entered`);
}

export async function payEntry(id: string, entryId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/tournaments/{id}/entries/{entryId}/pay', {
    params: { path: { id, entryId } },
    headers: await authHeaders(),
    body: { method: text(form, 'method') as 'jazzcash' | 'easypaisa' | 'bank_transfer', txnReference: text(form, 'txnReference') },
  });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=paid`);
}

export async function withdrawEntry(id: string, entryId: string): Promise<FormState> {
  const { error } = await api.POST('/tournaments/{id}/entries/{entryId}/withdraw', { params: { path: { id, entryId } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(`/tournaments/${id}?done=withdrawn`);
}
