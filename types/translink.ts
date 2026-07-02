export interface Stop {
  stop_id: string;
  /** Public number printed on the bus-stop sign (what riders search by). */
  stop_code: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  route_types: number[];
}

export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  route_color: string;
  route_text_color: string;
}

export interface Trip {
  route_id: string;
  trip_headsign: string;
}

export interface Arrival {
  tripId: string;
  routeId: string;
  routeShortName: string;
  headsign: string;
  arrivalTime: number;
  departureTime: number;
  routeColor: string;
  routeTextColor: string;
  routeType: number;
  countdown: number;
  isRealtime: boolean;
}

export interface ServiceAlert {
  id: string;
  headerText: string;
  descriptionText: string;
  affectedRoutes: string[];
  severity: string;
  timestamp: number;
}

export interface VehiclePosition {
  vehicleId: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  timestamp: number;
}

export interface NearbyStop extends Stop {
  distance: number;
}

/** A timetable departure (no live tracking) — the scheduled-time fallback. */
export interface ScheduledArrival {
  routeShortName: string;
  headsign: string;
  arrivalTime: number; // epoch seconds
}
