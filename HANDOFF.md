# BusPulse — Handoff

_Last updated: 2026-07-01_

Real-time **bus** tracking for Metro Vancouver. **Expo SDK 56 / React Native (TypeScript)**,
GTFS static (`data/*.json`) + TransLink GTFS-RT V3 live feeds. Shipping **iOS-only** via EAS
Build → TestFlight → App Store. (App display name **BusPulse**; internal slug/bundle stay
`whereismybus` / `com.whereismybus.app` — do NOT change them.)

## Now
- Branch **`master`** @ `5b70643` — the big batch is **committed + pushed** (2026-07-02).
  `npx tsc --noEmit` clean · `npx expo export --platform ios` bundles clean.
- **Not yet built or deployed.** Holding on the EAS build credit until the user explicitly says go.
  Backend deploy is authorized but needs the user's host account (see Backend section).
- Last build on TestFlight is still the earlier UAT build (id `3e2a508b`).
- **Backend proxy + scheduled fallback** live in `server/` (built + tested locally) — see below.

## Features (full app surface)
4 tabs + modals, all working in Expo Go (except map/notifications — see `VERIFY_ON_BUILD.md`):
- **Nearby** — Apple/Google map + nearby bus stops; region-based stop loading; 5 filter chips
  (All / Bus / B-Line / RapidBus / Night — route-based); tap a bus → route highlight + beacon;
  "next bus" countdown on cards; distance + walk time; grouped FABs (settings, my-location);
  onboarding card on first run; empty-filter message.
- **Search** — stops (by name or sign number/`stop_code`) + routes; recent stops AND recent
  routes; distance on results.
- **Favourites** — one shared feed fetch for all cards; reorder; walk time (<3 km); pull-to-refresh;
  empty-state "Find a stop" CTA.
- **Alerts** — nearby bus-route filter, major/minor triage, Clear-all, 3am auto-clear badge,
  affected routes shown as route NUMBERS, relative "posted" time (recent only).
- **Stop detail** — live arrivals, NEXT BUS hero, "can I make it?" chip, green/amber/red freshness
  dot, **keeps last times on refresh failure** (spotty signal), route chips, star, **Share stop**, X.
- **Trip tracking** — live bus on map, yellow blinking beacon, "Your stop" pin, "Find bus".
- **Route detail** (stop list + "show live buses") and **Route map** (polyline + live buses).
- **Settings** — reminder lead time (2/5/10), privacy/support links, clear recent, about.
- Reminders: one-tap (uses saved lead time) local notifications. Dark mode via `useThemeColors`.
  Reduce-motion aware. Battery/quota: polling pauses when app is backgrounded / tab off-screen.

## Backend (server/) — built + tested locally, NOT deployed
Caching proxy for the GTFS-RT feeds. Fixes the **shared 1,000/day cap** (every device hits
TransLink with the same key today → can't scale). Server fetches each feed once per TTL and
serves all clients from cache → ~1 upstream request/window regardless of user count; key stays
server-side. Node/Express, in-flight dedupe + stale-on-error, optional `x-app-token`, `/health`.
Thoroughly tested locally: 3 feeds serve real protobuf, 404 on unknown, cache dedup proven.

**Scheduled-time fallback** (also built): `/v3/schedule?stopId=X` serves the timetable when a
stop has no live bus. `npm run build-schedule` builds `server/data/schedule.json` (31 MB, from
GTFS static) at deploy; server computes next departures in America/Vancouver time. Client shows a
"SCHEDULED DEPARTURES" list — **dormant unless `EXPO_PUBLIC_API_BASE` is set** (activates with the
proxy). E2E verified against a local proxy. Deploy: `render.yaml` blueprint (one-click, runs the
schedule build) or manual — see `server/README.md`. App proxy-ready via `EXPO_PUBLIC_API_BASE`
(unset → direct TransLink, current behaviour — deploy doesn't block the build).

## Next (to launch — when user authorizes)
1. **Commit the batch** (needs explicit OK — not done yet).
2. **On-device verification** via `VERIFY_ON_BUILD.md` — the emulator-blind items (notifications
   firing, Apple Maps + beacon, haptics, reduce-motion, onboarding, dark mode on iOS).
3. **EAS production build → TestFlight** — costs 1 credit; **only on explicit instruction**.
4. **App Store Connect listing** — `SUBMIT_GUIDE.md`: screenshots, description
   (`APP_STORE_LISTING.md`), keywords, **App Privacy = collects Location (not tracking)**, 4+,
   Free, attach build → Submit.
5. **Backend (optional, independent):** deploy `server/`, set `EXPO_PUBLIC_API_BASE` in a later
   build. Then scheduled-time fallback becomes feasible (needs `stop_times` served from backend).

## Key facts / IDs
- **Apple Developer / EAS login:** `mannprabhdeep95@gmail.com` (Team `J54NAB6FCX`). `mannd012@…`
  is billing only.
- **ascAppId:** `6782258055`. **EAS projectId:** `bdab8c0f-191b-4ab5-acb8-d57109162516`.
- **Live pages:** Privacy `https://mannd12.github.io/WhereIsMyBus/privacy-policy.html` ·
  Support `https://mannd12.github.io/WhereIsMyBus/support.html`.
- **API key:** `.env.local` → `EXPO_PUBLIC_TRANSLINK_API_KEY`; also an EAS production env var so
  builds bake it in. Free tier = **1,000 req/day shared** (the proxy is the real fix).
- More IDs in `PROJECT_IDS.txt` (gitignored).

## Watch out
- **Never** run `eas build`/`eas submit` without explicit user OK. Present a plan + confirm before
  writing code. **Do not git commit** without OK either.
- All `npm install`s (the APP) need `--legacy-peer-deps`; `.npmrc` has it for EAS `npm ci`. The
  `server/` package installs normally (no peer conflicts).
- **stop_id vs stop_code:** display + search use `stop_code` (sign number); navigation + real-time
  matching use `stop_id` (internal). Don't mix.
- **API key persistence:** `store/settings.ts` `merge` makes the env key always win over any
  persisted key — so a rotated/higher-quota key in a new build reaches existing users. Keep it.
- Refresh GTFS ~4×/year: `node scripts/fetchGtfsStatic.js`. QA the data: `node scripts/verifyStops.js`.
- Pre-ship check: `npx tsc --noEmit` (no ESLint config in repo).
- Emulator: Android map is blank (no Google key) — **iOS uses Apple Maps, fine**. Deep-link to
  navigate reliably: `exp://127.0.0.1:8081/--/<route>` (tab taps get hijacked by system UI).

## Run (dev / preview)
```powershell
cd C:\Users\mannp\OneDrive\Desktop\WhereIsMyBus
npx expo start --clear   # load in Expo Go on the Pixel_8 emulator
# Backend: cd server && TRANSLINK_API_KEY=<key> npm start   # then curl localhost:8080/health
```

## This effort (uncommitted) — high-value changes
Bus-only stop filter (hid 138 SkyTrain/SeaBus/WCE dead-ends) · fixed B-Line/RapidBus/Night filter
chips (were matching stop names, matched nothing) · **favourites single shared fetch** (was N
feed fetches) · **background/off-tab polling pause** (battery + quota) · **stop-detail keeps times
on refresh failure** · **API-key env-always-wins merge** · route-chip layout (flexGrow) · one-tap
reminders · share a stop · recent routes · alerts show route numbers · far-favourite walk-time ·
freshness dot · pull-to-refresh · **app.json: removed unused remote-notification bg mode +
Always-location** (App Review risk) · **backend proxy (`server/`)** + proxy-ready client.
See `VERIFY_ON_BUILD.md` for on-device checks and memory `project_current_state.md` for the full list.
