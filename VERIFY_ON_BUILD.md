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

## Backend (EAS Hosting is LIVE at whereismybus.expo.app)
- [x] Proxy deployed (EAS Hosting, `/api/*`) — verified serving real protobuf.
- [ ] On build 21+: confirm arrivals/vehicles/alerts load on-device through the
      proxy (the end-to-end proof).
- [ ] After the audit-fix batch: redeploy hosting (`eas deploy --prod`) so the
      `Object.hasOwn` whitelist + 429/403 forwarding go live.
- [ ] After build 22 (proxy-only key mode) is verified on TestFlight: remove
      `EXPO_PUBLIC_TRANSLINK_API_KEY` from EAS prod env and ROTATE the TransLink
      key (build 21 and earlier embedded it in the binary).
- [ ] (Optional, later) Deploy `server/` to Render for the scheduled-timetable
      fallback; then set `EXPO_PUBLIC_API_BASE=<render-url>/v3` and
      `EXPO_PUBLIC_SCHEDULE_ENABLED=1` in the build env.

## App Store Connect (submission time)
- [ ] Fill the App Privacy "nutrition label" — app collects **Location** (used for
      nearby stops, not tracking/advertising).
- [ ] Confirm review doesn't flag background modes / Always-location (both removed
      from app.json — should be clean now).
- [ ] Privacy policy + support URLs reachable (linked in Settings).
