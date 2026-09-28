// Typed client for the SportsLink API. `schema.d.ts` is generated from the backend's OpenAPI spec:
// run `pnpm --filter @sportslink/api-client generate` with the API running (API_URL defaults to http://localhost:3000).
// Never edit schema.d.ts by hand.
import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

export type Schemas = components['schemas'];
export type ApiError = Schemas['ApiError'];

export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}

export type ApiClient = ReturnType<typeof createApiClient>;
export * from './format';
