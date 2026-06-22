import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** A transit "day" string that rolls over at 3am, so the alerts badge
 * auto-clears each day at 3am rather than accumulating. */
export function transitDay(date = new Date()): string {
  const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

interface AlertsSeenState {
  lastSeenDay: string;
  markSeen: () => void;
}

export const useAlertsSeenStore = create<AlertsSeenState>()(
  persist(
    (set) => ({
      lastSeenDay: '',
      markSeen: () => set({ lastSeenDay: transitDay() }),
    }),
    {
      name: 'buspulse-alerts-seen',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
