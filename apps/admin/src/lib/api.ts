import { createApiClient } from '@sportslink/api-client';
import { cookies } from 'next/headers';

// Server-side only. The admin token lives in an httpOnly cookie and never reaches browser JavaScript.
export const api = createApiClient(process.env.API_URL ?? 'http://localhost:3000');
export const ADMIN_COOKIE = 'sla_admin';

export async function adminHeaders() {
  return { authorization: `Bearer ${(await cookies()).get(ADMIN_COOKIE)?.value}` };
}

/** The signed-in admin with their permissions, or null. */
export async function currentAdmin() {
  if (!(await cookies()).has(ADMIN_COOKIE)) return null;
  const { data } = await api.GET('/admin/me', { headers: await adminHeaders() });
  return data ?? null;
}
