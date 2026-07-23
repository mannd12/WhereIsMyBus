import type { Arrival, ScheduledArrival, ServiceAlert, VehiclePosition } from '../types/translink';
import { getRoute, getRouteForTrip, getTrip } from './gtfsStatic';
import { t } from '../locales/i18n';
import {
  TRIP_UPDATES_URL,
  VEHICLE_POSITIONS_URL,
  SERVICE_ALERTS_URL,
  ARRIVALS_LOOKAHEAD_S,
  MAX_ARRIVALS,
  APP_TOKEN,
  SCHEDULE_URL,
  ARRIVALS_URL,
} from '../constants/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { transit_realtime } = require('gtfs-realtime-bindings');

// Safely converts a protobuf Long or number to a JS number
function toLong(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

/** True when an error came from hitting TransLink's daily/rate request limit. */
export function isRateLimited(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'rateLimited' in error &&
    (error as { rateLimited?: unknown }).rateLimited === true
  );
}

async function fetchFeed(url: string) {
  const res = await fetch(url, APP_TOKEN ? { headers: { 'x-app-token': APP_TOKEN } } : undefined);
  // 429 = too many requests; TransLink also returns 403 when the daily key quota is spent.
  if (res.status === 429 || res.status === 403) {
    const e = new Error(`GTFS-RT rate limited (${res.status})`) as Error & { rateLimited: boolean };
    e.rateLimited = true;
    throw e;
  }
  if (!res.ok) throw new Error(`GTFS-RT ${res.status}: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return transit_realtime.FeedMessage.decode(new Uint8Array(buf));
}

// ── Proxy per-stop arrivals (small JSON) ───────────────────────────────────
// The proxy sends raw {tripId, routeId, arrival, departure}; we enrich route
// colour/headsign here from the bundled GTFS, so the server stays light.
interface RawArrival { t: string; r: string; a: number; d: number }

function enrichRaw(raw: RawArrival, now: number): Arrival {
  const route = getRoute(raw.r) ?? getRouteForTrip(raw.t);
  const trip = getTrip(raw.t);
  return {
    tripId: raw.t,
    routeId: raw.r,
    routeShortName: route?.route_short_name ?? raw.r,
    headsign: trip?.trip_headsign ?? route?.route_long_name ?? '',
    arrivalTime: raw.a,
    departureTime: raw.d,
    routeColor: route?.route_color ?? '005CA9',
    routeTextColor: route?.route_text_color ?? 'FFFFFF',
    routeType: route?.route_type ?? 3,
    countdown: raw.a - now,
    isRealtime: true,
  };
}

async function fetchArrivalsJson(stopIds: string[]): Promise<Record<string, RawArrival[]>> {
  const res = await fetch(ARRIVALS_URL(stopIds), APP_TOKEN ? { headers: { 'x-app-token': APP_TOKEN } } : undefined);
  if (res.status === 429 || res.status === 403) {
    const e = new Error(`arrivals rate limited (${res.status})`) as Error & { rateLimited: boolean };
    e.rateLimited = true;
    throw e;
  }
  if (!res.ok) throw new Error(`arrivals ${res.status}`);
  return (await res.json()) as Record<string, RawArrival[]>;
}

/** Full arrivals for many stops via the proxy (one small request). */
export async function getArrivalsForStopsViaProxy(stopIds: string[]): Promise<Record<string, Arrival[]>> {
  if (stopIds.length === 0) return {};
  const map = await fetchArrivalsJson(stopIds);
  const now = Math.floor(Date.now() / 1000);
  const out: Record<string, Arrival[]> = {};
  for (const [stopId, raws] of Object.entries(map)) {
    out[stopId] = raws.map((r) => enrichRaw(r, now)).slice(0, MAX_ARRIVALS);
  }
  return out;
}

export async function getArrivalsAtStopViaProxy(stopId: string): Promise<Arrival[]> {
  const map = await getArrivalsForStopsViaProxy([stopId]);
  return map[stopId] ?? [];
}

/** Next arrival (epoch sec) per requested stop, via the proxy. */
export async function getUpcomingViaProxy(stopIds: string[]): Promise<Record<string, number>> {
  if (stopIds.length === 0) return {};
  const map = await fetchArrivalsJson(stopIds);
  const out: Record<string, number> = {};
  for (const [stopId, raws] of Object.entries(map)) {
    if (raws[0]) out[stopId] = raws[0].a;
  }
  return out;
}

export async function getArrivalsAtStop(
  stopId: string,
  apiKey: string,
): Promise<Arrival[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const feed = await fetchFeed(TRIP_UPDATES_URL(apiKey));
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now + ARRIVALS_LOOKAHEAD_S;
  const arrivals: Arrival[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entity of feed.entity as unknown[]) {
    const e = entity as {
      tripUpdate?: {
        trip?: { tripId?: string; routeId?: string; directionId?: number; scheduleRelationship?: number };
        stopTimeUpdate?: unknown[];
      };
    };
    const tu = e.tripUpdate;
    if (!tu) continue;
    // trip-level 3 = CANCELED — never show a bus that won't come
    if (tu.trip?.scheduleRelationship === 3) continue;

    const tripId = tu.trip?.tripId ?? '';
    const routeId = tu.trip?.routeId ?? '';
    if (!routeId) continue;

    for (const stu of (tu.stopTimeUpdate ?? []) as Array<{
      stopId?: string;
      scheduleRelationship?: number;
      arrival?: { time?: unknown };
      departure?: { time?: unknown };
    }>) {
      if (stu.stopId !== stopId) continue;
      // 1 = SKIPPED (detour passes this stop), 2 = NO_DATA — skip both
      if (stu.scheduleRelationship === 1 || stu.scheduleRelationship === 2) continue;
      const arrivalTime = toLong(stu.arrival?.time ?? stu.departure?.time);
      if (arrivalTime === 0 || arrivalTime < now || arrivalTime > cutoff) continue;

      const route = getRoute(routeId) ?? getRouteForTrip(tripId);
      const trip = getTrip(tripId);
      const color = route?.route_color ?? '005CA9';
      const textColor = route?.route_text_color ?? 'FFFFFF';

      arrivals.push({
        tripId,
        routeId,
        routeShortName: route?.route_short_name ?? routeId,
        headsign: trip?.trip_headsign ?? route?.route_long_name ?? '',
        arrivalTime,
        departureTime: toLong(stu.departure?.time ?? stu.arrival?.time),
        routeColor: color,
        routeTextColor: textColor,
        routeType: route?.route_type ?? 3,
        countdown: arrivalTime - now,
        isRealtime: true,
      });
    }
  }

  return arrivals
    .sort((a, b) => a.arrivalTime - b.arrivalTime)
    .slice(0, MAX_ARRIVALS);
}

/**
 * One fetch of the whole trip-updates feed → full arrivals for a specific set
 * of stops, grouped by stopId. Lets the Favourites screen show live arrivals for
 * every favourite from ONE request instead of one request per card (quota-safe).
 */
export async function getArrivalsForStops(
  stopIds: string[],
  apiKey: string,
): Promise<Record<string, Arrival[]>> {
  const wanted = new Set(stopIds);
  const out: Record<string, Arrival[]> = {};
  if (wanted.size === 0) return out;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const feed = await fetchFeed(TRIP_UPDATES_URL(apiKey));
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now + ARRIVALS_LOOKAHEAD_S;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entity of feed.entity as unknown[]) {
    const e = entity as {
      tripUpdate?: {
        trip?: { tripId?: string; routeId?: string; scheduleRelationship?: number };
        stopTimeUpdate?: unknown[];
      };
    };
    const tu = e.tripUpdate;
    if (!tu) continue;
    if (tu.trip?.scheduleRelationship === 3) continue; // CANCELED
    const tripId = tu.trip?.tripId ?? '';
    const routeId = tu.trip?.routeId ?? '';
    if (!routeId) continue;

    for (const stu of (tu.stopTimeUpdate ?? []) as Array<{
      stopId?: string;
      scheduleRelationship?: number;
      arrival?: { time?: unknown };
      departure?: { time?: unknown };
    }>) {
      if (!stu.stopId || !wanted.has(stu.stopId)) continue;
      if (stu.scheduleRelationship === 1 || stu.scheduleRelationship === 2) continue;
      const arrivalTime = toLong(stu.arrival?.time ?? stu.departure?.time);
      if (arrivalTime === 0 || arrivalTime < now || arrivalTime > cutoff) continue;

      const route = getRoute(routeId) ?? getRouteForTrip(tripId);
      const trip = getTrip(tripId);
      (out[stu.stopId] ??= []).push({
        tripId,
        routeId,
        routeShortName: route?.route_short_name ?? routeId,
        headsign: trip?.trip_headsign ?? route?.route_long_name ?? '',
        arrivalTime,
        departureTime: toLong(stu.departure?.time ?? stu.arrival?.time),
        routeColor: route?.route_color ?? '005CA9',
        routeTextColor: route?.route_text_color ?? 'FFFFFF',
        routeType: route?.route_type ?? 3,
        countdown: arrivalTime - now,
        isRealtime: true,
      });
    }
  }

  for (const id of Object.keys(out)) {
    out[id].sort((a, b) => a.arrivalTime - b.arrivalTime);
  }
  return out;
}

/**
 * One fetch of the whole trip-updates feed → each stop's earliest upcoming
 * arrival (epoch seconds). Lets the map show next-bus for many stops from a
 * single request instead of one request per stop.
 */
export async function getUpcomingByStop(apiKey: string): Promise<Record<string, number>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const feed = await fetchFeed(TRIP_UPDATES_URL(apiKey));
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now + ARRIVALS_LOOKAHEAD_S; // don't show "next bus: 223 min"
  const out: Record<string, number> = {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entity of feed.entity as unknown[]) {
    const e = entity as {
      tripUpdate?: { trip?: { scheduleRelationship?: number }; stopTimeUpdate?: unknown[] };
    };
    const tu = e.tripUpdate;
    if (!tu) continue;
    if (tu.trip?.scheduleRelationship === 3) continue; // CANCELED
    for (const stu of (tu.stopTimeUpdate ?? []) as Array<{
      stopId?: string;
      scheduleRelationship?: number;
      arrival?: { time?: unknown };
      departure?: { time?: unknown };
    }>) {
      const stopId = stu.stopId;
      if (!stopId || stu.scheduleRelationship === 1 || stu.scheduleRelationship === 2) continue;
      const t = toLong(stu.arrival?.time ?? stu.departure?.time);
      if (t < now || t > cutoff) continue;
      if (out[stopId] === undefined || t < out[stopId]) out[stopId] = t;
    }
  }
  return out;
}

/**
 * Next scheduled departures for a stop (timetable fallback) — served by the
 * proxy's /v3/schedule. Returns [] if the proxy/schedule isn't available.
 */
export async function getScheduledArrivals(stopId: string): Promise<ScheduledArrival[]> {
  // Best-effort: any network/parse failure just means no timetable to show, so
  // return [] rather than throwing (avoids pointless react-query retries).
  try {
    const res = await fetch(SCHEDULE_URL(stopId), APP_TOKEN ? { headers: { 'x-app-token': APP_TOKEN } } : undefined);
    if (!res.ok) return [];
    const body = (await res.json()) as { scheduled?: ScheduledArrival[] };
    return body.scheduled ?? [];
  } catch {
    return [];
  }
}

export async function getVehiclePositions(
  apiKey: string,
): Promise<VehiclePosition[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const feed = await fetchFeed(VEHICLE_POSITIONS_URL(apiKey));
  const positions: VehiclePosition[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entity of feed.entity as unknown[]) {
    const e = entity as {
      vehicle?: {
        vehicle?: { id?: string; label?: string };
        trip?: { tripId?: string; routeId?: string };
        position?: {
          latitude?: number;
          longitude?: number;
          bearing?: number;
        };
        timestamp?: unknown;
      };
    };
    const v = e.vehicle;
    if (!v?.position) continue;

    positions.push({
      vehicleId: v.vehicle?.id ?? v.vehicle?.label ?? '',
      tripId: v.trip?.tripId ?? '',
      routeId: v.trip?.routeId ?? '',
      latitude: v.position.latitude ?? 0,
      longitude: v.position.longitude ?? 0,
      bearing: v.position.bearing,
      timestamp: toLong(v.timestamp),
    });
  }
  return positions;
}

export async function getServiceAlerts(
  apiKey: string,
): Promise<ServiceAlert[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const feed = await fetchFeed(SERVICE_ALERTS_URL(apiKey));
  const alerts: ServiceAlert[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entity of feed.entity as unknown[]) {
    const e = entity as {
      id?: string;
      alert?: {
        headerText?: { translation?: Array<{ text?: string }> };
        descriptionText?: { translation?: Array<{ text?: string }> };
        informedEntity?: Array<{ routeId?: string }>;
        severityLevel?: number;
        activePeriod?: Array<{ start?: unknown }>;
      };
    };
    const a = e.alert;
    if (!a) continue;

    const header =
      a.headerText?.translation?.[0]?.text ?? t('alerts.serviceAlertFallback');
    const description =
      a.descriptionText?.translation?.[0]?.text ?? '';
    const routes = (a.informedEntity ?? [])
      .map((ie) => ie.routeId ?? '')
      .filter(Boolean);

    alerts.push({
      id: e.id ?? '',
      headerText: header,
      descriptionText: description,
      affectedRoutes: routes,
      severity: String(a.severityLevel ?? 1),
      timestamp: toLong(a.activePeriod?.[0]?.start ?? 0),
    });
  }
  return alerts;
}
