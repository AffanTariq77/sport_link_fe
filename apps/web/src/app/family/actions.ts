'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

export async function askGuardian(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/me/guardian', { headers: await authHeaders(), body: { phone: String(form.get('phone') ?? '') } });
  if (error) return { message: error.message };
  redirect('/');
}

export async function decideWard(id: string, version: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/me/wards/{id}/consent', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { accept: form.get('decision') === 'accept', version },
  });
  if (error) return { message: error.message };
  redirect('/');
}
