# SportsLink frontend (sport_link_fe)

Player and vendor apps plus the admin panel for SportsLink: sports venue booking, matchmaking,
live Find Players, ratings and tournaments. Launch market Pakistan. The API is the separate repo `sport_link_be`.

Full spec: `docs/SPEC.md`. Business rules: `docs/FOUNDATION.md`. Read the relevant section before building a screen.

## Layout

- `apps/web`: Next.js 16 (App Router, Tailwind). Players and vendors, one account with a Player or Vendor mode switch.
- `apps/admin`: Next.js 16, deployed separately from `web`. Admin login with mandatory two-factor.
- `apps/mobile`: Expo SDK 57 (React Native). Same Player and Vendor modes as web.
- `packages/`: shared code goes here when two apps need it (API client, types, validation). Do not create a package for one user.

Next.js 16 and Expo 57 are newer than most training data. `apps/web/AGENTS.md`, `apps/admin/AGENTS.md` and
`apps/mobile/AGENTS.md` point to the installed docs: read them before writing framework code.

## API

- The API client is generated from the backend's OpenAPI spec into `packages/api-client` (`openapi-fetch` + `openapi-typescript`). After backend changes, run `API_URL=<api> pnpm --filter @sportslink/api-client generate`. Never hand-write API types or edit `schema.d.ts`.
- Onboarding is built (sign in, then profile, then ID upload): web in `apps/web/src/app/sign-in`, `onboarding/`, `actions.ts` and `proxy.ts` (httpOnly cookies, refresh in the proxy); mobile home route `apps/mobile/src/app/index.tsx`, `src/screens/` and `src/session.ts` (expo-secure-store, expo-image-picker).
- Venues and booking are built: web `apps/web/src/app/venues` and `bookings`, mobile Expo Router routes `src/app/venues` and `src/app/bookings.tsx`. Players browse venues, see the refund policy, pick a court, day and slot, hold it, and pay the advance (web `bookings/[id]/pay`, mobile `src/app/pay/[id].tsx`). Vendors confirm or reject payments (web `vendor/payments`, mobile `src/app/vendor/payments.tsx`), shown when `GET /vendor/access` returns a vendor.
- Vendor onboarding: web `vendor/` (apply, venues, payment accounts) and `vendor/branches/[id]` (details, policy, courts, hours, prices, checklist, send for review) using `components/action-form.tsx`; mobile `src/app/vendor/index.tsx` (apply and setup status; editing is on the web for now). `toMinor`/`fromMinor` convert typed rupees for the API.
- Vendor calendar and staff: web `vendor/calendar` (day view per court, walk-ins, blocks, no-shows) and a staff section on `vendor/`; mobile `src/app/vendor/calendar.tsx` (day view, walk-ins and blocks).
- Matches: web `matches/` (list, `new`, `[id]` with join, host approvals, pay share), mobile `src/app/matches/`. The unlisted venue warning (`components/unlisted-warning.tsx` on web, an alert on mobile) is shown every time before creating or joining.
- Chat: web `chats/` (thread polls through the `chats/[id]/poll` route because the browser has no API token; phone warning with Send anyway; report and block), mobile `src/app/chats/` (polling, alert for the phone warning, long-press a message to block). Entry points on matches, bookings and vendor pages.
- Cancellations and refunds: player cancel and refund confirmation on web `bookings` and mobile `bookings.tsx`; vendor cancel from the web calendar; refunds to send on web `vendor/refunds` and mobile `vendor/refunds.tsx`.
- Billing: web `vendor/billing` (running total, invoices, proof upload), admin `(panel)/invoices` (run billing, proof via `invoice-proof/[id]`, paid, write off), mobile vendor screen summary.
- Admin panel (`apps/admin`): sign-in with two-factor code, admin token in an httpOnly `sla_admin` cookie, route group `(panel)` with navigation filtered by permissions: overview, identity checks (images streamed through `documents/[id]/[side]`, never public or cached), venues (visits, billing, status), payment accounts, users and bans, reports, audit log.
- `packages/ui`: shared web components (`ActionForm`, `keepValues`); both Next apps `@source` it for Tailwind. Forms submit through `keepValues` so React 19 does not clear fields when an action returns an error.
- Shared display helpers (`formatMoney` with ISO minor units, venue-time `formatTime` and `formatDay`, `describePolicy`, `paymentMethodName`, `bookingStatusText`) live in `packages/api-client/src/format.ts`. Local API address: `API_URL` in `apps/web/.env.local`, `EXPO_PUBLIC_API_PORT` in `apps/mobile/.env.local`.
- Never call the database or third-party services directly from the frontend.
- Auth tokens: secure storage on mobile (expo-secure-store), httpOnly cookies on web. Never localStorage.

## Product rules the UI must respect

- Phone numbers of other users are never shown.
- Only approximate distance is shown for players (for example "2 to 5 km"), never a map pin of a person.
- Unlisted venues always show the warning screen before creating or joining a match there.
- In chat, typing a phone number shows a safety warning before sending.
- Prices come from the API in minor units (paisa for PKR) and are formatted for display; the UI never calculates prices.
- Refund and cancellation policy is shown before the player pays.
- Minors: safeguards are feature flags from the API; hide features the flags turn off.
- User-facing text in British English, sentence case, plain verbs.

## Design

The SportsLink brand (logo, colours, fonts) is not set yet. Screens use placeholder styling in `globals.css`.
Do not invent a brand. When it is ready, put the tokens in one place per app and use them everywhere.

## Engineering rules

- Treat code as production-bound.
- Never hardcode secrets. Public config via `NEXT_PUBLIC_*` or Expo `extra` only for non-secret values. Flag any secret found in code.
- Prefer minimal diffs. Do not refactor unrelated code.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm build` after every change. Report failures honestly.
- Ask before destructive or irreversible operations (deleting files in bulk, force pushes, rewriting history).
- No real CNIC images, phone numbers or payment details in fixtures or screenshots.
- Do not invent features that are not in the spec. Ask instead.

## Next steps (Phase 1)

1. Brand and design system once the brand is chosen
2. Guardian consent flow for minors (sign-in, profile and ID upload are done)
4. Venue search, venue page, booking with split payment and payment confirmation status
5. Vendor mode: venue photos (onboarding, courts, pricing, calendar, manual bookings, blocks, payment queue and staff are done)
6. Match results (create, join, host approval and shares are done)
7. Chat: realtime and media (text chat with the phone warning is done)
8. Admin: admin user management (approvals, site visits, bans, commission, invoices, reports and audit log are done)
