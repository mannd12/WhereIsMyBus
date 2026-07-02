# Verify-on-build checklist

Things that **could not** be verified in Expo Go or the Android emulator, to check
once there's a real iOS build (TestFlight) — or after the backend is deployed.
Everything here is coded and typechecks/bundles clean; this is runtime confirmation.

## Needs a real iOS build (TestFlight)
- [ ] **Notifications success path** — tap the bell on an arrival. First tap should
      show the iOS permission prompt; after granting, a local notification should
      fire at your lead-time before the bus (Settings → 2/5/10 min). Bell turns
      blue + success haptic. *(Expo Go has no notifications, so only the "disabled"
      path was seen so far.)*
- [ ] **Live map (Apple Maps)** — Nearby map renders, stop pins appear when zoomed
      in, live bus dots show with correct bearing, selected-route polyline draws.
      *(Android emulator map is blank — no Google key; iOS uses Apple Maps.)*
- [ ] **Yellow blinking beacon** — tap a bus → trip screen shows the route line,
      the "Your stop" pin, and the yellow beacon blinking + "Find bus" recenters.
- [ ] **Route map screen** — from a route → "Show live buses on map": polyline +
      bus markers + "N live buses" banner.
- [ ] **Location permission** — first launch shows the when-in-use prompt with our
      usage string; denying falls back to Vancouver centre (no crash).
- [ ] **Reduce Motion** — with iOS Reduce Motion ON, beacon / "Due" pulse /
      skeletons should hold still (not animate).
- [ ] **Haptics** — filter chips, my-location FAB, reminder-set, clear-all alerts
      should tap-feedback on a real device (emulator has none).
- [ ] **Dark mode on iOS** — confirmed on Android; should match on iOS.
- [ ] **Onboarding** — on a truly fresh install, the welcome card shows once, then
      never again.
- [ ] **Share sheet on iOS** — confirm targets + the stop message look right.
- [ ] **VoiceOver** — swipe through Nearby / Search / Stop detail: every star, filter
      chip, FAB, arrival row, and scheduled row should read a sensible label.
- [ ] **ErrorBoundary** — (hard to trigger deliberately) if any screen ever errors,
      it should show "Something went wrong · Try again", not a white screen.

## Needs the backend deployed (server/)
- [ ] Deploy `server/` (Render blueprint runs `npm run build-schedule`), set
      `TRANSLINK_API_KEY`. First build downloads GTFS + builds the 31 MB schedule.
- [ ] Set `EXPO_PUBLIC_API_BASE=<url>/v3` in the app build env; confirm all feeds
      (arrivals, vehicles, alerts) load through the proxy.
- [ ] `/health` shows feeds going "cached" — confirm multiple app instances share
      one upstream fetch (watch upstream call count stay flat as users increase).
- [ ] **Scheduled fallback**: open a stop whose routes aren't running right now
      (e.g. a daytime route late at night) → should show "SCHEDULED DEPARTURES"
      with the timetable. (E2E-verified locally; confirm on the deployed proxy.)
- [ ] If you also drop the client key (`EXPO_PUBLIC_TRANSLINK_API_KEY` empty):
      the app's `AuthGuard` currently requires a non-empty key → adjust it, or set
      `APP_TOKEN` and keep a dummy client value.

## App Store Connect (submission time)
- [ ] Fill the App Privacy "nutrition label" — app collects **Location** (used for
      nearby stops, not tracking/advertising).
- [ ] Confirm review doesn't flag background modes / Always-location (both removed
      from app.json — should be clean now).
- [ ] Privacy policy + support URLs reachable (linked in Settings).
