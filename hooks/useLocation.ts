import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { LocationObject, LocationSubscription } from 'expo-location';
import { VANCOUVER_REGION } from '../constants/config';

// Fallback used when GPS is unavailable or permission denied
const VANCOUVER_FALLBACK: LocationObject = {
  coords: {
    latitude: VANCOUVER_REGION.latitude,
    longitude: VANCOUVER_REGION.longitude,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

export function useLocation() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sub: LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied — showing Vancouver centre.');
        setLocation(VANCOUVER_FALLBACK);
        setLoading(false);
        return;
      }
      // Instant: show stops immediately from the last-known position if we have one
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        setLocation(lastKnown);
        setLoading(false);
      }
      // Refine with a fresh fix (race against a 5s timeout so it never hangs)
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      setLocation(loc ?? lastKnown ?? VANCOUVER_FALLBACK);
      setLoading(false);

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 15_000, distanceInterval: 50 },
        (updated) => setLocation(updated),
      );
    })().catch((e) => {
      setError(String(e));
      setLoading(false);
    });

    return () => { sub?.remove(); };
  }, []);

  return { location, loading, error };
}
