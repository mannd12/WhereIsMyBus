import { useQuery } from '@tanstack/react-query';
import { getServiceAlerts } from '../services/gtfsRealtime';
import { useSettingsStore } from '../store/settings';
import { ALERTS_REFRESH_MS } from '../constants/config';

export function useServiceAlerts() {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return useQuery({
    queryKey: ['alerts', apiKey],
    queryFn: () => getServiceAlerts(apiKey),
    enabled: Boolean(apiKey),
    refetchInterval: ALERTS_REFRESH_MS,
    staleTime: 50_000,
  });
}
