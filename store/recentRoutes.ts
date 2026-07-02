import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentRoutesState {
  routeIds: string[];
  addRecentRoute: (routeId: string) => void;
  clearRecent: () => void;
}

export const useRecentRoutesStore = create<RecentRoutesState>()(
  persist(
    (set, get) => ({
      routeIds: [],
      addRecentRoute: (routeId) =>
        set({
          routeIds: [routeId, ...get().routeIds.filter((id) => id !== routeId)].slice(0, 10),
        }),
      clearRecent: () => set({ routeIds: [] }),
    }),
    {
      name: 'buspulse-recent-routes',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
