import { useQuery } from '@tanstack/react-query';
import { getScheduledArrivals } from '../services/gtfsRealtime';

/**
 * Timetable fallback for a stop, from the proxy's /v3/schedule. Only fetches
 * when `enabled` (caller passes: proxy configured AND no real-time arrivals).
 * Scheduled times drift slowly, so this refreshes lazily.
 */
export function useScheduledArrivals(stopId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['scheduled', stopId],
    queryFn: () => getScheduledArrivals(stopId!),
    enabled: enabled && Boolean(stopId),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}
