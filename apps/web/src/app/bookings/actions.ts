'use server';

import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

/** Holds the chosen slot, then shows it in My bookings with the advance to pay. */
export async function holdSlot(form: FormData) {
  const courtId = String(form.get('courtId') ?? '');
  const [startAt = '', endAt = ''] = String(form.get('slot') ?? '').split('|');
  const { data, error } = await api.POST('/bookings', {
    headers: await authHeaders(),
    body: { courtId, startAt, endAt },
  });
  const params = data ? `held=${data.id}` : `error=${encodeURIComponent(error?.message ?? 'Could not hold this slot.')}`;
  redirect(`/bookings?${params}`);
}

export type PayState = { message?: string };

/** Player reports the advance payment (or chooses to pay at the venue when allowed). */
export async function submitPayment(bookingId: string, _: PayState, form: FormData): Promise<PayState> {
  const method = String(form.get('method') ?? '') as 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cash';
  const txnReference = method === 'cash' ? undefined : String(form.get('txnReference') ?? '');
  const { data, error } = await api.POST('/bookings/{id}/payment', {
    params: { path: { id: bookingId } },
    headers: await authHeaders(),
    body: { method, txnReference },
  });
  if (!data) return { message: error?.message ?? 'Something went wrong. Please try again.' };
  redirect(`/bookings?held=${bookingId}`);
}

export async function cancelBooking(id: string): Promise<PayState> {
  const { data, error } = await api.POST('/bookings/{id}/cancel', { params: { path: { id } }, headers: await authHeaders() });
  if (!data) return { message: error?.message ?? 'Something went wrong. Please try again.' };
  redirect(`/bookings?cancelled=${data.refunds ? 'refund' : 'none'}`);
}

export async function answerRefund(id: string, received: boolean): Promise<PayState> {
  const headers = await authHeaders();
  const { error } = received
    ? await api.POST('/refunds/{id}/received', { params: { path: { id } }, headers })
    : await api.POST('/refunds/{id}/dispute', { params: { path: { id } }, headers, body: {} });
  if (error) return { message: error.message };
  redirect('/bookings');
}

export async function reviewVenue(bookingId: string, _: PayState, form: FormData): Promise<PayState> {
  const { error } = await api.POST('/bookings/{id}/review', {
    params: { path: { id: bookingId } },
    headers: await authHeaders(),
    body: { stars: Number(form.get('stars')), comment: String(form.get('comment') ?? '').trim() || undefined },
  });
  if (error) return { message: error.message ?? 'Something went wrong. Please try again.' };
  redirect('/bookings?reviewed=1');
}

/** Holds the weeks the player kept, then goes to paying them all at once. */
export async function holdWeekly(courtId: string, startAt: string, endAt: string, weeks: string[], _: PayState, form: FormData): Promise<PayState> {
  const keep = new Set(form.getAll('week').map(String));
  if (!keep.size) return { message: 'Keep at least one week.' };
  const { data, error } = await api.POST('/bookings/recurring', {
    headers: await authHeaders(),
    body: { courtId, startAt, endAt, weeks: weeks.length, skip: weeks.filter((w) => !keep.has(w)) },
  });
  if (!data) return { message: error?.message ?? 'Something went wrong. Please try again.' };
  redirect(`/bookings/series/${data.seriesId}/pay`);
}

export async function submitSeriesPayment(seriesId: string, _: PayState, form: FormData): Promise<PayState> {
  const method = String(form.get('method') ?? '') as 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cash';
  const txnReference = method === 'cash' ? undefined : String(form.get('txnReference') ?? '');
  const { data, error } = await api.POST('/bookings/series/{id}/payment', {
    params: { path: { id: seriesId } },
    headers: await authHeaders(),
    body: { method, txnReference },
  });
  if (!data) return { message: error?.message ?? 'Something went wrong. Please try again.' };
  redirect('/bookings?paid=weekly');
}

export async function extendBooking(id: string): Promise<PayState> {
  const { data, error } = await api.POST('/bookings/{id}/extend', { params: { path: { id } }, headers: await authHeaders(), body: {} });
  if (!data) return { message: error?.message ?? 'The next slot is not free.' };
  redirect(`/bookings/${data.id}/pay`);
}
