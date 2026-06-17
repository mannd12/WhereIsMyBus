import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  apiKey: string;
  searchRadius: number;
  setApiKey: (key: string) => void;
  setSearchRadius: (r: number) => void;
}

// EXPO_PUBLIC_ vars are bundled at build time and accessible in RN code.
const ENV_API_KEY = process.env.EXPO_PUBLIC_TRANSLINK_API_KEY ?? '';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: ENV_API_KEY,
      searchRadius: 500,
      setApiKey: (apiKey) => set({ apiKey }),
      setSearchRadius: (searchRadius) => set({ searchRadius }),
    }),
    {
      name: 'whereismybus-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
