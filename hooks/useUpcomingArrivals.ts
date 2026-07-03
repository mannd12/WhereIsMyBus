import { useQuery } from '@tanstack/react-query';
import { getUpcomingByStop, getUpcomingViaProxy } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { ARRIVALS_REFRESH_MS, USE_PROXY } from '../constants/config';

/**
 * Map of stopId → next upcoming arrival (epoch seconds). Behind the proxy it
 * asks only for the given `stopIds` (small JSON); direct mode decodes the whole
 * feed once. `enabled` should be true only while the map is visible.
 */
export function useUpcomingArrivals(stopIds: string[], enabled: boolean) {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const key = [...stopIds].sort().join(',');

  return useQuery({
    queryKey: USE_PROXY ? ['upcomingProxy', key] : ['upcomingByStop', apiKey],
    queryFn: () => (USE_PROXY ? getUpcomingViaProxy(stopIds) : getUpcomingByStop(apiKey)),
    enabled:
      enabled && (Boolean(apiKey) || USE_PROXY) && (!USE_PROXY || stopIds.length > 0),
    refetchInterval: ARRIVALS_REFRESH_MS,
    staleTime: 30_000,
  });
}
