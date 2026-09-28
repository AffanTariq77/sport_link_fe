import { ADMIN_COOKIE, adminHeaders } from '@/lib/api';
import { cookies } from 'next/headers';

// Streams a CNIC or B-Form image from the API for a signed-in admin. The API checks the permission and
// writes the audit log entry; nothing is cached anywhere.
export async function GET(_: Request, ctx: RouteContext<'/documents/[id]/[side]'>) {
  if (!(await cookies()).has(ADMIN_COOKIE)) return new Response('Please sign in.', { status: 401 });
  const { id, side } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id) || !['front', 'back'].includes(side)) return new Response('Not found.', { status: 404 });
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3000'}/admin/verifications/${id}/${side}`, {
    headers: await adminHeaders(),
    cache: 'no-store',
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream', 'Cache-Control': 'no-store' },
  });
}
