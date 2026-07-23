import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** UI language preference: follow the device, or force English / Punjabi. */
export type LanguagePref = 'system' | 'en' | 'pa';

interface SettingsState {
  apiKey: string;
  /** Minutes before arrival to fire a departure reminder. */
  notifyLeadMinutes: number;
  /** Whether the first-run intro has been dismissed. */
  hasOnboarded: boolean;
  language: LanguagePref;
  setApiKey: (key: string) => void;
  setNotifyLeadMinutes: (m: number) => void;
  setHasOnboarded: (v: boolean) => void;
  setLanguage: (l: LanguagePref) => void;
}

// EXPO_PUBLIC_ vars are bundled at build time and accessible in RN code.
const ENV_API_KEY = process.env.EXPO_PUBLIC_TRANSLINK_API_KEY ?? '';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: ENV_API_KEY,
      notifyLeadMinutes: 5,
      hasOnboarded: false,
      language: 'system',
      setApiKey: (apiKey) => set({ apiKey }),
      setNotifyLeadMinutes: (notifyLeadMinutes) => set({ notifyLeadMinutes }),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'whereismybus-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // The API key is baked into each build from EXPO_PUBLIC_TRANSLINK_API_KEY.
      // Always prefer that env key so a rotated/higher-quota key in a new build
      // takes effect for existing users — only fall back to a persisted
      // user-entered key (BYO) when the build has no env key.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return { ...current, ...p, apiKey: ENV_API_KEY || p.apiKey || '' };
      },
    },
  ),
);
