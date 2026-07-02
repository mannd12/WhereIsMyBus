# BusPulse proxy

A tiny caching proxy for TransLink's GTFS-RT feeds.

## Why

Every BusPulse device currently calls `gtfsapi.translink.ca` directly with the
same baked-in API key. TransLink's free tier allows **1,000 requests/day per
key** — shared across *all* users. That caps the app at a handful of active
users before the key is exhausted.

This proxy fixes it structurally:

- The server fetches each feed from TransLink **at most once per cache window**
  and serves every client from that cache.
- So TransLink sees ~1 request per feed per window **no matter how many users**
  the app has. At a 30s trip/position TTL and 120s alerts TTL, that's well
  under 1,000/day for all users combined.
- The API key lives **on the server**, not shipped in the app binary.
- Serves the last cached bytes if TransLink briefly fails (stale-on-error).

## Endpoints

Mirrors TransLink's paths so the app only needs a base-URL swap:

- `GET /v3/gtfsrealtime` → trip updates (protobuf)
- `GET /v3/gtfsposition` → vehicle positions (protobuf)
- `GET /v3/gtfsalerts`   → service alerts (protobuf)
- `GET /health`          → JSON status + cache ages

## Run locally

```bash
cd server
npm install
TRANSLINK_API_KEY=your_key npm start
# → BusPulse proxy listening on :8080
curl -s localhost:8080/health
```

## Deploy (pick one free/cheap host)

Any Node host works — Render, Railway, Fly.io, Cloud Run.

**Easiest (Render blueprint):** the repo root has `render.yaml`. On Render:
New → **Blueprint** → pick this repo → set `TRANSLINK_API_KEY` in the dashboard.
Done — it builds `server/` and runs `npm start` automatically.

**Manual (any host):**

1. Point the host at root directory `server`.
2. Build: `npm install` · Start: `npm start`.
3. Env vars: `TRANSLINK_API_KEY` (required), optionally `APP_TOKEN`.
4. Note the public URL, e.g. `https://buspulse-proxy.onrender.com`.

## Point the app at it

In the app's build env (e.g. `.env.local` / EAS env), set:

```
EXPO_PUBLIC_API_BASE=https://buspulse-proxy.onrender.com/v3
# if you set APP_TOKEN on the server:
EXPO_PUBLIC_APP_TOKEN=some-long-random-string
```

With `EXPO_PUBLIC_API_BASE` set, the app talks to the proxy instead of
TransLink directly. Unset, it falls back to calling TransLink directly (current
behaviour) — so nothing breaks before the proxy is deployed.

Once the proxy is live, you can also stop shipping the raw TransLink key in the
app (leave `EXPO_PUBLIC_TRANSLINK_API_KEY` empty) — but note the app's current
`AuthGuard` requires a non-empty key, so adjust that when you make the switch.
