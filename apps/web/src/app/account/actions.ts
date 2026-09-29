'use server';

import type { FormState } from '@sportslink/ui';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, api, REFRESH_COOKIE } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function startPhoneChange(_: FormState, form: FormData): Promise<FormState> {
  const phone = text(form, 'phone');
  const { error } = await api.POST('/me/phone/start', { headers: await authHeaders(), body: { phone } });
  if (error) return fail(error);
  redirect(`/account?phone=${encodeURIComponent(phone)}`);
}

export async function confirmPhoneChange(phone: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/me/phone/confirm', {
    headers: await authHeaders(),
    body: { phone, oldCode: text(form, 'oldCode'), newCode: text(form, 'newCode') },
  });
  if (error) return fail(error);
  redirect('/account?done=phone');
}

export async function requestPhoneReview(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/me/phone/review', {
    headers: await authHeaders(),
    body: { phone: text(form, 'phone'), reason: text(form, 'reason') },
  });
  if (error) return fail(error);
  redirect('/account?done=review');
}

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  if (form.get('sure') !== 'on') return { message: 'Tick the box to confirm.' };
  const { error } = await api.POST('/me/delete', { headers: await authHeaders(), body: { confirm: true } });
  if (error) return fail(error);
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  redirect('/?deleted=1');
}
