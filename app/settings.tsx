import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSettingsStore, type LanguagePref } from '../store/settings';
import { useT } from '../locales/i18n';
import { useRecentStopsStore } from '../store/recentStops';
import { useThemeColors, type ThemeColors } from '../hooks/useThemeColors';
import { Colors } from '../constants/colors';

const PRIVACY_URL = 'https://mannd12.github.io/WhereIsMyBus/privacy-policy.html';
const SUPPORT_URL = 'https://mannd12.github.io/WhereIsMyBus/support.html';
const LEAD_OPTIONS = [2, 5, 10];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 24, paddingBottom: 40 },
    section: { gap: 8 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginLeft: 4,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      overflow: 'hidden',
    },
    rowLabel: { fontSize: 15, color: c.text, marginBottom: 4 },
    rowSub: { fontSize: 12, color: c.textSecondary },
    padRow: { padding: 14 },
    pillRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    pill: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    pillText: { fontSize: 14, fontWeight: '600', color: c.text },
    pillTextActive: { color: '#fff' },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    linkRowFirst: { borderTopWidth: 0 },
    linkText: { fontSize: 15, color: c.text },
    dangerText: { fontSize: 15, color: Colors.due, fontWeight: '600' },
    aboutName: { fontSize: 18, fontWeight: '800', color: c.text },
    aboutVersion: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    aboutBody: { fontSize: 13, color: c.textSecondary, marginTop: 8, lineHeight: 19 },
    attribution: { fontSize: 12, color: c.textSecondary, textAlign: 'center', lineHeight: 18, marginTop: 4 },
  });

function LinkRow({ label, onPress, first, danger }: { label: string; onPress: () => void; first?: boolean; danger?: boolean }) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <TouchableOpacity
      style={[styles.linkRow, first && styles.linkRowFirst]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={danger ? styles.dangerText : styles.linkText}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const lead = useSettingsStore((s) => s.notifyLeadMinutes);
  const setLead = useSettingsStore((s) => s.setNotifyLeadMinutes);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const clearRecent = useRecentStopsStore((s) => s.clearRecent);
  const tf = useT();

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const confirmClearRecent = () => {
    Alert.alert(tf('settings.clearRecentTitle'), tf('settings.clearRecentBody'), [
      { text: tf('common.cancel'), style: 'cancel' },
      { text: tf('common.clear'), style: 'destructive', onPress: () => clearRecent() },
    ]);
  };

  // English/Punjabi options label themselves in their own language so each is
  // always readable no matter which language is active.
  const LANGUAGE_OPTIONS: { value: LanguagePref; label: string }[] = [
    { value: 'system', label: tf('settings.langSystem') },
    { value: 'en', label: 'English' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={tf('settings.close')}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tf('settings.notifications')}</Text>
          <View style={[styles.card, styles.padRow]}>
            <Text style={styles.rowLabel}>{tf('settings.remindBefore')}</Text>
            <Text style={styles.rowSub}>{tf('settings.leadTimeSub')}</Text>
            <View style={styles.pillRow}>
              {LEAD_OPTIONS.map((m) => {
                const active = lead === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setLead(m)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={tf('settings.minutesBefore', { m })}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{tf('settings.minShort', { m })}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tf('settings.language')}</Text>
          <View style={[styles.card, styles.padRow]}>
            <Text style={styles.rowSub}>{tf('settings.languageSub')}</Text>
            <View style={styles.pillRow}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setLanguage(opt.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={opt.label}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Data & privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tf('settings.dataPrivacy')}</Text>
          <View style={styles.card}>
            <LinkRow label={tf('settings.privacyPolicy')} first onPress={() => Linking.openURL(PRIVACY_URL)} />
            <LinkRow label={tf('settings.support')} onPress={() => Linking.openURL(SUPPORT_URL)} />
            <LinkRow label={tf('settings.clearRecent')} danger onPress={confirmClearRecent} />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tf('settings.about')}</Text>
          <View style={[styles.card, styles.padRow]}>
            <Text style={styles.aboutName}>BusPulse</Text>
            <Text style={styles.aboutVersion}>{tf('settings.version', { v: version })}</Text>
            <Text style={styles.aboutBody}>{tf('settings.aboutBody')}</Text>
          </View>
          <Text style={styles.attribution}>{tf('settings.attribution')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
