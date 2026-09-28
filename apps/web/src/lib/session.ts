import { cookies } from 'next/headers';
import type { Schemas } from '@sportslink/api-client';
import { ACCESS_COOKIE, api, cookieOptions, REFRESH_COOKIE } from './api';

export async function saveTokens(t: Schemas['Tokens']) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, t.accessToken, cookieOptions(t.accessExpiresAt));
  jar.set(REFRESH_COOKIE, t.refreshToken, cookieOptions(t.refreshExpiresAt));
}

export async function accessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/** The signed-in user, or null. */
export async function currentUser() {
  const token = await accessToken();
  if (!token) return null;
  const { data } = await api.GET('/auth/me', { headers: { authorization: `Bearer ${token}` } });
  return data ?? null;
}
