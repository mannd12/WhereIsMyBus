import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { ServiceAlert } from '../types/translink';
import { useServiceAlerts } from './useServiceAlerts';
import { getRoutesNear } from '../services/translink';
import { ALERTS_NEARBY_RADIUS_M } from '../constants/config';
import { useAlertsSeenStore, transitDay } from '../store/alertsSeen';

/**
 * Service alerts trimmed to the user's area: only alerts whose affected routes
 * serve a stop near the user, plus system-wide alerts with no specific route.
 * Falls back to all alerts until a location is known.
 */
export function useRelevantAlerts() {
  const query = useServiceAlerts();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const dismissedDay = useAlertsSeenStore((s) => s.dismissedDay);
  const dismissedIds = useAlertsSeenStore((s) => s.dismissedIds);

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
    let list = query.data ?? [];
    // Trim to the user's area
    if (coords) {
      const nearRoutes = getRoutesNear(coords.lat, coords.lon, ALERTS_NEARBY_RADIUS_M);
      list = list.filter(
        (a) => a.affectedRoutes.length === 0 || a.affectedRoutes.some((r) => nearRoutes.has(r)),
      );
    }
    // Hide alerts the user cleared today (resets at 3am with the day)
    if (dismissedDay === transitDay() && dismissedIds.length > 0) {
      const dismissed = new Set(dismissedIds);
      list = list.filter((a) => !dismissed.has(a.id));
    }
    return list;
  }, [query.data, coords, dismissedDay, dismissedIds]);

  return { ...query, alerts };
}
