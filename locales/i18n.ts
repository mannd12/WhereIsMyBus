import { useCallback } from 'react';
import { getLocales } from 'expo-localization';
import { useSettingsStore, type LanguagePref } from '../store/settings';
import { en, type TranslationKey } from './en';
import { pa } from './pa';

export type ResolvedLang = 'en' | 'pa';
export type TParams = Record<string, string | number>;

// Read once — the device language can't change while the app is running
// (iOS restarts the app when the system language changes).
const deviceLang: ResolvedLang = getLocales()[0]?.languageCode === 'pa' ? 'pa' : 'en';

export function resolveLang(pref: LanguagePref): ResolvedLang {
  return pref === 'system' ? deviceLang : pref;
}

function translate(lang: ResolvedLang, key: TranslationKey, params?: TParams): string {
  const dict = lang === 'pa' ? pa : en;
  let str: string = dict[key] ?? en[key] ?? key;
  // "_plural" sibling wins when count !== 1 (English "1 stop" / "2 stops" etc.).
  if (params && typeof params.count === 'number' && params.count !== 1) {
    const plural = (dict as Record<string, string>)[`${key}_plural`];
    if (plural) str = plural;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}

/**
 * Non-reactive translate — for code that runs outside React (notifications,
 * share messages built in handlers). Components should use useT() so they
 * re-render when the language setting changes.
 */
export function t(key: TranslationKey, params?: TParams): string {
  let pref: LanguagePref = 'system';
  try {
    pref = useSettingsStore.getState().language;
  } catch {
    // Store unavailable (e.g. inside the error boundary) — fall back to device.
  }
  return translate(resolveLang(pref), key, params);
}

/** Reactive hook: returns a `t` bound to the current language setting. */
export function useT() {
  const pref = useSettingsStore((s) => s.language);
  const lang = resolveLang(pref);
  return useCallback(
    (key: TranslationKey, params?: TParams) => translate(lang, key, params),
    [lang],
  );
}

export type { TranslationKey };
