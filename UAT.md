# BusPulse — UAT Checklist (User Acceptance Testing)

**How to use:** Test on a real iPhone via TestFlight (build the UAT build first).
Mark each: ✅ pass / ❌ fail (note what happened) / ⏭️ skip.
**Legend:** 📱 = can ONLY be verified on a real iPhone (not the Android emulator —
map uses Apple Maps, notifications, etc.).

> Build-credit plan: **Credit 1 = this UAT build** (test everything below) → fix
> any ❌ locally → **Credit 2 = final build** → submit to App Store.

---

## 1. Launch & first run
- [ ] App opens to **Nearby**; name under the icon is **BusPulse**
- [ ] 📱 Location permission is requested **at launch**
- [ ] No "enter API key" setup screen appears (baked-in key works, live data loads)
- [ ] Cold start feels fast (stops appear quickly via last-known location)

## 2. Nearby / Map  📱 (Apple Maps)
- [ ] 📱 Map renders with real tiles centered near you
- [ ] Nearby stops list shows with distance + walk time
- [ ] Zoom in → **all** stops in the visible area appear (not just ~20)
- [ ] Pan to a new area → that area's stops load
- [ ] Filter chips work: **All / Bus / B-Line / RapidBus / Night** (no SkyTrain/SeaBus/WCE)
- [ ] **My-location button** (bottom-right) flies to your exact position
- [ ] Tap a **stop** → white popup reads normally (not vertical), shows name + #sign-number + "Track buses →"
- [ ] Tap a **bus** → its route line draws, the bus **blinks**, others dim, route banner shows; ✕ clears it
- [ ] "Zoom in to see stops" hint appears when zoomed out

## 3. Search
- [ ] Search by **stop name** returns matches
- [ ] Search by **sign number** (e.g. the number on a real stop near you) returns the correct stop
- [ ] Result shows **#sign-number** (matches the physical sign)
- [ ] **Routes** toggle → search a route (e.g. 99) → opens route detail
- [ ] Recent stops appear and "Clear" works

## 4. Stop detail / Arrivals
- [ ] Header: **bookmark star top-left**, **✕ close top-right**, title "Arrivals"
- [ ] "Stop #" shows the **sign number** (matches the sign)
- [ ] **Next bus** hero shows route + headsign + big **m:ss countdown ticking down**
- [ ] Per-row countdowns tick (m:ss under 10 min, turn red when due)
- [ ] Walk-time vs next-bus banner shows ("you can make it / might miss it")
- [ ] Empty stop shows "No buses scheduled for this stop in the next hour"
- [ ] Pull to refresh works; "Updated Xs ago" shows
- [ ] ✕ closes back to where you came from

## 5. Trip tracking (tap an arrival)
- [ ] 📱 **Yellow blinking beacon** marks the live bus; easy to spot
- [ ] **"Your stop"** pin marks the stop you're tracking
- [ ] **NO red line** (removed)
- [ ] **"Find bus"** button recenters on the bus
- [ ] **✕** closes the screen (no drag-down needed)
- [ ] "Vehicle last updated N min ago" + countdown are correct

## 6. Favourites
- [ ] Star a stop (from search/stop detail) → appears in Favourites
- [ ] Favourite shows **#sign-number** + live next arrivals
- [ ] Remove favourite works
- [ ] Empty state: "No favourites yet"

## 7. Alerts
- [ ] 📱 List is trimmed to **your area's bus** alerts (no SkyTrain/Canada Line/fare noise)
- [ ] **Clear all** is pinned in a fixed header (stays while scrolling)
- [ ] Clear all → list empties to "All clear"; cleared ones don't pile back up
- [ ] Badge clears when you open the tab; returns next day (after 3am) for new alerts
- [ ] Tapping an alert expands full text + affected routes

## 8. Notifications  📱 (least-tested — verify carefully)
- [ ] Tap the 🔔 on an arrival → iOS asks for notification permission → grant
- [ ] A notification **actually fires** before the bus (at the chosen lead time)
- [ ] Notification text is correct (route, stop, time)
- [ ] Works with the app backgrounded/closed

## 9. New features (Bucket A — once built)
- [ ] Notification **lead time** selectable (2 / 5 / 10 min) and respected
- [ ] **Accessibility:** VoiceOver reads buttons/arrivals; text scales with Dynamic Type
- [ ] **Alert triage:** major disruptions on top, minor notices collapsed
- [ ] **Favourite a specific route** at a stop; **reorder** favourites
- [ ] **Tap a route → see its live buses + path** on the map
- [ ] **Trip planner** (client-side): pick destination → suggests nearest stop + next departure

## 10. Cross-cutting
- [ ] **Dark mode** and **light mode** both look right (toggle iOS appearance)
- [ ] No crashes navigating quickly between tabs/screens
- [ ] 📱 Offline / no-signal: graceful error, not a blank/broken screen
- [ ] Stop numbers in-app **match the physical signs** (spot-check 2–3 real stops)
- [ ] Battery/performance feels reasonable during live tracking

## 11. App Store readiness
- [ ] Icon looks right on the home screen
- [ ] No placeholder text / debug UI anywhere
- [ ] Screenshots captured for the listing (map, arrivals, tracking, alerts)

---

### Issues found (log here)
| # | Screen | What happened | Severity |
|---|--------|---------------|----------|
|   |        |               |          |
