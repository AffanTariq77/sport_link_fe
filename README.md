# SportsLink frontend

Monorepo for the SportsLink player and vendor apps and the admin panel. The API lives in `sport_link_be`.

| App | Path | Stack | Local URL |
| --- | --- | --- | --- |
| Player and vendor web | `apps/web` | Next.js 16, Tailwind | http://localhost:3001 |
| Admin panel | `apps/admin` | Next.js 16, Tailwind | http://localhost:3002 |
| Mobile (iOS, Android) | `apps/mobile` | Expo SDK 57, React Native | Expo Go or a simulator |

The API runs on http://localhost:3000 (see `sport_link_be`). If it runs elsewhere, set `API_URL` in
`apps/web/.env.local` and `apps/admin/.env.local`, and `EXPO_PUBLIC_API_PORT` (or `EXPO_PUBLIC_API_URL`) in
`apps/mobile/.env.local`.

## Getting started

Requirements: Node.js 22 or later, pnpm 9. For mobile: the Expo Go app on your phone, or Xcode / Android Studio.

```bash
pnpm install
pnpm dev                                  # all apps
pnpm --filter @sportslink/web dev         # one app
pnpm --filter @sportslink/mobile dev      # Expo, scan the QR code with Expo Go
```

After backend API changes, regenerate the client with the API running:
`API_URL=http://localhost:3000 pnpm --filter @sportslink/api-client generate`.

## Scripts

`pnpm lint`, `pnpm typecheck`, `pnpm build` run across every app through Turborepo.
