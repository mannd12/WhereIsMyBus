import { useMemo } from 'react';
import type { LocationObject } from 'expo-location';
import type { NearbyStop } from '../types/translink';
import { getNearbyStops } from '../services/translink';

export function useNearbyStops(location: LocationObject | null): NearbyStop[] {
  return useMemo(() => {
    if (!location) return [];
    return getNearbyStops(
      location.coords.latitude,
      location.coords.longitude,
    );
  }, [location?.coords.latitude, location?.coords.longitude]);
}
