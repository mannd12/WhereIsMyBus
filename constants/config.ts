// Point at the BusPulse caching proxy by setting EXPO_PUBLIC_API_BASE at build
// time (e.g. https://whereismybus.expo.app/api). Unset → talk to TransLink
// directly, so nothing breaks without the proxy.
export const USE_PROXY = Boolean(process.env.EXPO_PUBLIC_API_BASE);
export const GTFS_RT_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'https://gtfsapi.translink.ca/v3';

// Optional shared secret sent as x-app-token when using the proxy.
export const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN || '';

// The scheduled-time fallback needs a schedule-CAPABLE host (the Express
// server/, not EAS Hosting, whose /api/schedule returns empty). Off unless
// explicitly enabled at build time, so proxied builds don't poll a stub.
export const SCHEDULE_ENABLED =
  USE_PROXY && process.env.EXPO_PUBLIC_SCHEDULE_ENABLED === '1';
export const SCHEDULE_URL = (stopId: string) =>
  `${GTFS_RT_BASE}/schedule?stopId=${encodeURIComponent(stopId)}`;

// When proxying, the TransLink key stays SERVER-side: no ?apikey= on the URL
// (it would leak into hosting access logs) and none is needed in the bundle.
const feedUrl = (feed: string, key: string) =>
  USE_PROXY ? `${GTFS_RT_BASE}/${feed}` : `${GTFS_RT_BASE}/${feed}?apikey=${key}`;
export const TRIP_UPDATES_URL = (key: string) => feedUrl('gtfsrealtime', key);
export const VEHICLE_POSITIONS_URL = (key: string) => feedUrl('gtfsposition', key);
export const SERVICE_ALERTS_URL = (key: string) => feedUrl('gtfsalerts', key);

// Proxy-only: the server decodes trip-updates and returns just the requested
// stops' arrivals as small JSON — the phone no longer downloads the whole feed.
export const ARRIVALS_URL = (stopIds: string[]) =>
  `${GTFS_RT_BASE}/arrivals?stops=${stopIds.map(encodeURIComponent).join(',')}`;

export const ARRIVALS_REFRESH_MS = 60_000;  // 60s — was 30s
export const VEHICLES_REFRESH_MS = 60_000;  // 60s — was 15s
export const ALERTS_REFRESH_MS = 120_000;   // 2min — was 60s

export const NEARBY_RADIUS_M = 500;
export const MAX_NEARBY_STOPS = 20;
// If the nearest TransLink stop is farther than this, the user is outside
// Metro Vancouver (e.g. Vancouver Island, the Interior) — show a coverage
// message instead of the misleading "no stops within 500 m". Metro Van riders
// are effectively never this far from a stop, so this won't false-positive.
export const COVERAGE_MAX_M = 10_000;
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
