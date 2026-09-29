import { type NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, api, cookieOptions, REFRESH_COOKIE } from './lib/api';

// Access tokens last 15 minutes. When the access cookie has expired but the refresh cookie has not,
// swap it for new tokens before the page renders, so the user stays signed in.
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (request.cookies.has(ACCESS_COOKIE) || !refreshToken) return NextResponse.next();

  try {
    const { data, response } = await api.POST('/auth/refresh', { body: { refreshToken } });
    if (!data) {
      const res = NextResponse.next();
      if (response.status === 401) res.cookies.delete(REFRESH_COOKIE);
      return res;
    }
    // Forward the new access token to this render, and store both in the browser.
    request.cookies.set(ACCESS_COOKIE, data.accessToken);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.set(ACCESS_COOKIE, data.accessToken, cookieOptions(data.accessExpiresAt));
    res.cookies.set(REFRESH_COOKIE, data.refreshToken, cookieOptions(data.refreshExpiresAt));
    return res;
  } catch {
    return NextResponse.next(); // API unreachable: render signed out, keep the refresh cookie.
  }
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
