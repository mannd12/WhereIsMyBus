import type { Stop, Route, Trip } from '../types/translink';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const stopsRaw: Stop[] = require('../data/stops.json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routesRaw: Route[] = require('../data/routes.json');

const routesMap = new Map<string, Route>();
for (const route of routesRaw) {
  routesMap.set(route.route_id, route);
}

// BusPulse is bus-only — TransLink publishes no real-time for SkyTrain/SeaBus/WCE,
// so those stops (route_type 1/2/4) are permanent dead-ends. Exclude them from every
// user-facing list (search, nearby, map) so riders never tap a stop with no arrivals.
// route_type 3 = bus. Station bus BAYS are separate route_type-3 stops and are kept.
const BUS_ROUTE_TYPE = 3;
const busStops = stopsRaw.filter((s) => s.route_types.includes(BUS_ROUTE_TYPE));

// Lazily loaded large datasets
let tripsMap: Map<string, Trip> | null = null;
let stopRoutesData: Record<string, string[]> | null = null;
let shapesData: Record<string, [number, number][]> | null = null;

function getTripsMap(): Map<string, Trip> {
  if (!tripsMap) {
    tripsMap = new Map<string, Trip>();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw: Record<string, Trip> = require('../data/trips.json');
    for (const [tripId, trip] of Object.entries(raw)) {
      tripsMap.set(tripId, trip);
    }
  }
  return tripsMap;
}

function getStopRoutesData(): Record<string, string[]> {
  if (!stopRoutesData) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      stopRoutesData = require('../data/stopRoutes.json') as Record<string, string[]>;
    } catch {
      stopRoutesData = {};
    }
  }
  return stopRoutesData;
}

function getShapesData(): Record<string, [number, number][]> {
  if (!shapesData) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      shapesData = require('../data/shapes.json') as Record<string, [number, number][]>;
    } catch {
      shapesData = {};
    }
  }
  return shapesData;
}

export function getAllStops(): Stop[] {
  return stopsRaw;
}

/** Bus-only stops (route_type 3). Use this for anything the rider browses. */
export function getBusStops(): Stop[] {
  return busStops;
}

export function getAllRoutes(): Route[] {
  return routesRaw;
}

export function getStop(stopId: string): Stop | undefined {
  return stopsRaw.find((s) => s.stop_id === stopId);
}

export function getRoute(routeId: string): Route | undefined {
  return routesMap.get(routeId);
}

const routesByShortName = new Map<string, Route>();
for (const route of routesRaw) {
  if (!routesByShortName.has(route.route_short_name)) routesByShortName.set(route.route_short_name, route);
}
/** Look up a route by its short name (e.g. "099", "R4") — for scheduled rows. */
export function getRouteByShortName(shortName: string): Route | undefined {
  return routesByShortName.get(shortName);
}

export function getTrip(tripId: string): Trip | undefined {
  return getTripsMap().get(tripId);
}

export function getRouteForTrip(tripId: string): Route | undefined {
  const trip = getTripsMap().get(tripId);
  return trip ? routesMap.get(trip.route_id) : undefined;
}

/** Route IDs that serve a given stop. Returns [] if stopRoutes.json not yet built. */
export function getStopRoutes(stopId: string): string[] {
  return getStopRoutesData()[stopId] ?? [];
}

/** Lat/lon points for a route shape. Returns [] if shapes.json not yet built. */
export function getRouteShape(routeId: string): [number, number][] {
  return getShapesData()[routeId] ?? [];
}

/** All stops that serve a given route (unordered). */
export function getStopsForRoute(routeId: string): Stop[] {
  const data = getStopRoutesData();
  return stopsRaw.filter((s) => (data[s.stop_id] ?? []).includes(routeId));
}

export function searchStops(query: string): Stop[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const isNumeric = /^\d+$/.test(q);

  if (isNumeric) {
    // Riders search by the number on the sign (stop_code), not the internal stop_id.
    const exact = busStops.filter((s) => s.stop_code === q);
    const prefix = busStops.filter((s) => s.stop_code !== q && s.stop_code.startsWith(q));
    const contains = busStops.filter((s) => !s.stop_code.startsWith(q) && s.stop_code.includes(q));
    return [...exact, ...prefix, ...contains].slice(0, 30);
  }

  const startsWith = busStops.filter((s) => s.stop_name.toLowerCase().startsWith(q));
  const contains = busStops.filter(
    (s) => !s.stop_name.toLowerCase().startsWith(q) && s.stop_name.toLowerCase().includes(q),
  );
  return [...startsWith, ...contains].slice(0, 30);
}

export function searchRoutes(query: string): Route[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return routesRaw
    .filter(
      (r) =>
        r.route_short_name.toLowerCase().includes(q) ||
        r.route_long_name.toLowerCase().includes(q),
    )
    .slice(0, 20);
}
