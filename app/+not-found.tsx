import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColors, type ThemeColors } from '../hooks/useThemeColors';
import { useT } from '../locales/i18n';

// Shown for a link that doesn't match any screen (e.g. a malformed
// whereismybus:// deep link). Replaces Expo Router's English-only default.
export default function NotFoundScreen() {
  const tf = useT();
  const c = useThemeColors();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.container}>
      <Ionicons name="bus" size={48} color={c.primary} />
      <Text style={s.title}>{tf('notFound.title')}</Text>
      <Text style={s.body}>{tf('notFound.body')}</Text>
      <TouchableOpacity
        style={s.button}
        onPress={() => router.replace('/(tabs)')}
        accessibilityRole="button"
        accessibilityLabel={tf('notFound.cta')}
      >
        <Text style={s.buttonText}>{tf('notFound.cta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: c.background },
    title: { fontSize: 20, fontWeight: '800', color: c.text },
    body: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
    button: { marginTop: 8, backgroundColor: c.primary, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
