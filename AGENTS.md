# AGENTS

## Project Snapshot
- **Name & goal**: `GuestSpot` is a Quasar + Vue 3 spa that also targets Capacitor/Cordova for iOS and Android, offering a mobile-first guest scheduling and payments experience.
- **Core tech**: Vue 3 + Composition API, Pinia for state, Apollo GraphQL client, Quasar UI/Vite tooling, and Capacitor native integrations (camera, geolocation, push, social logins, Stripe, Apple Sign‑In).
- **Additional services**: Sentry for error monitoring, Stripe for payments, Firebase push notifications, Leaflet for mapping, and i18n/localization support.

## Repository Layout
- `src/` – main Vue/Quasar code (components, pages, composables, modules, etc.).
- `src-capacitor/` – Capacitor native projects and configuration for Android/iOS builds.
- `docs/` – user-facing guides (quick start, mobile setup, Android release, Google auth, push notifications, Sentry, payment flow).
- `scripts/` – helper scripts (e.g., custom builds such as `scripts/build-aab.sh`).
- `public/` – static assets (icons, logos, etc.).
- Root config: `quasar.config.ts`, `eslint.config.js`, `tsconfig.json`, `apollo.config.cjs`.

## Typical Workflow
1. `npm install` to fetch dependencies (requires Node ≥20.19 recommended by `package.json`).
2. `npm run dev` for web development; `npm run capacitor:dev` for live mobile preview.
3. `npm run build` to ship a production spa; mobile builds via Capacitor scripts/commands listed in `package.json` (caps: `capacitor:build`, `capacitor:run`, targeted Android/iOS flags, `capacitor:build:aab`).
4. Linting via `npm run lint` and formatting via `npm run format`.

## Developer Notes
- **Environments**: To add a new environment variable:
  1. Add it to `.env` (and `.env.example`).
  2. Register it in `quasar.config.ts` under the `build.env` object.
  3. Access it in code via `process.env.YOUR_VAR`.
  Native assets are synced from `src/`.
- **State & data**: Pinia stores under `src/stores`, `src/modules` hold reusable logic, and `src/composables` (e.g., `useGuestSpot`, `useUser`).
- **GraphQL**: Apollo client configured with `@apollo/client` and `@vue/apollo-composable` for queries/mutations; look at `src/graphql` (if present) or modules interacting with API.
- **UI**: Quasar components, Vue Router (`src/router`), i18n translations (`src/i18n`).
- **Mobile-specific**: Capacitor config and native modules live under `src-capacitor/`; Cordova support exists via `src-cordova` for legacy needs.

## Brand Identity (Anthropic Style)
- **Palette**: Dark (`#141413`), Light (`#faf9f5`), Mid Gray (`#b0aea5`).
- **Accents**: Orange (`#d97757` - Primary CTA), Blue (`#6a9bcc`), Green (`#788c5d`).
- **Typography**: `Poppins` for headings, `Lora` for body text.
- **Voice**: Professional, Clear, and Empathetic. Use plain language, be direct and reassuring.
- **UI UX**: Prefer glassmorphism, micro-animations, and vibrant interactive elements.

## Key Documentation
- Follow `docs/QUICK_START.md` and `docs/MOBILE_SETUP.md` for onboarding.
- Use `docs/ANDROID_BUILD.md`, `docs/GOOGLE_AUTH_SETUP.md`, `docs/FIREBASE_PUSH_NOTIFICATIONS_SETUP.md`, `docs/SENTRY_SETUP.md`, and `docs/PAYMENT_FLOW.md` when touching respective domains.

## Testing & Quality
- No automated tests are configured (`npm run test` is a placeholder). Rely on manual QA and mobile simulators/emulators outlined in docs.
- Use `npm run lint` before pull requests; formatting support via Prettier config in root (run `npm run format`).

## Next Agent Tips
- Default to Quasar/Vite dev servers for UI changes; run Capacitor sync when native assets change.
- Watch for Capacitor/Cordova-specific scripts (`mobile:*`, `capacitor:*`, `scripts/build-aab.sh`).
- Consult `docs/` for release, auth, push, and payment conventions before modifying related code.
