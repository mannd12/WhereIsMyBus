import type { Arrival, ServiceAlert, VehiclePosition } from '../types/translink';
import { getRoute, getRouteForTrip, getTrip } from './gtfsStatic';
import {
  TRIP_UPDATES_URL,
  VEHICLE_POSITIONS_URL,
  SERVICE_ALERTS_URL,
  ARRIVALS_LOOKAHEAD_S,
  MAX_ARRIVALS,
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

async function fetchFeed(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GTFS-RT ${res.status}: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return transit_realtime.FeedMessage.decode(new Uint8Array(buf));
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
        trip?: { tripId?: string; routeId?: string; directionId?: number };
        stopTimeUpdate?: unknown[];
      };
    };
    const tu = e.tripUpdate;
    if (!tu) continue;

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
      // scheduleRelationship 2 = NO_DATA — no real-time prediction, skip
      if (stu.scheduleRelationship === 2) continue;
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
      a.headerText?.translation?.[0]?.text ?? 'Service Alert';
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
