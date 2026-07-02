// Server-only proxy for TransLink GTFS-RT, deployed to EAS Hosting.
// Caches each feed briefly so all app clients share ~1 upstream fetch per window
// (keeps the shared key under 1,000 req/day) and keeps the API key server-side.
// NOTE: `+api.ts` routes are excluded from the native app bundle — this never
// ships in the iOS binary.
const UPSTREAM = 'https://gtfsapi.translink.ca/v3';
const API_KEY = process.env.TRANSLINK_API_KEY ?? '';
const APP_TOKEN = process.env.APP_TOKEN ?? '';
const TTL: Record<string, number> = {
  gtfsrealtime: 30_000,
  gtfsposition: 30_000,
  gtfsalerts: 120_000,
};

type Entry = { at: number; bytes: ArrayBuffer | null; inflight?: Promise<ArrayBuffer> };
const cache: Record<string, Entry> = {};

async function fetchUpstream(feed: string): Promise<ArrayBuffer> {
  const res = await fetch(`${UPSTREAM}/${feed}?apikey=${API_KEY}`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.arrayBuffer();
}

// Serves cached bytes if fresh; otherwise fetches once (deduping concurrent
// requests) and falls back to stale bytes if the upstream fetch fails.
async function getFeed(feed: string): Promise<ArrayBuffer> {
  const ttl = TTL[feed];
  const now = Date.now();
  const e = cache[feed];
  if (e?.bytes && now - e.at < ttl) return e.bytes;
  if (e?.inflight) return e.inflight;
  const inflight = fetchUpstream(feed)
    .then((b) => {
      cache[feed] = { at: Date.now(), bytes: b };
      return b;
    })
    .catch((err) => {
      if (e?.bytes) return e.bytes;
      throw err;
    })
    .finally(() => {
      if (cache[feed]?.inflight === inflight) cache[feed].inflight = undefined;
    });
  cache[feed] = { at: e?.at ?? 0, bytes: e?.bytes ?? null, inflight };
  return inflight;
}

export async function GET(request: Request, { feed }: Record<string, string>) {
  // The 31 MB timetable can't ride along in a serverless function, so /schedule
  // returns empty here — the app cleanly falls back to "no real-time arrivals".
  if (feed === 'schedule') return Response.json({ scheduled: [] });
  if (!(feed in TTL)) return new Response('unknown feed', { status: 404 });
  if (APP_TOKEN && request.headers.get('x-app-token') !== APP_TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }
  try {
    const bytes = await getFeed(feed);
    return new Response(bytes, {
      headers: { 'Content-Type': 'application/x-protobuf', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response('upstream unavailable', { status: 502 });
  }
}
