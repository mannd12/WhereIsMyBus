import { useQuery } from '@tanstack/react-query';
import { getUpcomingByStop } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { ARRIVALS_REFRESH_MS } from '../constants/config';

/**
 * Map of stopId → next upcoming arrival (epoch seconds), from a single shared
 * trip-updates fetch. `enabled` should be true only while the map is visible,
 * so it doesn't poll in the background (keeps the shared API quota in check).
 */
export function useUpcomingArrivals(enabled: boolean) {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return useQuery({
    queryKey: ['upcomingByStop', apiKey],
    queryFn: () => getUpcomingByStop(apiKey),
    enabled: enabled && Boolean(apiKey),
    refetchInterval: ARRIVALS_REFRESH_MS,
    staleTime: 30_000,
  });
}
