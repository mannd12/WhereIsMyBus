# TransLink API — Rate Limit Increase Request

**How to send (TransLink has no public developer-support email):**
Best options, in order —
1. **Reply to your API-key registration email** from developer.translink.ca
   (the confirmation/welcome email you received when you registered). It's a
   real monitored address and is already tied to your account/key. Paste the
   message below as your reply.
2. **Use the feedback form** at https://www.translink.ca/feedback — choose an
   "App developer / Open API" type category if offered, and paste the message.
Send from the email registered to your API key so they can match it.

---

**Subject:** API rate limit increase request — WhereIsMyBus (registered app)

Hello TransLink Open API team,

I'm the developer of **WhereIsMyBus**, an iOS app that shows riders real-time
bus/SkyTrain/SeaBus arrivals and live vehicle positions using your GTFS-Realtime
V3 feeds (gtfsposition, gtfsrealtime, gtfsalerts).

I'm registered under this account and currently on the standard free tier of
**1,000 requests/day**. I'm preparing to launch the app publicly on the Apple
App Store and expect usage to exceed that daily limit.

To serve users reliably I'm moving to a **server-side caching architecture**:
a single backend will poll each GTFS-RT feed on a fixed interval (every 30–60
seconds) and serve the cached results to all app users. This keeps request
volume predictable and low relative to user count, but a continuous backend
polling three feeds needs more than 1,000 requests/day.

**Could you please raise the daily rate limit for my registered application?**
For reference, polling 3 feeds at a 60-second interval is roughly:

- 3 feeds × 1,440 polls/day ≈ **4,320 requests/day** at minimum
- A comfortable ceiling for headroom would be **~25,000–50,000 requests/day**

I'm committed to responsible use:
- Server-side caching so I never re-request faster than the feeds update
- Honoring your data attribution and terms of use
- Happy to share the app details, bundle ID, or registered API key on request

Thank you for providing this open data — it's what makes apps like this
possible. Please let me know if you need any additional information.

Best regards,
Prabhdeep Mann
WhereIsMyBus
mannprabhdeep95@gmail.com

---

**Before sending, fill in / verify:**
- [ ] Confirm the correct support email/contact on developer.translink.ca
- [ ] Make sure you send from the email registered to your API key
- [ ] (Optional) Include your registered app name / API key ID if they ask
