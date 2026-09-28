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
