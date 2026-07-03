# BusPulse — Handoff

_Last updated: 2026-07-02_

Real-time **bus** tracking for Metro Vancouver. **Expo SDK 56 / React Native (TypeScript strict)**,
GTFS static (`data/*.json`) + TransLink GTFS-RT V3 live feeds, through a caching proxy on EAS
Hosting. Shipping **iOS-only** via EAS Build → TestFlight → App Store. (Display name **BusPulse**;
internal slug/bundle stay `whereismybus` / `com.whereismybus.app` — do NOT change: renaming the
AsyncStorage `whereismybus-*` keys wipes users' favourites.)

## Now (state)
- Branch **`master`** @ **`5f12947`** — everything committed + pushed, tree clean.
  `npx tsc --noEmit` clean · `npx expo export --platform ios` clean.
- **Build 21 (1.0.0) is on TestFlight** (build id `f647de4e`) — first build wired to the live
  backend. It's testable now.
- **Backend proxy is LIVE** on EAS Hosting → https://whereismybus.expo.app (see Backend).
- A **Fable-audit fix batch** is pushed but **not yet in a build** — it ships in **build 22**.

## ⚠️ Two open actions (read before finalizing)
1. **Redeploy the proxy** — the audit found an unauthenticated quota-burn hole (`feed in TTL`
   accepted `/api/toString` etc., each burning an upstream request). **Fixed in code, not yet
   live.** Run `npx eas deploy --prod --environment production` (hosting only — **NO build credit**)
   from repo root after `npx expo export --platform web --output-dir dist`. Until then the live
   endpoint is still vulnerable.
2. **Key rotation** — builds ≤21 embed the TransLink key in the binary. Build 22 uses proxy-only
   mode (no key in bundle, no `?apikey=` on URLs). **After build 22 verifies on TestFlight:**
   remove `EXPO_PUBLIC_TRANSLINK_API_KEY` from EAS prod env, then rotate the key at
   developer.translink.ca. (Rotation is safe for build 21 too — the proxy ignores the client key.)

## Finalization path (to App Store)
1. **Build 22** (spends 1 credit — only on explicit user OK):
   `npx eas build -p ios --profile production --non-interactive --no-wait` (creds stored on EAS, no
   Apple login), then `npx eas submit -p ios --latest --non-interactive` (ASC key `5Q43V42TAQ` on EAS).
   Auto-increments to build 22; `EXPO_PUBLIC_API_BASE` is already in EAS env so it wires the proxy.
2. **On-device verify** build 22 via `VERIFY_ON_BUILD.md` (notifications firing, Apple Maps + yellow
   beacon, haptics, VoiceOver, dark mode, share sheet, onboarding — all emulator-blind). Especially:
   **do arrivals load?** = proves the proxy path end-to-end.
3. **Do the two open actions above** (redeploy proxy; then key rotation after build 22 is good).
4. **App Store Connect listing** — follow `SUBMIT_GUIDE.md` + `APP_STORE_LISTING.md`:
   Name BusPulse, Subtitle "Real-time TransLink arrivals", Category Navigation/Travel, Free,
   screenshots (iPhone 6.7"), keywords, **App Privacy = collects Location (not tracking; on-device)**,
   Age 4+, Support/Privacy URLs (below), attach build 22 → **Submit for Review** (~24–48h).

## Features (full app surface)
4 tabs + modals:
- **Nearby** — Apple Maps + nearby bus stops; region-based stop loading; 5 route-based filter chips
  (All / Bus / B-Line / RapidBus / Night); tap a bus → route highlight + yellow beacon; "next bus"
  countdown on cards; distance + walk time; grouped FABs (settings, my-location); onboarding on
  first run; viewport-filtered vehicle markers (cap 200).
- **Search** — stops (name or sign number/`stop_code`) + routes; recent stops AND recent routes;
  distance on results.
- **Favourites** — one shared feed fetch for all cards; reorder; walk time (<3 km); pull-to-refresh;
  empty-state "Find a stop" CTA.
- **Alerts** — nearby bus-route filter, major/minor triage, Clear-all, 3am (local) auto-clear badge,
  affected routes as route NUMBERS, relative "posted" time.
- **Stop detail** — live arrivals, NEXT BUS hero, "can I make it?" chip, freshness dot, **keeps last
  times on refresh failure**, route chips, star, **Share stop**, X. (Scheduled fallback UI exists but
  is off unless a schedule-capable host + `EXPO_PUBLIC_SCHEDULE_ENABLED=1`.)
- **Trip tracking** — live bus, yellow blinking beacon, "Your stop" pin, "Find bus".
- **Route detail** + **Route map** (polyline + live buses, fits on `onMapReady`).
- **Settings** — reminder lead time (2/5/10), privacy/support links, clear recent, about.
- One-tap local notification reminders (stable per route+stop). Dark mode, reduce-motion aware,
  root ErrorBoundary, a11y labels throughout. Polling pauses when backgrounded / tab off-screen.

## Backend — LIVE on EAS Hosting
- Proxy = Expo Router API route `app/api/[feed]+api.ts` → https://whereismybus.expo.app/api/{gtfsrealtime,gtfsposition,gtfsalerts}.
  Caches per-window so all clients share ~1 upstream fetch; TransLink key server-side (EAS var
  `TRANSLINK_API_KEY`, production). `Object.hasOwn` whitelist, in-flight dedupe, stale-on-error,
  forwards 429/403. Deploy/redeploy: `eas deploy --prod` (no login).
- **Web-build enablement** (needed so EAS Hosting builds): `web.output:"server"` +
  `react-dom`/`react-native-web`; `react-native-maps` stubbed for WEB ONLY (`web-stubs/` + a
  `metro.config.js` resolver). **Native iOS uses the real library — unaffected.**
- **Serverless caveat:** cache dedupes under sustained traffic (warm workers); low-traffic cold
  starts ≈ direct (never worse). **`/api/schedule` returns empty** — the 31 MB timetable can't ride
  in a serverless fn, so the scheduled fallback is off on this host.
- **Alternative: `server/`** (Express, NOT deployed) = same proxy PLUS the `/v3/schedule` timetable
  fallback (31 MB schedule built at deploy by `buildSchedule.js`; Vancouver-time + calendar logic).
  To enable the timetable feature: deploy `server/` to a persistent host (`render.yaml` one-click),
  set `EXPO_PUBLIC_API_BASE=<url>/v3` + `EXPO_PUBLIC_SCHEDULE_ENABLED=1` in the build env.

## Key facts / IDs
- **Apple Developer / EAS / Expo login:** `mannprabhdeep95@gmail.com` (Team `J54NAB6FCX`).
  `mannd012@…` is billing only — ignore for sign-in.
- **ascAppId:** `6782258055` · **EAS projectId:** `bdab8c0f-191b-4ab5-acb8-d57109162516` ·
  **ASC submit key:** `5Q43V42TAQ` (on EAS servers) · GitHub `mannd12/WhereIsMyBus`.
- **Live pages:** Privacy `https://mannd12.github.io/WhereIsMyBus/privacy-policy.html` ·
  Support `https://mannd12.github.io/WhereIsMyBus/support.html`.
- **API key:** `.env.local` → `EXPO_PUBLIC_TRANSLINK_API_KEY`; also EAS prod env (remove after
  build 22). Free tier = 1,000 req/day shared → the proxy is the real fix.
- More IDs in `PROJECT_IDS.txt` (gitignored).

## Watch out
- **Never** run `eas build`/`eas submit` (spends credits) or `git commit`/`push` without explicit
  user OK. `eas deploy` (hosting) is credit-free but still confirm.
- All APP `npm install`s need `--legacy-peer-deps` (`.npmrc` has it for EAS `npm ci`). `server/`
  installs normally.
- **stop_id vs stop_code:** display + search use `stop_code` (sign number); nav + real-time matching
  use `stop_id`. Never mix.
- `store/settings.ts` `merge` makes the env key always win over persisted — keep it (rotations
  reach existing users).
- Refresh GTFS ~4×/year: `node scripts/fetchGtfsStatic.js`; QA: `node scripts/verifyStops.js`.
- Pre-ship: `npx tsc --noEmit` (no ESLint config).
- Emulator: Android map blank (no Google key) — iOS uses Apple Maps. Deep-link to navigate:
  `exp://127.0.0.1:8081/--/<route>` (tab taps get hijacked by system UI; emulator sleeps — cold-boot).

## Improvement backlog (from Fable audit — NOT started, good next-session work)
- **Share one trip-updates decode** across `useStopArrivals`/`useFavoriteArrivals`/`useUpcomingArrivals`
  (up to 3 multi-MB protobuf decodes/min on the JS thread with a stop open over the map). Or add a
  **per-stop JSON endpoint** on the proxy so clients stop downloading the whole feed (bigger win).
- **Multi-shape per route** — `fetchGtfsStatic.js` keeps the first `shape_id`, so route maps show one
  direction/variant. Pick longest per direction (data-script change only).
- **Persist reminders** across restarts (rebuild the `scheduled` set from
  `getAllScheduledNotificationsAsync`), cancel/reschedule when a prediction moves materially.
- Deps flagged possibly-unused but NOT removed (expo-router runtime risk): `react-native-reanimated`,
  `react-native-worklets`, direct `protobufjs`. Verify before touching.

## Run (dev / preview)
```powershell
cd C:\Users\mannp\OneDrive\Desktop\WhereIsMyBus
npx expo start --clear   # load in Expo Go on the Pixel_8 emulator
# Redeploy proxy: npx expo export --platform web --output-dir dist ; npx eas deploy --prod --environment production
# Local server+schedule test: cd server ; TRANSLINK_API_KEY=<key> npm run build-schedule ; npm start
```
