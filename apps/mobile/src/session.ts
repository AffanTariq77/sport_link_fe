import { createApiClient, type Schemas } from '@sportslink/api-client';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// In development the API runs on the same computer as the Expo dev server, so reuse that address.
// Builds that talk to a deployed API set EXPO_PUBLIC_API_URL.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:${process.env.EXPO_PUBLIC_API_PORT ?? '3000'}`;
export const api = createApiClient(API_URL);

type Tokens = Schemas['Tokens'];
const KEY = 'sl_tokens'; // Secure storage only (CLAUDE.md): Keychain on iOS, Keystore on Android.

export const saveTokens = (t: Tokens) => SecureStore.setItemAsync(KEY, JSON.stringify(t));
const clearTokens = () => SecureStore.deleteItemAsync(KEY);
const loadTokens = async () => {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
};

// One refresh at a time: the API treats a refresh token used twice as stolen.
let refreshing: Promise<Tokens | null> | null = null;

/** A valid access token, refreshed first if it is about to expire. Null when signed out. */
async function accessToken() {
  const t = await loadTokens();
  if (!t) return null;
  if (new Date(t.accessExpiresAt).getTime() > Date.now() + 30_000) return t.accessToken;
  refreshing ??= (async () => {
    const { data, response } = await api.POST('/auth/refresh', { body: { refreshToken: t.refreshToken } });
    if (data) await saveTokens(data);
    else if (response.status === 401) await clearTokens();
    return data ?? null;
  })().finally(() => (refreshing = null));
  return (await refreshing)?.accessToken ?? null;
}

/** The signed-in user, or null. Throws if the API cannot be reached. */
export async function currentUser() {
  const token = await accessToken();
  if (!token) return null;
  const { data } = await api.GET('/auth/me', { headers: { authorization: `Bearer ${token}` } });
  return data ?? null;
}

export async function signOut() {
  const token = await accessToken();
  if (token) await api.POST('/auth/logout', { headers: { authorization: `Bearer ${token}` } }).catch(() => undefined);
  await clearTokens();
}
