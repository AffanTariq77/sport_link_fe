'use server';

import type { FormState } from '@sportslink/ui';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, adminHeaders, api } from '@/lib/api';

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const { data, error } = await api.POST('/admin/auth/login', {
    // Pass the admin's own address through for the audit log.
    headers: { 'x-forwarded-for': (await headers()).get('x-forwarded-for') ?? '' },
    body: {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      code: String(form.get('code') ?? ''),
    },
  });
  if (!data) return { message: error?.message ?? 'Something went wrong. Please try again.' };
  (await cookies()).set(ADMIN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(data.expiresAt),
  });
  redirect('/');
}

export async function logout() {
  await api.POST('/admin/auth/logout', { headers: await adminHeaders() });
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/login');
}
