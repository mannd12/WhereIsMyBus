// Timetable fallback served from EAS Hosting. The compact schedule is deployed
// as a STATIC asset (public/schedule/*.json, built by `npm run build-schedule-web`);
// this route lazy-loads it once per warm worker and computes the next departures
// for a stop in America/Vancouver time. Fail-safe: ANY problem → empty list, so
// the worst case is exactly today's behaviour ("no real-time arrivals").
const APP_TOKEN = process.env.APP_TOKEN ?? '';

interface Schedule {
  rs: string[];
  hs: string[];
  sched: Record<string, [number, number, number, number][]>; // stopId → [secs, rsI, hsI, svcI]
}
interface Svc { d: boolean[]; s: string; e: string; add: string[]; rem: string[] }
type Loaded = { sched: Schedule; svc: Record<string, Svc> };

let loaded: Loaded | null = null;
let loading: Promise<Loaded | null> | null = null;

async function load(origin: string): Promise<Loaded | null> {
  if (loaded) return loaded;
  if (loading) return loading;
  loading = (async () => {
    try {
      const [s, v] = await Promise.all([
        fetch(`${origin}/schedule/schedule.json`),
        fetch(`${origin}/schedule/services.json`),
      ]);
      if (!s.ok || !v.ok) return null;
      loaded = { sched: (await s.json()) as Schedule, svc: (await v.json()) as Record<string, Svc> };
      return loaded;
    } catch {
      return null;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

// Current wall-clock in Vancouver (PST/PDT via the runtime tz database).
function vancouverNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short',
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  const dateStr = `${g('year')}${g('month')}${g('day')}`;
  const nowSecs = +g('hour') * 3600 + +g('minute') * 60 + +g('second');
  const wd = ({ Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 } as Record<string, number>)[g('weekday')];
  const d = new Date(`${g('year')}-${g('month')}-${g('day')}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  const prevDateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const prevWd = (wd + 6) % 7;
  const midnightEpoch = Math.floor(Date.now() / 1000) - nowSecs;
  return { dateStr, nowSecs, wd, prevDateStr, prevWd, midnightEpoch };
}

function activeServices(svc: Record<string, Svc>, dateStr: string, weekday: number): Set<number> {
  const active = new Set<number>();
  for (const idx of Object.keys(svc)) {
    const s = svc[idx];
    let on = (!s.s || dateStr >= s.s) && (!s.e || dateStr <= s.e) && s.d[weekday];
    if (s.add.includes(dateStr)) on = true;
    if (s.rem.includes(dateStr)) on = false;
    if (on) active.add(Number(idx));
  }
  return active;
}

function nextDepartures(data: Loaded, stopId: string, max: number) {
  const rows = data.sched.sched[stopId];
  if (!rows) return [];
  const t = vancouverNow();
  const today = activeServices(data.svc, t.dateStr, t.wd);
  const yest = activeServices(data.svc, t.prevDateStr, t.prevWd);
  const out: { arrivalTime: number; routeShortName: string; headsign: string }[] = [];
  for (const [secs, rsI, hsI, svcI] of rows) {
    let eff: number | null = null;
    if (today.has(svcI) && secs >= t.nowSecs) eff = secs;
    if (eff === null && secs >= 86400 && yest.has(svcI) && secs - 86400 >= t.nowSecs) eff = secs - 86400;
    if (eff === null) continue;
    out.push({ arrivalTime: t.midnightEpoch + eff, routeShortName: data.sched.rs[rsI], headsign: data.sched.hs[hsI] });
  }
  out.sort((a, b) => a.arrivalTime - b.arrivalTime);
  return out.slice(0, max);
}

export async function GET(request: Request) {
  if (APP_TOKEN && request.headers.get('x-app-token') !== APP_TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }
  const url = new URL(request.url);
  const stopId = url.searchParams.get('stopId') ?? '';
  const max = Math.min(Number(url.searchParams.get('max')) || 6, 20);
  try {
    const data = await load(url.origin);
    if (!data || !stopId) return Response.json({ scheduled: [] });
    return Response.json({ scheduled: nextDepartures(data, stopId, max) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ scheduled: [] });
  }
}
