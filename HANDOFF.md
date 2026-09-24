# BusPulse Vancouver — Handoff

_Last updated: 2026-09-23 · Punjabi marketing kit drafted; 1.1.0 is LIVE._

## Now
**BusPulse Vancouver 1.1.0 (build 24) is LIVE on the App Store (released 2026-08-27).** Listing
shows "Languages: English and Punjabi", 5.0 (1 rating). Carries the **Punjabi (ਪੰਜਾਬੀ)
localization** and the **honest out-of-coverage message**.

**2026-09-23 — Punjabi community marketing kit** (all in `docs/marketing/`, uncommitted):
- `launch-post.md` — WhatsApp/family post (Punjabi-first), Instagram caption, one-liner,
  student-group version. Rules baked in: say *iPhone*; post Surrey/Delta/Vancouver only,
  **not Abbotsford** (BC Transit → out-of-coverage → 1-star reviews).
- `radio-pitch.md` — email pitch (RED FM / Sher-E-Punjab / Connect FM / Spice / OMNI),
  Punjabi on-air talking points, likely-questions sheet.
- `poster-punjabi.html` + `.pdf` — Letter-size notice-board poster (gurdwara/langar hall,
  settlement agencies) with App Store QR (`qr-appstore.svg`). 1 page, validated render.
- **Claim verified:** of 196 Vancouver-transit apps on the CA App Store, BusPulse Vancouver is the
  only real-time TransLink bus app listing Punjabi. Use "only", not "first".
- `APP_STORE_LISTING.md`: new Punjabi promo text (169 chars, paste now — live-editable)
  + a "1.1.1 staged metadata" section (keywords swap `livebus`→`punjabi`, Punjabi in the
  description's first sentence, one Punjabi screenshot). Those fields are LOCKED on 1.1.0.
- ASC session had expired → promo text is **not yet applied** (needs you signed in).
- **Name → "BusPulse Vancouver" everywhere** (user's call, 2026-09-23): all docs, marketing,
  support/privacy pages, AND the in-app strings (`locales/en.ts`+`pa.ts` ×5 each, About/setup
  labels, iOS location-permission text). Uncommitted; in-app part ships with 1.1.1.
  `app.json` → `name` deliberately stays "BusPulse" — iOS truncates icon labels at ~12–13
  chars, so the full name would show as "BusPulse Van…". `tsc` clean.

Done 2026-08-26:
- Fixed a real duplicate on the **live 1.0** App Store page — the Promotional Text
  echoed the description’s opening line. Rewrote it (coverage-forward); it’s live now,
  no build needed.
- Diagnosed the **Ucluelet “no buses” report**: not a bug — TransLink is Metro Vancouver
  only; the Island is BC Transit (~162 km to the nearest TransLink stop). The fix is the
  new coverage message, shipping in build 24.
- Repo audit: **GitHub is public but exposes no secrets** (key is git-ignored + kept
  server-side by the proxy).
- Docs committed + pushed (`f83a069`).
- Closeout visualization published as an artifact (transit-line map of the whole release):
  https://claude.ai/code/artifact/5ac6e211-b943-4197-8fc7-a3b1db381b6c
  Source: `docs/release-1.1-closeout.html`.

## Next
1. **Sign in to ASC**, then apply the Punjabi promo text from `APP_STORE_LISTING.md`
   (App Store tab → 1.1.0 → Promotional Text → Edit → Save). No build.
2. **Send the WhatsApp post** to family groups (`docs/marketing/launch-post.md` §A) —
   this is the channel that actually spreads. Then one radio pitch email.
3. **Print `docs/marketing/poster-punjabi.pdf`** and ask to post it on a gurdwara
   notice board / settlement-agency office.
4. **Collect word-choice feedback** from 5 Punjabi-speaking elders → fix `locales/pa.ts`
   → 1.1.1 with the staged metadata (keywords, description, Punjabi screenshot). One
   build credit; make it count.
5. Commit `docs/marketing/` + `HANDOFF.md` + `APP_STORE_LISTING.md` (user OK needed).

## Watch out
- **OneDrive sync conflicts between PCs.** On 2026-09-23 the working `APP_STORE_LISTING.md`
  and `HANDOFF.md` had silently reverted to July versions, with the real ones renamed
  `*-HomePC.md`. Resolved (listing restored from git, handoff from the HomePC copy,
  duplicates removed). If you ever see `*-HomePC.md` / `*-<PCNAME>.md` files: the
  **newer** one is usually the real one; check `git diff` before trusting the working copy.
  Committing promptly is the real fix — uncommitted work is what the conflict eats.
- **Don’t make the GitHub repo private on a free plan.** The App Store’s Privacy Policy
  and Support URLs are GitHub Pages (`mannd12.github.io/WhereIsMyBus/...`); Pages only
  serves a private repo with GitHub Pro. Going private without Pro breaks those required
  links. Keep it public (nothing leaks) unless you get Pro or move the pages first.
- **EAS builds expire after 30 days.** Build 23 expired unsubmitted and forced the rebuild
  to 24 — don’t let the next build sit.
- **`eas build`/`submit` are classifier-gated for the assistant** — run them yourself via
  the `!` prefix if needed. ~1 build credit likely left.
- Version bump is manual in `app.json` (`version`); build number auto-increments remotely
  (EAS, `appVersionSource: remote`) — the local `ios.buildNumber` is ignored.
- Punjabi word-choices are the user’s to tweak (optional, none are bugs): ਆਮਦਾਂ/arrivals,
  ਨਾਈਟ/night, ਸਟਾਪ/stop.

## Touched
- **i18n:** `locales/en.ts` (165 keys), `locales/pa.ts` (Gurmukhi mirror), `locales/i18n.ts`
- **Coverage fix:** `constants/config.ts` (`COVERAGE_MAX_M`), `services/translink.ts`
  (`nearestStopDistance`), `app/(tabs)/index.tsx` (`outOfCoverage`)
- **Config:** `app.json` (v1.1.0, `CFBundleLocalizations`), `eas.json`
- **Docs:** `APP_STORE_LISTING.md` (promo + coverage paragraph + 1.1 notes),
  `docs/release-1.1-closeout.html`
- **Commits since 1.0:** `e2378ef` (Punjabi) · `62cd5ab` (coverage message) · `f83a069` (docs)
- **Checks:** `npx tsc --noEmit` (clean) · `npx expo export --platform ios` (clean) ·
  i18n parity 165/165

## Key facts
- Bundle ID `com.whereismybus.app` (never rename) · ASC App ID `6782258055` ·
  Apple Team `J54NAB6FCX` · dev Apple ID `mannprabhdeep95@gmail.com`
- Keyless proxy build: `EXPO_PUBLIC_API_BASE=https://whereismybus.expo.app/api` (EAS prod);
  server key `TRANSLINK_API_KEY` (EAS prod, sensitive); `EXPO_PUBLIC_TRANSLINK_API_KEY`
  removed from EAS prod so it’s **not** embedded. Local key lives in `.env.local` (git-ignored).
- Credentials (cert + provisioning profile) valid through **19 Jun 2027**.
