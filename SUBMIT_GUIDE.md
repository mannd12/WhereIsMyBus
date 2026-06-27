# BusPulse — App Store Submission Guide (click-by-click)

Everything below happens at **https://appstoreconnect.apple.com** signed in as
**mannprabhdeep95@gmail.com**. Your app's numeric ID is **6782258055**.

Estimated time: ~45–60 min. Apple review after submit: ~24–48h.

---

## 0. Before you start
- On your iPhone, open **TestFlight → BusPulse → Update** to get the latest build.
- Take **3–5 screenshots** in the app (each = press Volume Up + Side button):
  1. The **map** zoomed in so lots of stops show (best hero shot)
  2. A **stop's arrivals** with the live countdown
  3. **Tracking a bus** (the yellow beacon)
  4. **Alerts** (showing the Clear all bar)
  5. **Search** (optional)
- Your iPhone 14 Pro Max screenshots are **1290×2796** — Apple's exact 6.7" size,
  no resizing needed.
- **Email the screenshots to yourself**, open the email on your PC, and save them
  (so you can upload from the browser).

---

## 1. App Information  (left sidebar → "App Information")
- **Name:** `BusPulse`  *(if it still says WhereIsMyBus, change it here and Save —
  this also confirms the name is available)*
- **Subtitle:** `Live Vancouver bus arrivals`
- **Category:** Primary = **Navigation**, Secondary = **Travel**
- **Content Rights:** "No, it does not contain third-party content" (you use public
  open data, not licensed content)
- Click **Save** (top right).

---

## 2. Pricing and Availability  (left sidebar)
- **Price:** Free (Tier 0)
- **Availability:** Canada (or all countries — your choice)
- **Save**.

---

## 3. The version page  ("iOS App 1.0.0 — Prepare for Submission")

### Screenshots
- Scroll to the **App Previews and Screenshots** section.
- Make sure the device tab is **6.7" Display** (iPhone 6.7").
- **Drag your screenshots in** (or click + to upload). Minimum 1, ideally 3–5.

### Promotional Text (optional, editable anytime without review)
```
Live, to-the-second bus arrivals across Metro Vancouver. No account. Tap a bus to track it on the map.
```

### Description  (paste from APP_STORE_LISTING.md)
Open `APP_STORE_LISTING.md` and copy the whole Description section.

### Keywords
```
translink,bus,vancouver,transit,arrivals,stops,realtime,bline,rapidbus,nightbus,livebus,bustracker
```

### Support URL
```
https://mannd12.github.io/WhereIsMyBus/support.html
```

### Marketing URL
Leave blank.

### Build
- Scroll to **Build**, click the **+** (or "Add Build").
- Select the latest processed build (e.g. **Build 18**), then **Done**.
- If asked about **Export Compliance**: it's already set in the app
  (ITSAppUsesNonExemptEncryption = false), so it shouldn't prompt. If it does:
  "Does your app use encryption?" → **No**.

### General App Information (on this page, lower down)
- **Copyright:** `2026 Prabhdeep Mann`
- **Privacy Policy URL** (if shown here or under App Privacy):
  `https://mannd12.github.io/WhereIsMyBus/privacy-policy.html`

---

## 4. App Privacy  (left sidebar → "App Privacy")
- Click **Get Started** / **Edit**.
- "Do you or your third-party partners collect data from this app?" → **No**.
  (BusPulse has no analytics, no account; location stays on the device.)
- **Publish**.

---

## 5. Age Rating  (in App Information, "Age Rating" → Edit)
- Answer every question **None / No**.
- Result: **4+**. Save.

---

## 6. App Review Information  (on the version page, scroll down)
- **Sign-In required:** No (toggle off — the app needs no login).
- **Contact:** your first name, last name, phone, email.
- **Notes:**
```
No login required — the app opens straight to live transit data. Uses TransLink's public GTFS real-time feed (bus arrivals and vehicle positions) for Metro Vancouver. Independent app, not affiliated with TransLink.
```

---

## 7. Submit
- Top right: **Add for Review** → **Submit to App Review**.
- Choose **Automatically release** (goes live right after approval) or
  **Manually release** (you press the button). Manual gives you control.

That's it. You'll get emails as it moves: Waiting for Review → In Review →
Approved (or Rejected with reasons).

---

## If Apple rejects (most common reasons here)
- **Trademark / metadata:** if they flag "TransLink/SkyTrain" usage, reword the
  description to "Metro Vancouver transit" and remove agency names from keywords.
  Reply in Resolution Center, resubmit — usually fast.
- **Crash/bug:** include the steps; fix, rebuild, resubmit.
- Rejections are normal for a first app — they tell you exactly what to change.

---

## After it's live
- Send the **TransLink rate-limit email** (TRANSLINK_RATE_LIMIT_REQUEST.md) before
  usage grows — the free key allows 1,000 requests/day shared across all users.
