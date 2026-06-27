import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { ServiceAlert } from '../types/translink';
import { useServiceAlerts } from './useServiceAlerts';
import { getRoutesNear } from '../services/translink';
import { getRoute } from '../services/gtfsStatic';
import { ALERTS_NEARBY_RADIUS_M } from '../constants/config';
import { useAlertsSeenStore, transitDay } from '../store/alertsSeen';

const BUS_ROUTE_TYPE = 3;

/**
 * Service alerts relevant to a bus rider near the user:
 * - must affect at least one BUS route (drops SkyTrain / SeaBus / WCE / fare /
 *   station notices, which BusPulse can't track anyway)
 * - that bus route should serve a stop near the user (when location is known)
 * Cleared alerts (Clear all) are hidden for the day; resets at 3am.
 */
export function useRelevantAlerts() {
  const query = useServiceAlerts();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const dismissedDay = useAlertsSeenStore((s) => s.dismissedDay);
  const dismissedIds = useAlertsSeenStore((s) => s.dismissedIds);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Last-known is instant; fall back to a fresh low-accuracy fix if absent.
      let pos = await Location.getLastKnownPositionAsync().catch(() => null);
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }).catch(
          () => null,
        );
      }
      if (alive && pos) setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    })();
    return () => {
      alive = false;
    };
  }, []);

  const alerts: ServiceAlert[] = useMemo(() => {
    const all = query.data ?? [];
    const nearRoutes = coords ? getRoutesNear(coords.lat, coords.lon, ALERTS_NEARBY_RADIUS_M) : null;

    let list = all.filter((a) => {
      // Keep only alerts that affect at least one bus route.
      const busRoutes = a.affectedRoutes.filter((r) => getRoute(r)?.route_type === BUS_ROUTE_TYPE);
      if (busRoutes.length === 0) return false;
      // If we know where the user is, require a nearby bus route.
      if (nearRoutes) return busRoutes.some((r) => nearRoutes.has(r));
      return true;
    });

    // Hide alerts the user cleared today (resets at 3am with the day).
    if (dismissedDay === transitDay() && dismissedIds.length > 0) {
      const dismissed = new Set(dismissedIds);
      list = list.filter((a) => !dismissed.has(a.id));
    }
    return list;
  }, [query.data, coords, dismissedDay, dismissedIds]);

  return { ...query, alerts };
}
