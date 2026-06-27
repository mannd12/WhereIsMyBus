# BusPulse — Feature Roadmap (approved 2026-06-25)

Everything below is approved. Split by **what I can build + verify now** (pure
JS/React Native, testable on the emulator) vs **native iOS** (needs a dev build
to compile/test — can't run in Expo Go or the Android emulator) vs **bigger bets**.

---

## ✅ Bucket A — JS features I can build + self-review now (no build credit needed)

### A1. Notification lead time (Quick win #2)
- Let the user pick how far ahead the departure alert fires: **2 / 5 / 10 min**.
- Store the choice (settings store). Use it in `scheduleArrivalNotification`.
- Also confirm the bell flow end-to-end.
- Files: `store/settings.ts`, `services/notifications.ts`, `components/stop/ArrivalRow.tsx`, `components/stop/NextBusBanner.tsx`, a small settings UI.

### A2. Accessibility pass (Quick win #3)
- `accessibilityLabel` / `accessibilityRole` on buttons, chips, arrivals, tabs.
- Respect Dynamic Type (allow text scaling; check layouts don't break).
- `accessibilityLiveRegion` on the countdown so VoiceOver announces updates.

### A3. Smarter alert triage (Quick win #4)
- Rank alerts: **major disruptions** (reduced service, closures, detours) on top;
  collapse minor "stop moved 50 m / wheelchair" notices into a "Minor notices (N)"
  expandable group.
- Uses keywords + severity from the GTFS-RT alert.
- Files: `app/(tabs)/alerts.tsx`, `components/stop/AlertBanner.tsx`, maybe `services/gtfsRealtime.ts` (keep severity).

### A4. Favourite a specific route at a stop + reorder (Standout #3)
- Favourite "the 99 at stop 59561" not just the whole stop.
- Reorder favourites (drag or up/down).
- Files: `store/favorites.ts` (data model), `app/(tabs)/favorites.tsx`, star controls.

### A5. Tap a route → see all its live buses + full path (Standout #4)
- From a route (search → route, or a route chip), show every live bus on that
  route on the map + its shape, with live positions.
- Extends the existing beacon/route-shape work.
- Files: `app/route/[routeId].tsx` (add a "Show on map" / live view), map wiring.

---

## ⚠️ Bucket B — Native iOS (REQUIRES a dev build to compile + test)

These cannot run in Expo Go or the Android emulator, and need an EAS build to
verify. I can scaffold the config + native code, but "does it work" needs a build.

### B1. Home Screen Widget (Standout #1) ⭐
- WidgetKit extension (Swift) showing "next bus at favourite stop".
- Expo: add via a config plugin (e.g. `@bacons/apple-targets`); share data with
  the app through an **App Group** (app writes next-bus JSON, widget reads).
- Without the backend, the widget refresh budget is limited (iOS throttles widget
  network calls) — pairs best with the backend proxy.

### B2. Live Activity / Dynamic Island (Standout #2) ⭐
- ActivityKit (Swift), iOS 16.1+. Shows the tracked bus countdown on lock screen
  / Dynamic Island.
- Started from the trip-tracking screen; updated locally (or via push from the
  backend for true real-time).

**Recommendation:** these are the headline v1.1 features but are native + build-
hungry. Best done as a focused pass *after* v1.0 ships, ideally alongside the
backend (B1's refresh + B2's push updates both want it).

---

## 🏗️ Bucket C — Bigger bets

### C1. Trip planning (A → B)  — PLAN
**Goal:** "from here to there, which bus and when."
**Approach options:**
- **Best/realistic:** backend runs an OpenTripPlanner (OTP) instance or calls a
  routing API; app sends origin/dest, gets itineraries. Clean, but needs the
  backend + a routing engine (OTP is heavy but free; hosted routing APIs cost).
- **Lightweight interim:** since we already have stops, routes, shapes, and live
  arrivals, a *single-leg* planner is doable client-side: "nearest stop with a
  route toward your destination + next live departure." Not full multi-transfer
  routing, but covers many trips.
**Plan:** build the lightweight single-leg version client-side first (no backend),
then upgrade to full OTP routing when the backend exists.
**Files (interim):** new `app/plan.tsx`, origin/dest pickers (reuse search), a
planner service using stops/routes/shapes.

### C2. Scheduled-time fallback — PINNED (needs backend; see memory)
### C3. Backend proxy (Option C) — PINNED (the unlock for scale, widget, live activity, scheduled fallback, full trip planning)

---

## 🎨 Bucket D — Polish (fold into Bucket A pass)
- Onboarding card: "real-time bus tracking for Metro Vancouver" (sets expectations)
- Stop clustering on the map when zoomed out
- Consistent haptics, empty states, micro-animations
- (later) French localization, app preview video

---

## Suggested order
1. **Bucket A** (A1–A5) — build + self-review on the emulator, no credits.
2. Ship **v1.0** to the App Store.
3. **Backend (C3)** — unlocks the rest.
4. **Bucket B** (widget, live activity) + **C1 full** + **C2** as v1.1, with builds.
