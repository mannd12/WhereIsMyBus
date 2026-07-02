import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- config (all via env) -------------------------------------------------
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.TRANSLINK_API_KEY; // required — stays server-side
const APP_TOKEN = process.env.APP_TOKEN;       // optional shared secret (x-app-token)
const UPSTREAM = 'https://gtfsapi.translink.ca/v3';

if (!API_KEY) {
  console.error('FATAL: set TRANSLINK_API_KEY in the environment.');
  process.exit(1);
}

// Each feed is cached for a short window. Clients poll ~every 60s; with even a
// 20s cache, 1000 users generate at most 3 upstream calls/min = ~4,300/day for
// all users combined — but tune UP to stay under 1000/day at scale.
// At 90s TTL: max 960 upstream calls/day per feed. Safe headroom.
const FEEDS = {
  gtfsrealtime: Number(process.env.TTL_TRIPS_MS) || 30_000,
  gtfsposition: Number(process.env.TTL_POS_MS) || 30_000,
  gtfsalerts: Number(process.env.TTL_ALERTS_MS) || 120_000,
};

/** name -> { at: epochMs, bytes: Buffer, inflight?: Promise<Buffer> } */
const cache = Object.create(null);

async function fetchUpstream(name) {
  const res = await fetch(`${UPSTREAM}/${name}?apikey=${API_KEY}`);
  if (!res.ok) {
    const e = new Error(`upstream ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Returns cached bytes if fresh; otherwise fetches once (deduping concurrent
 * requests via a shared in-flight promise) and falls back to stale bytes if the
 * upstream fetch fails — so a brief TransLink outage doesn't break clients.
 */
async function getFeed(name) {
  const ttl = FEEDS[name];
  const now = Date.now();
  const entry = cache[name];

  if (entry?.bytes && now - entry.at < ttl) return entry.bytes; // fresh
  if (entry?.inflight) return entry.inflight;                   // coalesce refresh

  const inflight = fetchUpstream(name)
    .then((bytes) => {
      cache[name] = { at: Date.now(), bytes };
      return bytes;
    })
    .catch((err) => {
      if (entry?.bytes) return entry.bytes; // serve stale on upstream failure
      throw err;
    })
    .finally(() => {
      if (cache[name]?.inflight === inflight) cache[name].inflight = undefined;
    });

  cache[name] = { ...(entry ?? { at: 0, bytes: null }), inflight };
  return inflight;
}

// --- scheduled-time fallback (optional; needs `npm run build-schedule`) ----
// SCHED = { rs:[routeShortNames], hs:[headsigns], sched:{ stopId: [[secs,rsI,hsI,svcI]] } }
// SVC   = { svcIdx: { d:[7 weekday bools Mon..Sun], s:start, e:end, add:[], rem:[] } }
let SCHED = null;
let SVC = null;
try {
  SCHED = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'schedule.json'), 'utf8'));
  SVC = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'services.json'), 'utf8'));
  console.log(`Schedule loaded: ${Object.keys(SCHED.sched).length} stops.`);
} catch {
  console.warn('No schedule.json — /v3/schedule disabled (run `npm run build-schedule`).');
}

// Current wall-clock in Vancouver (handles PST/PDT via the runtime tz database).
function vancouverNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    weekday: 'short',
  }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t).value;
  const dateStr = `${g('year')}${g('month')}${g('day')}`;
  const nowSecs = +g('hour') * 3600 + +g('minute') * 60 + +g('second');
  const wd = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[g('weekday')];
  // Previous calendar day (for trips scheduled past midnight, e.g. "25:30:00").
  const d = new Date(`${g('year')}-${g('month')}-${g('day')}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  const prevDateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const prevWd = (wd + 6) % 7;
  // Epoch seconds at Vancouver midnight today (same instant reference as now).
  const midnightEpoch = Math.floor(Date.now() / 1000) - nowSecs;
  return { dateStr, nowSecs, wd, prevDateStr, prevWd, midnightEpoch };
}

function activeServices(dateStr, weekday) {
  const active = new Set();
  for (const idx of Object.keys(SVC)) {
    const s = SVC[idx];
    let on = (!s.s || dateStr >= s.s) && (!s.e || dateStr <= s.e) && s.d[weekday];
    if (s.add.includes(dateStr)) on = true;
    if (s.rem.includes(dateStr)) on = false;
    if (on) active.add(Number(idx));
  }
  return active;
}

function nextDepartures(stopId, max) {
  const rows = SCHED?.sched[stopId];
  if (!rows) return [];
  const t = vancouverNow();
  const today = activeServices(t.dateStr, t.wd);
  const yest = activeServices(t.prevDateStr, t.prevWd);
  const out = [];
  for (const [secs, rsI, hsI, svcI] of rows) {
    let eff = null;
    if (secs < 86400) {
      if (secs >= t.nowSecs && today.has(svcI)) eff = secs; // later today
    } else {
      // Trip listed past 24h = after-midnight; belongs to a service that started
      // the previous day (still "tonight" for the rider).
      const e = secs - 86400;
      if (e >= t.nowSecs && (yest.has(svcI) || today.has(svcI))) eff = e;
    }
    if (eff == null) continue;
    out.push({ arrivalTime: t.midnightEpoch + eff, routeShortName: SCHED.rs[rsI], headsign: SCHED.hs[hsI] });
  }
  out.sort((a, b) => a.arrivalTime - b.arrivalTime);
  return out.slice(0, max);
}

const app = express();
app.disable('x-powered-by');

// Timetable fallback: next scheduled departures for a stop (JSON), used by the
// app when there's no real-time bus. 404-free even if schedule wasn't built.
app.get('/v3/schedule', (req, res) => {
  if (APP_TOKEN && req.get('x-app-token') !== APP_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  if (!SCHED) return res.json({ scheduled: [], note: 'schedule not available' });
  const stopId = String(req.query.stopId || '');
  const max = Math.min(Number(req.query.max) || 6, 20);
  res.set('Cache-Control', 'no-store');
  res.json({ scheduled: nextDepartures(stopId, max) });
});

app.get('/health', (_req, res) => {
  const status = Object.fromEntries(
    Object.keys(FEEDS).map((n) => [n, cache[n]?.at ? `cached ${Math.round((Date.now() - cache[n].at) / 1000)}s ago` : 'cold']),
  );
  res.json({ ok: true, feeds: status });
});

// Mirrors TransLink's paths: /v3/gtfsrealtime, /v3/gtfsposition, /v3/gtfsalerts.
// Any ?apikey= the client sends is ignored — the key lives here.
app.get('/v3/:feed', async (req, res) => {
  const name = req.params.feed;
  if (!(name in FEEDS)) return res.status(404).json({ error: 'unknown feed' });
  if (APP_TOKEN && req.get('x-app-token') !== APP_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const bytes = await getFeed(name);
    res.set('Content-Type', 'application/x-protobuf');
    res.set('Cache-Control', 'no-store');
    res.send(bytes);
  } catch {
    res.status(502).json({ error: 'upstream unavailable' });
  }
});

app.listen(PORT, () => console.log(`BusPulse proxy listening on :${PORT}`));
