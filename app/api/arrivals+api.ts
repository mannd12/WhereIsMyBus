// Server-side per-stop arrivals (EAS Hosting). Decodes the trip-updates
// protobuf ONCE per cache window and serves callers just the stops they asked
// for as small JSON — so the app stops downloading the whole multi-MB feed.
// Returns raw {tripId, routeId, arrival, departure}; the app enriches route
// colour/headsign from its bundled GTFS (no need to ship that to the server).
// `+api.ts` never ships in the native app bundle.
import { transit_realtime } from 'gtfs-realtime-bindings';

const UPSTREAM = 'https://gtfsapi.translink.ca/v3/gtfsrealtime';
const API_KEY = process.env.TRANSLINK_API_KEY ?? '';
const APP_TOKEN = process.env.APP_TOKEN ?? '';
const TTL = 30_000;
const LOOKAHEAD_S = 3600; // don't return buses more than an hour out

type Raw = { t: string; r: string; a: number; d: number };
type Cache = { at: number; map: Record<string, Raw[]>; inflight?: Promise<Record<string, Raw[]>> };
let cache: Cache | null = null;

function toNum(v: unknown): number {
  if (v && typeof (v as { toNumber?: () => number }).toNumber === 'function') {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v ?? 0);
}

async function buildMap(): Promise<Record<string, Raw[]>> {
  const res = await fetch(`${UPSTREAM}?apikey=${API_KEY}`);
  if (!res.ok) {
    const e = new Error(`upstream ${res.status}`) as Error & { status?: number };
    e.status = res.status;
    throw e;
  }
  const buf = await res.arrayBuffer();
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buf));
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now + LOOKAHEAD_S;
  const map: Record<string, Raw[]> = {};
  for (const entity of feed.entity) {
    const tu = entity.tripUpdate;
    if (!tu) continue;
    if (tu.trip?.scheduleRelationship === 3) continue; // CANCELED
    const t = tu.trip?.tripId ?? '';
    const r = tu.trip?.routeId ?? '';
    if (!r) continue;
    for (const stu of tu.stopTimeUpdate ?? []) {
      const stopId = stu.stopId;
      if (!stopId) continue;
      if (stu.scheduleRelationship === 1 || stu.scheduleRelationship === 2) continue; // SKIPPED / NO_DATA
      const a = toNum(stu.arrival?.time ?? stu.departure?.time);
      if (a === 0 || a < now || a > cutoff) continue;
      (map[stopId] ??= []).push({ t, r, a, d: toNum(stu.departure?.time ?? stu.arrival?.time) });
    }
  }
  for (const k in map) map[k].sort((x, y) => x.a - y.a);
  return map;
}

async function getMap(): Promise<Record<string, Raw[]>> {
  const now = Date.now();
  if (cache?.map && now - cache.at < TTL) return cache.map;
  if (cache?.inflight) return cache.inflight;
  const inflight = buildMap()
    .then((map) => {
      cache = { at: Date.now(), map };
      return map;
    })
    .catch((err) => {
      if (cache?.map) return cache.map; // stale-on-error
      throw err;
    })
    .finally(() => {
      if (cache?.inflight === inflight) cache.inflight = undefined;
    });
  cache = { at: cache?.at ?? 0, map: cache?.map ?? {}, inflight };
  return inflight;
}

export async function GET(request: Request) {
  if (APP_TOKEN && request.headers.get('x-app-token') !== APP_TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }
  const stops = (new URL(request.url).searchParams.get('stops') ?? '').split(',').filter(Boolean);
  if (stops.length === 0) return Response.json({});
  try {
    const map = await getMap();
    const out: Record<string, Raw[]> = {};
    for (const s of stops) if (map[s]) out[s] = map[s].slice(0, 12);
    return Response.json(out, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 429 || status === 403) return new Response('rate limited', { status });
    return new Response('upstream unavailable', { status: 502 });
  }
}
