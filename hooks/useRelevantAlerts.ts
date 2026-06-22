import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { ServiceAlert } from '../types/translink';
import { useServiceAlerts } from './useServiceAlerts';
import { getRoutesNear } from '../services/translink';
import { ALERTS_NEARBY_RADIUS_M } from '../constants/config';

/**
 * Service alerts trimmed to the user's area: only alerts whose affected routes
 * serve a stop near the user, plus system-wide alerts with no specific route.
 * Falls back to all alerts until a location is known.
 */
export function useRelevantAlerts() {
  const query = useServiceAlerts();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let alive = true;
    Location.getLastKnownPositionAsync()
      .then((pos) => {
        if (alive && pos) setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const alerts: ServiceAlert[] = useMemo(() => {
    const all = query.data ?? [];
    if (!coords) return all;
    const nearRoutes = getRoutesNear(coords.lat, coords.lon, ALERTS_NEARBY_RADIUS_M);
    return all.filter(
      (a) => a.affectedRoutes.length === 0 || a.affectedRoutes.some((r) => nearRoutes.has(r)),
    );
  }, [query.data, coords]);

  return { ...query, alerts };
}
