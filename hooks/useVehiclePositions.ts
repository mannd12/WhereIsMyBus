import { useQuery } from '@tanstack/react-query';
import { getVehiclePositions } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { VEHICLES_REFRESH_MS } from '../constants/config';

/**
 * Live bus positions. `enabled` lets callers pause polling when their screen
 * isn't visible (e.g. the Nearby tab when another tab is on top) so it doesn't
 * keep hitting the shared request cap in the background. Defaults to on for
 * full-screen callers (route map, trip tracking).
 */
export function useVehiclePositions(enabled = true) {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return useQuery({
    queryKey: ['vehicles', apiKey],
    queryFn: () => getVehiclePositions(apiKey),
    enabled: enabled && Boolean(apiKey),
    refetchInterval: VEHICLES_REFRESH_MS,
    staleTime: 10_000,
  });
}
