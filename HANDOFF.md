# BusPulse Vancouver — Handoff

_Last updated: 2026-11-05 · 1.1.1 COMMITTED + PUSHED (`4732b4d`); build on hold pending Spanish human review._

## Now
**Live:** 1.1.0 (English + Punjabi), released 2026-08-27.
**Committed:** 1.1.1 — `4732b4d` on `master` (pushed 2026-11-05; gates re-run that day: tsc clean, 170/170 keys × 3). **Not built yet.**

What 1.1.1 contains:
- **Spanish** (`locales/es.ts`, 170 keys), wired into the picker + device-language detection;
  iOS location prompt localized (`locales/ios/*.json` via `expo.locales`).
- **Live-app fix — stale schedule data.** Static GTFS was from Jul 3; TransLink renumbered every
  trip at the fall change, so 0% of live trips matched and **destinations showed route names
  in the live app**. Refreshed `data/*.json`: live match 0 → 100%, bundle 9.6% smaller.
- **Walk banner** hidden ≥ 3 km from the stop (was "~2490 min walk — you might miss it").
- **Punjabi grammar fixes** (route/bus gender in notifications, ਰਾਤ, ਤਬਦੀਲੀਆਂ, etc.).
- Localized themed `app/+not-found.tsx`; close/star a11y labels; timetable times follow the
  app language (`useLocaleTag`); translated location-error message; centred onboarding title.

Validation done: 2 rounds of AI native-style reviews per language (both say ship) + Google
back-translation of every changed string; emulator QA of every screen in en/pa/es incl. dark
mode, 130% text, device-language detection, first-run welcome. Evidence: `docs/qa/i18n-loop/`.
Gates: `npx tsc --noEmit` clean · 170/170 keys × 3, 0 param issues · `expo export -p ios` clean.

Also staged (no build needed): Spanish ASC copy for es-MX + es-ES and 1.1.1 What's New in
`APP_STORE_LISTING.md`; Spanish poster/sticker/shorts in `docs/marketing/` — **HOLD until 1.1.1 is live.**

## Next
1. **Human language check:** user's Spanish reviewer reads `locales/es.ts`; user skims the
   Punjabi diff (`git diff 6a3fab4 4732b4d -- locales/pa.ts`) — Punjabi word choices are the user's call.
2. ~~Commit + push~~ — done 2026-11-05 (`4732b4d`).
3. **User runs the build** (last credit) only after step 1:
   `eas build -p ios --profile production --auto-submit`. If it's past early Jan (TransLink
   winter service change), re-run `node scripts/fetchGtfsStatic.js` first and commit the data.
4. On TestFlight: confirm a **reminder notification fires** in Punjabi and Spanish (couldn't be
   tested in Expo Go), and that destinations show (e.g. "To Newton Exchange").
5. In ASC: add **es-MX + es-ES** localizations from `APP_STORE_LISTING.md`; apply the Punjabi
   promo text (still pending since Sep — needs user signed in).
6. After 1.1.1 is live: release the Spanish marketing materials.

## Watch out
- **Commit soon.** Repo is in OneDrive on two PCs; it has silently reverted files twice and
  keeps restoring deleted QA screenshots / making `*-HomePC` copies. If you see `*-HomePC.*`,
  the newer file is usually the real one — check `git diff` before trusting the working copy.
- **Refresh GTFS before every build** (`node scripts/fetchGtfsStatic.js`) and check live
  trip-ID match ≈100%. TransLink changes service ~Jan/Apr/Jun–Jul/Sep.
- **95 stops retired** in the fall change: favourites on them show "Stop #id" with no arrivals
  (no crash).
- **One build credit left; EAS builds expire after 30 days** — don't let it sit.
- `eas build`/`submit` and `git push` are user-run/user-approved only.
- Don't make the GitHub repo private on a free plan — Privacy/Support URLs are GitHub Pages.
- Expo Go quirks on the emulator (not app bugs): Metro `CI=1` doesn't reload edits (restart
  it); first launch after `pm clear` may load the web bundle (relaunch); emulator location can
  stick — cold-boot with `-no-snapshot-load`.

## Touched
- **i18n:** `locales/{en,pa,es}.ts`, `locales/i18n.ts` (`useLocaleTag`), `locales/ios/*.json`
- **App:** `app/+not-found.tsx` (new), `app/stop/[stopId].tsx` (`WALK_MAX_M`, a11y),
  `app/route/[routeId].tsx`, `app/trip/[tripId].tsx`, `app/(tabs)/index.tsx`,
  `components/OnboardingCard.tsx`, `components/stop/ScheduledList.tsx`, `hooks/useLocation.ts`
- **Data/config:** `data/*.json` (GTFS refresh), `app.json` (1.1.1)
- **Docs:** `APP_STORE_LISTING.md`, `docs/marketing/*`, `docs/qa/i18n-loop/`
- **Last commits:** `6a3fab4` · `8b21ae8` · `e45fa1b` (Spanish) · `b87bc96` · `c561d45`

## Key facts
- Bundle ID `com.whereismybus.app` (never rename) · ASC App ID `6782258055` · Team `J54NAB6FCX`
- Store name **BusPulse Vancouver**; home-screen label stays "BusPulse" (truncation).
- Keyless proxy build: `EXPO_PUBLIC_API_BASE=https://whereismybus.expo.app/api` (EAS prod);
  server key `TRANSLINK_API_KEY` stays server-side. Local key in `.env.local` (git-ignored).
- Version is manual in `app.json`; build number auto-increments remotely (EAS).
- Credentials valid through **19 Jun 2027**.
