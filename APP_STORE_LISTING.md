# BusPulse — App Store Listing Copy

Paste these directly into App Store Connect.

---

## Name
BusPulse

## Subtitle (30 chars max)
Real-time TransLink arrivals

## Category
Primary: Navigation
Secondary: Travel

## Age Rating
4+

---

## Description (paste into App Store Connect)

BusPulse is the fastest way to find real-time bus, SkyTrain, SeaBus, and West Coast Express arrivals across Metro Vancouver.

No account. No sign-up. Open the app and see what's coming.

**LIVE ARRIVALS ONLY**
Unlike other apps, BusPulse shows only GPS-tracked real-time arrivals — no scheduled guesses. Every countdown ticks live to the second and turns red when your bus is due.

**NEARBY MAP**
See live vehicle positions for every TransLink vehicle on the map. Zoom in to reveal stop markers. Filter by route type — Bus, B-Line, RapidBus, SkyTrain, SeaBus, Night Bus, or WCE — with one tap.

**WALK TIME VS. NEXT BUS**
Open any stop to instantly see your walk time compared to the next arrival. Know in seconds whether to walk or run.

**SMART STOP SEARCH**
Search by the 5-digit stop number posted on every sign, by stop name, or by route number. Covers all 8,700+ stops across Metro Vancouver.

**ROUTE SHAPES**
Tap any stop to draw every route that serves it directly on the map, so you can see exactly where each bus goes.

**DEPARTURE ALERTS**
Tap the bell on any arrival to get a notification 5 minutes before your bus arrives — even with the app closed.

**FAVOURITES**
Star your regular stops. Favourite stops show live arrivals at a glance without tapping in.

**SERVICE ALERTS**
Active TransLink service disruptions appear with a badge on the Alerts tab so you never miss a delay or detour.

Powered by TransLink's official GTFS real-time feed. Arrivals update every 60 seconds.

---

## Keywords (100 chars max — no spaces after commas)
translink,bus,skytrain,vancouver,transit,arrivals,stops,seabus,schedule,realtime,bline,rapidbus

---

## Support URL
(needs a URL — simplest option: your GitHub repo URL, or a basic webpage)

## Privacy Policy URL
(host privacy-policy.html at a public URL — see hosting options below)

---

## What's New (version 1.0.0)
Initial release.

---

## Hosting the Privacy Policy

Easiest free options:
1. **GitHub Pages** — push the repo to GitHub, enable Pages, URL will be:
   https://YOUR_USERNAME.github.io/WhereIsMyBus/privacy-policy.html
2. **Netlify Drop** — drag the privacy-policy.html file to netlify.com/drop, get instant URL
3. **Notion** — paste the text into a public Notion page

---

## eas.json placeholders to fill in after Apple Developer activates

Once your Apple Developer account is active:
1. Log into developer.apple.com → your Team ID is in the top right (10-char string like A1B2C3D4E5)
2. Create the app in App Store Connect → the numeric App ID appears in the URL
3. Fill in eas.json:
   - appleId: your Apple ID email
   - ascAppId: the numeric App Store Connect app ID
   - appleTeamId: your 10-char team ID
