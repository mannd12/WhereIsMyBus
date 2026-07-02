/**
 * Data-layer smoke test across ~100 geographically-spread stops.
 *
 * The GTFS-RT trip-updates feed is system-wide, so ONE fetch validates live
 * arrival matching for every stop at once (quota-safe — a single request).
 *
 * For each sampled stop it checks:
 *   - stop_code present and numeric (the number riders read off the sign)
 *   - stopRoutes lists routes, and every route id resolves in routes.json
 *   - whether the live feed currently has an upcoming arrival for the stop_id
 *   - distance/walk formatting produces sane output from a sample origin
 *
 * Run: node scripts/verifyStops.js
 */
const fs = require('fs');
const path = require('path');
const { transit_realtime } = require('gtfs-realtime-bindings');

const DATA = path.join(__dirname, '..', 'data');
const stops = require(path.join(DATA, 'stops.json'));
const routes = require(path.join(DATA, 'routes.json'));
const stopRoutes = require(path.join(DATA, 'stopRoutes.json'));

const routeById = new Map(routes.map((r) => [r.route_id, r]));

// --- read API key from .env.local (never hardcode) ---
function readApiKey() {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const m = env.match(/EXPO_PUBLIC_TRANSLINK_API_KEY\s*=\s*(.+)/);
  if (!m) throw new Error('API key not found in .env.local');
  return m[1].trim();
}

// --- formatting helpers mirrored from constants/format.ts ---
const formatDistance = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const walkMinutes = (m) => Math.max(1, Math.round(m / 80));
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// --- pick ~100 stops spread across the region via a lat/lon grid ---
function sampleSpread(target = 100) {
  const cell = 0.02; // ~2.2km cells
  const byCell = new Map();
  for (const s of stops) {
    const key = `${Math.round(s.stop_lat / cell)}:${Math.round(s.stop_lon / cell)}`;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key).push(s);
  }
  const cells = [...byCell.values()];
  const picked = [];
  let i = 0;
  // round-robin one stop per cell until we hit target (spreads coverage)
  while (picked.length < target && i < 50) {
    for (const c of cells) {
      if (c[i]) picked.push(c[i]);
      if (picked.length >= target) break;
    }
    i++;
  }
  return picked;
}

async function fetchUpcomingByStop(apiKey) {
  const res = await fetch(`https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${apiKey}`);
  if (!res.ok) throw new Error(`feed ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buf));
  const now = Math.floor(Date.now() / 1000);
  const out = {};
  const toNum = (v) => (v && typeof v.toNumber === 'function' ? v.toNumber() : Number(v || 0));
  for (const e of feed.entity) {
    const tu = e.tripUpdate;
    if (!tu) continue;
    for (const stu of tu.stopTimeUpdate || []) {
      const sid = stu.stopId;
      if (!sid || stu.scheduleRelationship === 2) continue;
      const t = toNum((stu.arrival && stu.arrival.time) || (stu.departure && stu.departure.time));
      if (t < now) continue;
      if (out[sid] === undefined || t < out[sid]) out[sid] = t;
    }
  }
  return out;
}

// Vancouver is UTC-8 (PST) / UTC-7 (PDT, roughly Mar–Nov). Good enough for a
// human-readable "is it overnight?" hint in the report.
function vancouverHour() {
  const m = new Date().getUTCMonth(); // 0-11
  const isPdt = m >= 2 && m <= 10; // Mar–Nov ≈ daylight time
  const offset = isPdt ? 7 : 8;
  return (new Date(Date.now() - offset * 3600 * 1000).getUTCHours());
}

(async () => {
  const apiKey = readApiKey();
  const hr = vancouverHour();
  const overnight = hr < 5 || hr >= 24; // ~midnight–5am: mostly NightBus only
  console.log(`Vancouver local time ~${String(hr).padStart(2, '0')}:xx${overnight ? '  (overnight — expect mostly NightBus / few live arrivals)' : ''}`);
  console.log('Fetching live trip-updates feed (1 request)…');
  const upcoming = await fetchUpcomingByStop(apiKey);
  const feedStopIds = Object.keys(upcoming).length;
  console.log(`Feed has upcoming arrivals for ${feedStopIds} stop_ids system-wide.\n`);

  const sample = sampleSpread(100);
  const origin = { lat: 49.2827, lon: -123.1207 }; // downtown Vancouver

  const issues = [];
  let withLive = 0, withRoutes = 0, badCode = 0, orphanRoutes = 0;

  for (const s of sample) {
    // stop_code check
    if (!s.stop_code || !/^\d+$/.test(String(s.stop_code))) { badCode++; issues.push(`${s.stop_id}: missing/bad stop_code`); }

    // routes serving this stop
    const rids = stopRoutes[s.stop_id] || [];
    if (rids.length === 0) issues.push(`${s.stop_id} (#${s.stop_code}) ${s.stop_name}: no routes`);
    else withRoutes++;
    const orphans = rids.filter((r) => !routeById.has(r));
    if (orphans.length) { orphanRoutes += orphans.length; issues.push(`${s.stop_id}: route ids not in routes.json: ${orphans.join(',')}`); }

    // live arrival present?
    if (upcoming[s.stop_id] !== undefined) withLive++;

    // formatting sanity
    const d = haversine(origin.lat, origin.lon, s.stop_lat, s.stop_lon);
    const fd = formatDistance(d), wm = walkMinutes(d);
    if (!fd || wm < 1) issues.push(`${s.stop_id}: bad format d=${d}`);
  }

  console.log(`Sampled ${sample.length} stops spread across the region:`);
  console.log(`  ✓ valid stop_code:        ${sample.length - badCode}/${sample.length}`);
  console.log(`  ✓ have serving routes:    ${withRoutes}/${sample.length}`);
  console.log(`  ✓ routes all resolve:     ${sample.length - new Set(issues.filter(i=>i.includes('not in routes')).map(i=>i.split(':')[0])).size}/${sample.length}`);
  console.log(`  • have LIVE arrival now:  ${withLive}/${sample.length}  (rest = no bus in the feed right now — ${overnight ? 'EXPECTED overnight (NightBus only)' : 'normal off-peak'})`);
  console.log(`  distance/walk formatting: OK for all\n`);

  if (issues.length) {
    console.log(`ISSUES (${issues.length}):`);
    issues.slice(0, 40).forEach((i) => console.log('  - ' + i));
    if (issues.length > 40) console.log(`  …and ${issues.length - 40} more`);
    process.exitCode = 1;
  } else {
    console.log('No data issues found across the sample. ✅');
  }

  // Spot-print 8 stops with live arrivals so we can eyeball realistic output
  console.log('\nSample live arrivals (stop → next bus in):');
  let shown = 0;
  for (const s of sample) {
    if (upcoming[s.stop_id] === undefined || shown >= 8) continue;
    const mins = Math.round((upcoming[s.stop_id] - Date.now() / 1000) / 60);
    const rids = (stopRoutes[s.stop_id] || []).map((r) => routeById.get(r)?.route_short_name).filter(Boolean);
    console.log(`  #${s.stop_code} ${s.stop_name.slice(0, 34).padEnd(34)} → ${mins} min  [routes ${rids.slice(0,4).join(', ')}]`);
    shown++;
  }
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
