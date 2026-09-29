'use server';

import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

export type SendState = { message?: string; warning?: string; body?: string; sentAt?: number };

export async function openMatchChat(matchId: string) {
  const { data } = await api.POST('/conversations/match/{matchId}', { params: { path: { matchId } }, headers: await authHeaders() });
  if (data) redirect(`/chats/${data.id}`);
  return { message: 'You can chat once the host has approved you.' };
}

export async function openBookingChat(bookingId: string) {
  const { data } = await api.POST('/conversations/booking/{bookingId}', {
    params: { path: { bookingId } },
    headers: await authHeaders(),
  });
  if (data) redirect(`/chats/${data.id}`);
  return { message: 'Chat is not available for this booking.' };
}

/** Sends a message. A phone number comes back as a warning first; sending again with confirm set sends it. */
export async function sendMessage(id: string, _: SendState, form: FormData): Promise<SendState> {
  const body = String(form.get('body') ?? '');
  const { data, error, response } = await api.POST('/conversations/{id}/messages', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { body, confirmPhone: form.get('confirmPhone') === '1' },
  });
  if (data) return { sentAt: Date.now() };
  if (response.status === 409) return { warning: error?.message, body };
  return { message: error?.message ?? 'Something went wrong. Please try again.', body };
}

export async function reportChat(id: string, _: SendState, form: FormData): Promise<SendState> {
  const { error } = await api.POST('/conversations/{id}/report', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: { reason: String(form.get('reason') ?? 'other'), details: String(form.get('details') ?? '') || undefined },
  });
  return { message: error ? error.message : 'Thank you. Our safety team will review this chat.' };
}

export async function blockPerson(userId: string, back: string) {
  await api.POST('/users/{id}/block', { params: { path: { id: userId } }, headers: await authHeaders() });
  redirect(back);
}
