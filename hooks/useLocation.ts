import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { LocationObject, LocationSubscription } from 'expo-location';
import { VANCOUVER_REGION } from '../constants/config';
import { t } from '../locales/i18n';

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
    // If the screen unmounts while the async chain below is still running
    // (permission prompt / GPS fix), the watcher would be created AFTER cleanup
    // and leak for the app's lifetime. Track cancellation explicitly.
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setError(t('nearby.locationDenied'));
        setLocation(VANCOUVER_FALLBACK);
        setLoading(false);
        return;
      }
      // Instant: show stops immediately from the last-known position if we have one
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (cancelled) return;
      if (lastKnown) {
        setLocation(lastKnown);
        setLoading(false);
      }
      // Refine with a fresh fix (race against a 5s timeout so it never hangs)
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      if (cancelled) return;
      setLocation(loc ?? lastKnown ?? VANCOUVER_FALLBACK);
      setLoading(false);

      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 15_000, distanceInterval: 50 },
        (updated) => setLocation(updated),
      );
      if (cancelled) {
        watcher.remove();
        return;
      }
      sub = watcher;
    })().catch((e) => {
      if (!cancelled) {
        setError(String(e));
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return { location, loading, error };
}
