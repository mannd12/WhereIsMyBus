import { useQuery } from '@tanstack/react-query';
import { getVehiclePositions } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { VEHICLES_REFRESH_MS } from '../constants/config';

export function useVehiclePositions() {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return useQuery({
    queryKey: ['vehicles', apiKey],
    queryFn: () => getVehiclePositions(apiKey),
    enabled: Boolean(apiKey),
    refetchInterval: VEHICLES_REFRESH_MS,
    staleTime: 10_000,
  });
}
