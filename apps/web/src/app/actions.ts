'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, api, REFRESH_COOKIE } from '@/lib/api';
import { accessToken, saveTokens } from '@/lib/session';

export type SignInState = { step: 'phone' | 'code'; phone: string; message?: string };

const failed = 'Something went wrong. Please try again.';

/** Step 1 sends a code to the phone, step 2 checks it and signs in. */
export async function signIn(prev: SignInState, form: FormData): Promise<SignInState> {
  const phone = String(form.get('phone') ?? prev.phone);
  if (prev.step === 'phone' || form.get('resend')) {
    const { error } = await api.POST('/auth/otp/request', { body: { phone } });
    if (error) return { step: prev.step, phone, message: error.message ?? failed };
    return { step: 'code', phone, message: `We sent a 6-digit code to ${phone}.` };
  }

  const { data, error } = await api.POST('/auth/otp/verify', { body: { phone, code: String(form.get('code')) } });
  if (!data) return { step: 'code', phone, message: error?.message ?? failed };
  await saveTokens(data);
  redirect('/');
}

export async function signOut() {
  const token = await accessToken();
  if (token) await api.POST('/auth/logout', { headers: { authorization: `Bearer ${token}` } });
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  redirect('/');
}
