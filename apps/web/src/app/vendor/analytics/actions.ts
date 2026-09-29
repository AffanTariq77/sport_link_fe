'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

export async function replyToReview(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/reviews/{id}/reply', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { reply: String(form.get('reply') ?? '').trim() },
  });
  if (error) return { message: error.message ?? 'Something went wrong. Please try again.' };
  redirect('/vendor/analytics?done=reply');
}
