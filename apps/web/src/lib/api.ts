import { createApiClient } from '@sportslink/api-client';

// Server-side only: the browser never talks to the API directly and never sees tokens.
export const api = createApiClient(process.env.API_URL ?? 'http://localhost:3000');

// Tokens live in httpOnly cookies (CLAUDE.md: never localStorage). Each cookie expires with its token,
// so a missing access cookie means "refresh", handled in src/proxy.ts.
export const ACCESS_COOKIE = 'sl_access';
export const REFRESH_COOKIE = 'sl_refresh';

export const cookieOptions = (expiresAt: string) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  expires: new Date(expiresAt),
});
