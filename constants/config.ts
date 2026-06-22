export const GTFS_RT_BASE = 'https://gtfsapi.translink.ca/v3';

export const TRIP_UPDATES_URL = (key: string) =>
  `${GTFS_RT_BASE}/gtfsrealtime?apikey=${key}`;
export const VEHICLE_POSITIONS_URL = (key: string) =>
  `${GTFS_RT_BASE}/gtfsposition?apikey=${key}`;
export const SERVICE_ALERTS_URL = (key: string) =>
  `${GTFS_RT_BASE}/gtfsalerts?apikey=${key}`;

export const ARRIVALS_REFRESH_MS = 60_000;  // 60s — was 30s
export const VEHICLES_REFRESH_MS = 60_000;  // 60s — was 15s
export const ALERTS_REFRESH_MS = 120_000;   // 2min — was 60s

export const NEARBY_RADIUS_M = 500;
export const MAX_NEARBY_STOPS = 20;
// Alerts are filtered to routes serving stops within this radius of the user.
// 25 mi (~40km) covers nearly all of Metro Vancouver, so we use a tighter
// "your area" radius that actually trims the list. Tune freely.
export const ALERTS_NEARBY_RADIUS_M = 12000;
export const MAX_ARRIVALS = 10;
export const ARRIVALS_LOOKAHEAD_S = 3600;

export const VANCOUVER_REGION = {
  latitude: 49.2827,
  longitude: -123.1207,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
