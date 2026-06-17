/**
 * fetchGtfsStatic.js
 *
 * Downloads TransLink's official GTFS static feed and extracts the data
 * needed by Whereismybus into data/*.json.
 *
 * Run once before first use, and again on schedule updates (~4x/year):
 *   node scripts/fetchGtfsStatic.js
 *
 * Requires: Node.js 18+, adm-zip, csv-parse (dev deps)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');

const GTFS_URL = 'https://gtfs-static.translink.ca/gtfs/google_transit.zip';
const OUT_DIR = path.join(__dirname, '..', 'data');
const MAX_SHAPE_PTS = 200; // points per route shape (downsample to keep file small)

function download(url) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} …`);
    const chunks = [];
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCsv(text) {
  return parse(text, { columns: true, skip_empty_lines: true, trim: true });
}

function downsample(points, max) {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const result = points.filter((_, i) => i % step === 0);
  // Always include the last point
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  return result;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const zipBuf = await download(GTFS_URL);
  console.log(`Downloaded ${(zipBuf.length / 1024 / 1024).toFixed(1)} MB`);

  const zip = new AdmZip(zipBuf);

  // ── stops.txt ──────────────────────────────────────────────────────────
  console.log('Processing stops.txt …');
  const stopsRaw = parseCsv(zip.readAsText('stops.txt'));
  const stopsOut = stopsRaw
    .filter((r) => !r.location_type || r.location_type === '0')
    .map((r) => ({
      stop_id: r.stop_id,
      stop_name: r.stop_name,
      stop_lat: parseFloat(r.stop_lat),
      stop_lon: parseFloat(r.stop_lon),
      route_types: [],
    }));

  // ── routes.txt ──────────────────────────────────────────────────────────
  console.log('Processing routes.txt …');
  const routesRaw = parseCsv(zip.readAsText('routes.txt'));
  const routesOut = routesRaw.map((r) => ({
    route_id: r.route_id,
    route_short_name: r.route_short_name,
    route_long_name: r.route_long_name,
    route_type: parseInt(r.route_type, 10),
    route_color: r.route_color || '005CA9',
    route_text_color: r.route_text_color || 'FFFFFF',
  }));
  const routeTypeMap = new Map(routesOut.map((r) => [r.route_id, r.route_type]));

  // ── trips.txt ──────────────────────────────────────────────────────────
  console.log('Processing trips.txt …');
  const tripsRaw = parseCsv(zip.readAsText('trips.txt'));
  const tripsOut = {};
  const routeShapeMap = new Map(); // route_id → first shape_id encountered

  for (const t of tripsRaw) {
    tripsOut[t.trip_id] = {
      trip_id: t.trip_id,
      route_id: t.route_id,
      trip_headsign: t.trip_headsign || '',
      direction_id: parseInt(t.direction_id, 10) || 0,
    };
    // Capture one shape_id per route (first encountered)
    if (t.shape_id && !routeShapeMap.has(t.route_id)) {
      routeShapeMap.set(t.route_id, t.shape_id);
    }
  }

  const tripRouteMap = new Map(
    Object.values(tripsOut).map((t) => [t.trip_id, t.route_id]),
  );

  // ── stop_times.txt — derive route_types and stopRoutes per stop ─────────
  console.log('Processing stop_times.txt …');
  const stopTimesRaw = parseCsv(zip.readAsText('stop_times.txt'));
  const stopRouteTypes = new Map(); // stop_id → Set<route_type>
  const stopRouteIds = new Map();   // stop_id → Set<route_id>

  for (const st of stopTimesRaw) {
    const routeId = tripRouteMap.get(st.trip_id);
    if (!routeId) continue;
    const rt = routeTypeMap.get(routeId);
    if (rt === undefined) continue;

    if (!stopRouteTypes.has(st.stop_id)) stopRouteTypes.set(st.stop_id, new Set());
    stopRouteTypes.get(st.stop_id).add(rt);

    if (!stopRouteIds.has(st.stop_id)) stopRouteIds.set(st.stop_id, new Set());
    stopRouteIds.get(st.stop_id).add(routeId);
  }

  for (const stop of stopsOut) {
    stop.route_types = [...(stopRouteTypes.get(stop.stop_id) ?? [3])];
  }

  // Build stopRoutes.json: { stopId → routeId[] }
  const stopRoutesOut = {};
  for (const [stopId, routeSet] of stopRouteIds) {
    stopRoutesOut[stopId] = [...routeSet];
  }

  // ── shapes.txt — one canonical shape per route ──────────────────────────
  console.log('Processing shapes.txt …');
  const shapesRaw = parseCsv(zip.readAsText('shapes.txt'));

  // Build shape_id → sorted points
  const shapePoints = new Map();
  for (const row of shapesRaw) {
    if (!shapePoints.has(row.shape_id)) shapePoints.set(row.shape_id, []);
    shapePoints.get(row.shape_id).push({
      lat: parseFloat(row.shape_pt_lat),
      lon: parseFloat(row.shape_pt_lon),
      seq: parseInt(row.shape_pt_sequence, 10),
    });
  }
  for (const pts of shapePoints.values()) {
    pts.sort((a, b) => a.seq - b.seq);
  }

  // Build shapes.json: { routeId → [[lat, lon], ...] }
  const shapesOut = {};
  for (const [routeId, shapeId] of routeShapeMap) {
    const pts = shapePoints.get(shapeId);
    if (!pts) continue;
    const sampled = downsample(pts, MAX_SHAPE_PTS);
    shapesOut[routeId] = sampled.map((p) => [p.lat, p.lon]);
  }

  // ── write output ────────────────────────────────────────────────────────
  fs.writeFileSync(path.join(OUT_DIR, 'stops.json'), JSON.stringify(stopsOut));
  fs.writeFileSync(path.join(OUT_DIR, 'routes.json'), JSON.stringify(routesOut));
  fs.writeFileSync(path.join(OUT_DIR, 'trips.json'), JSON.stringify(tripsOut));
  fs.writeFileSync(path.join(OUT_DIR, 'stopRoutes.json'), JSON.stringify(stopRoutesOut));
  fs.writeFileSync(path.join(OUT_DIR, 'shapes.json'), JSON.stringify(shapesOut));

  console.log(`✅  stops.json      — ${stopsOut.length} stops`);
  console.log(`✅  routes.json     — ${routesOut.length} routes`);
  console.log(`✅  trips.json      — ${Object.keys(tripsOut).length} trips`);
  console.log(`✅  stopRoutes.json — ${Object.keys(stopRoutesOut).length} stops indexed`);
  console.log(`✅  shapes.json     — ${Object.keys(shapesOut).length} route shapes`);
  console.log('\nAll done! Restart the Expo dev server to pick up new data.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
