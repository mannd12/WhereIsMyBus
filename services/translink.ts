import type { NearbyStop, Stop } from '../types/translink';
import { getAllStops } from './gtfsStatic';
import { NEARBY_RADIUS_M, MAX_NEARBY_STOPS } from '../constants/config';

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyStops(
  lat: number,
  lon: number,
  radius = NEARBY_RADIUS_M,
): NearbyStop[] {
  return getAllStops()
    .map((stop: Stop) => ({
      ...stop,
      distance: haversineDistance(lat, lon, stop.stop_lat, stop.stop_lon),
    }))
    .filter((s) => s.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_NEARBY_STOPS);
}

const MAX_MAP_STOPS = 250;

/** All stops inside the visible map region (lat/lon bounding box). */
export function getStopsInRegion(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  userLat?: number,
  userLon?: number,
): NearbyStop[] {
  const out: NearbyStop[] = [];
  for (const stop of getAllStops()) {
    if (
      stop.stop_lat < minLat ||
      stop.stop_lat > maxLat ||
      stop.stop_lon < minLon ||
      stop.stop_lon > maxLon
    ) {
      continue;
    }
    const distance =
      userLat !== undefined && userLon !== undefined
        ? haversineDistance(userLat, userLon, stop.stop_lat, stop.stop_lon)
        : 0;
    out.push({ ...stop, distance });
  }
  // Cap for performance; if dense, keep those closest to the map centre.
  if (out.length > MAX_MAP_STOPS) {
    const cLat = (minLat + maxLat) / 2;
    const cLon = (minLon + maxLon) / 2;
    out.sort(
      (a, b) =>
        haversineDistance(cLat, cLon, a.stop_lat, a.stop_lon) -
        haversineDistance(cLat, cLon, b.stop_lat, b.stop_lon),
    );
    return out.slice(0, MAX_MAP_STOPS);
  }
  return out;
}
