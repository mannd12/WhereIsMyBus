import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentStopsState {
  stopIds: string[];
  addRecentStop: (stopId: string) => void;
  clearRecent: () => void;
}

export const useRecentStopsStore = create<RecentStopsState>()(
  persist(
    (set, get) => ({
      stopIds: [],
      addRecentStop: (stopId) =>
        set({
          stopIds: [stopId, ...get().stopIds.filter((id) => id !== stopId)].slice(0, 10),
        }),
      clearRecent: () => set({ stopIds: [] }),
    }),
    {
      name: 'whereismybus-recent-stops',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
