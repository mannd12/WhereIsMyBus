import { useQuery } from '@tanstack/react-query';
import { getArrivalsAtStop } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { ARRIVALS_REFRESH_MS, USE_PROXY } from '../constants/config';

export function useStopArrivals(stopId: string | null) {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return useQuery({
    queryKey: ['arrivals', stopId, apiKey],
    queryFn: () => getArrivalsAtStop(stopId!, apiKey),
    // Behind the proxy no client key is needed (it stays server-side).
    enabled: Boolean(stopId) && (Boolean(apiKey) || USE_PROXY),
    refetchInterval: ARRIVALS_REFRESH_MS,
    staleTime: 20_000,
    retry: 2,
  });
}
