import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../constants/colors';

export type ThemeColors = typeof Colors;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return useMemo(() => (scheme === 'dark' ? DarkColors : Colors), [scheme]);
}
