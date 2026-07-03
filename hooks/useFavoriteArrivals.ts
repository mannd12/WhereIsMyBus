import { useQuery } from '@tanstack/react-query';
import { getArrivalsForStops, getArrivalsForStopsViaProxy } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { ARRIVALS_REFRESH_MS, USE_PROXY } from '../constants/config';

/**
 * Live arrivals for all favourite stops from a SINGLE feed fetch (grouped by
 * stopId). Replaces one full-feed request per card — keeps the Favourites
 * screen well under the daily request cap no matter how many are starred.
 */
export function useFavoriteArrivals(stopIds: string[]) {
  const apiKey = useSettingsStore((s) => s.apiKey);
  // Stable key regardless of favourite order.
  const key = [...stopIds].sort().join(',');

  return useQuery({
    queryKey: ['favoriteArrivals', key, apiKey],
    queryFn: () => (USE_PROXY ? getArrivalsForStopsViaProxy(stopIds) : getArrivalsForStops(stopIds, apiKey)),
    enabled: stopIds.length > 0 && (Boolean(apiKey) || USE_PROXY),
    refetchInterval: ARRIVALS_REFRESH_MS,
    staleTime: 20_000,
    retry: 2,
  });
}
