import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  stopIds: string[];
  addFavorite: (stopId: string) => void;
  removeFavorite: (stopId: string) => void;
  isFavorite: (stopId: string) => boolean;
  toggleFavorite: (stopId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      stopIds: [],
      addFavorite: (stopId) =>
        set((s) => ({
          stopIds: s.stopIds.includes(stopId) ? s.stopIds : [...s.stopIds, stopId],
        })),
      removeFavorite: (stopId) =>
        set((s) => ({ stopIds: s.stopIds.filter((id) => id !== stopId) })),
      isFavorite: (stopId) => get().stopIds.includes(stopId),
      toggleFavorite: (stopId) => {
        if (get().isFavorite(stopId)) get().removeFavorite(stopId);
        else get().addFavorite(stopId);
      },
    }),
    {
      name: 'whereismybus-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
