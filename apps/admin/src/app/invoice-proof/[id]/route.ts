import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminHeaders } from '@/lib/api';

// Streams a vendor's proof of payment to a signed-in admin; the API checks the billing permission.
export async function GET(_: Request, ctx: RouteContext<'/invoice-proof/[id]'>) {
  if (!(await cookies()).has(ADMIN_COOKIE)) return new Response('Please sign in.', { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found.', { status: 404 });
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3000'}/admin/invoices/${id}/proof`, {
    headers: await adminHeaders(),
    cache: 'no-store',
  });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') ?? 'image/jpeg', 'Cache-Control': 'no-store' } });
}
