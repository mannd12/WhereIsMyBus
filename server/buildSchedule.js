/**
 * Builds the compact schedule artifact the proxy serves for the "scheduled-time
 * fallback" (timetable shown when a stop has no real-time bus).
 *
 * Downloads TransLink's GTFS static feed and writes:
 *   data/schedule.json  — { rs:[routeShortNames], hs:[headsigns],
 *                           sched: { [stopId]: [[depSecs, rsIdx, hsIdx, svcIdx], ...] } }
 *   data/services.json  — { [svcIdx]: { d:[7 weekday bools], s:start, e:end,
 *                                       add:[YYYYMMDD], rem:[YYYYMMDD] } }
 *
 * Strings are interned to indices to keep the files small. Run at deploy time
 * (`npm run build-schedule`); the server only reads the JSON at runtime.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GTFS_URL = 'https://gtfs-static.translink.ca/gtfs/google_transit.zip';
const OUT = path.join(__dirname, 'data');

function download(url) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

const parseCsv = (t) => parse(t, { columns: true, skip_empty_lines: true, trim: true });

// GTFS times can exceed 24h ("25:30:00" = 1:30am next day). Keep raw seconds.
function hms(v) {
  if (!v) return null;
  const p = v.split(':');
  if (p.length < 3) return null;
  const s = +p[0] * 3600 + +p[1] * 60 + +p[2];
  return Number.isFinite(s) ? s : null;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Downloading GTFS static…');
  const zip = new AdmZip(await download(GTFS_URL));

  console.log('Parsing routes / trips / calendar…');
  const routeShort = new Map(
    parseCsv(zip.readAsText('routes.txt')).map((r) => [r.route_id, r.route_short_name]),
  );
  const tripInfo = new Map();
  for (const t of parseCsv(zip.readAsText('trips.txt'))) {
    tripInfo.set(t.trip_id, {
      rs: routeShort.get(t.route_id) || t.route_id,
      sid: t.service_id,
      hs: t.trip_headsign || '',
    });
  }

  const safe = (name) => {
    try {
      return parseCsv(zip.readAsText(name));
    } catch {
      return [];
    }
  };
  const services = {};
  const emptySvc = () => ({ d: [false, false, false, false, false, false, false], s: '', e: '', add: [], rem: [] });
  for (const c of safe('calendar.txt')) {
    services[c.service_id] = {
      d: [c.monday, c.tuesday, c.wednesday, c.thursday, c.friday, c.saturday, c.sunday].map((x) => x === '1'),
      s: c.start_date,
      e: c.end_date,
      add: [],
      rem: [],
    };
  }
  for (const x of safe('calendar_dates.txt')) {
    const s = services[x.service_id] || (services[x.service_id] = emptySvc());
    (x.exception_type === '1' ? s.add : s.rem).push(x.date);
  }

  // Intern repeated strings → indices.
  const rs = [], rsI = new Map();
  const hs = [], hsI = new Map();
  const sid = [], sidI = new Map();
  const intern = (v, arr, map) => {
    let i = map.get(v);
    if (i === undefined) { i = arr.length; arr.push(v); map.set(v, i); }
    return i;
  };

  console.log('Parsing stop_times (largest file)…');
  const st = parseCsv(zip.readAsText('stop_times.txt'));
  console.log('  stop_time rows:', st.length);
  const sched = {};
  for (const r of st) {
    const info = tripInfo.get(r.trip_id);
    if (!info) continue;
    const secs = hms(r.departure_time || r.arrival_time);
    if (secs == null) continue;
    (sched[r.stop_id] || (sched[r.stop_id] = [])).push([
      secs,
      intern(info.rs, rs, rsI),
      intern(info.hs, hs, hsI),
      intern(info.sid, sid, sidI),
    ]);
  }
  for (const k in sched) sched[k].sort((a, b) => a[0] - b[0]);

  // Services keyed by the SAME index used in sched[...][3].
  const svcByIdx = {};
  sid.forEach((s, i) => { svcByIdx[i] = services[s] || emptySvc(); });

  fs.writeFileSync(path.join(OUT, 'schedule.json'), JSON.stringify({ rs, hs, sched }));
  fs.writeFileSync(path.join(OUT, 'services.json'), JSON.stringify(svcByIdx));
  const mb = (p) => (fs.statSync(path.join(OUT, p)).size / 1048576).toFixed(1);
  console.log(`✅ schedule.json ${mb('schedule.json')} MB — ${Object.keys(sched).length} stops, ${rs.length} routes, ${hs.length} headsigns`);
  console.log(`✅ services.json ${mb('services.json')} MB — ${sid.length} services`);
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
