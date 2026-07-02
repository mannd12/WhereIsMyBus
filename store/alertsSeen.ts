import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** A transit "day" string that rolls over at 3am LOCAL time, so the alerts badge
 * auto-clears each morning at 3am (rider's timezone) rather than accumulating.
 * Uses local date parts — NOT toISOString(), which would roll at 3am UTC. */
export function transitDay(date = new Date()): string {
  const shifted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const d = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface AlertsSeenState {
  lastSeenDay: string;
  markSeen: () => void;
  dismissedDay: string;
  dismissedIds: string[];
  dismissAll: (ids: string[]) => void;
}

export const useAlertsSeenStore = create<AlertsSeenState>()(
  persist(
    (set, get) => ({
      lastSeenDay: '',
      markSeen: () => set({ lastSeenDay: transitDay() }),
      dismissedDay: '',
      dismissedIds: [],
      dismissAll: (ids) => {
        const today = transitDay();
        const existing = get().dismissedDay === today ? get().dismissedIds : [];
        set({ dismissedDay: today, dismissedIds: Array.from(new Set([...existing, ...ids])) });
      },
    }),
    {
      name: 'buspulse-alerts-seen',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
