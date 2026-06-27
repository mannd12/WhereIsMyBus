import type { Stop, Route, Trip } from '../types/translink';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const stopsRaw: Stop[] = require('../data/stops.json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routesRaw: Route[] = require('../data/routes.json');

const routesMap = new Map<string, Route>();
for (const route of routesRaw) {
  routesMap.set(route.route_id, route);
}

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

export function getAllRoutes(): Route[] {
  return routesRaw;
}

export function getStop(stopId: string): Stop | undefined {
  return stopsRaw.find((s) => s.stop_id === stopId);
}

export function getRoute(routeId: string): Route | undefined {
  return routesMap.get(routeId);
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
    const exact = stopsRaw.filter((s) => s.stop_code === q);
    const prefix = stopsRaw.filter((s) => s.stop_code !== q && s.stop_code.startsWith(q));
    const contains = stopsRaw.filter((s) => !s.stop_code.startsWith(q) && s.stop_code.includes(q));
    return [...exact, ...prefix, ...contains].slice(0, 30);
  }

  const startsWith = stopsRaw.filter((s) => s.stop_name.toLowerCase().startsWith(q));
  const contains = stopsRaw.filter(
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
