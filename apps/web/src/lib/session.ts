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

/** Authorization header for API calls on behalf of the signed-in user. */
export async function authHeaders() {
  return { authorization: `Bearer ${await accessToken()}` };
}

/** The signed-in user, or null. */
export async function currentUser() {
  if (!(await accessToken())) return null;
  const { data } = await api.GET('/auth/me', { headers: await authHeaders() });
  return data ?? null;
}

/**
 * Where a signed-in user must go before using the app: profile first, then ID if the
 * `verification.required_at` setting asks for it at sign-up. Null when onboarding is complete.
 */
export async function onboardingStep(user: Schemas['User']) {
  if (!user.name) return '/onboarding/profile' as const;
  const { data } = await api.GET('/me/verification', { headers: await authHeaders() });
  if (data?.requiredAt === 'signup' && (data.status === 'none' || data.status === 'rejected')) {
    return '/onboarding/verify' as const;
  }
  return null;
}
