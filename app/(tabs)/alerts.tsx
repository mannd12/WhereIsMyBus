import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ServiceAlert } from '../../types/translink';
import { useRelevantAlerts } from '../../hooks/useRelevantAlerts';
import { isRateLimited } from '../../services/gtfsRealtime';
import { useAlertsSeenStore } from '../../store/alertsSeen';
import { AlertBanner } from '../../components/stop/AlertBanner';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { useT } from '../../locales/i18n';

// Major = real disruptions; everything else (stop moves, accessibility notes) is minor.
const MAJOR_RE = /\b(close|cancel|detour|diversion|no service|not in service|suspend|reduc|delay|disrupt|reroute)/i;
function isMajorAlert(a: ServiceAlert): boolean {
  return MAJOR_RE.test(a.headerText) || MAJOR_RE.test(a.descriptionText ?? '');
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    list: { backgroundColor: c.background },
    content: { paddingTop: 4, paddingBottom: 24 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    header: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    clearAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
    noMajorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
    noMajorText: { fontSize: 14, color: c.textSecondary },
    minorToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 4,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    minorToggleText: { fontSize: 13, fontWeight: '600', color: c.text, flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
    loadingText: { color: c.textSecondary, fontSize: 14 },
    errorTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    errorSub: { fontSize: 13, color: c.textSecondary, textAlign: 'center' },
    empty: { alignItems: 'center', marginTop: 60, gap: 12 },
    allClearText: { fontSize: 15, color: c.textSecondary },
  });

export default function AlertsScreen() {
  const { alerts, isLoading, isError, error, refetch, isFetching } = useRelevantAlerts();
  const markSeen = useAlertsSeenStore((s) => s.markSeen);
  const dismissAll = useAlertsSeenStore((s) => s.dismissAll);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const tf = useT();
  const [showMinor, setShowMinor] = useState(false);

  const { major, minor } = useMemo(() => {
    const major: ServiceAlert[] = [];
    const minor: ServiceAlert[] = [];
    for (const a of alerts) (isMajorAlert(a) ? major : minor).push(a);
    return { major, minor };
  }, [alerts]);

  // Opening the tab clears the badge for today (it returns next day at 3am).
  useFocusEffect(useCallback(() => { markSeen(); }, [markSeen]));

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    dismissAll(alerts.map((a) => a.id));
  }, [dismissAll, alerts]);

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{tf('alerts.loading')}</Text>
      </View>
    );
  }

  if (isError) {
    const rl = isRateLimited(error);
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }, styles.center]}>
        <Ionicons name={rl ? 'time-outline' : 'cloud-offline-outline'} size={48} color={c.border} />
        <Text style={styles.errorTitle}>{rl ? tf('alerts.busy') : tf('alerts.loadFailed')}</Text>
        <Text style={styles.errorSub}>
          {rl ? tf('alerts.feedLimit') : tf('alerts.checkConnection')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Fixed header — stays put so Clear all is always reachable without scrolling */}
      {alerts.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.header}>
            {tf('alerts.active', { count: alerts.length })}
          </Text>
          <TouchableOpacity
            onPress={handleClearAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={tf('alerts.clearAllA11y')}
          >
            <Text style={styles.clearAll}>{tf('alerts.clearAll')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        style={styles.list}
        data={major}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />}
        ListHeaderComponent={
          major.length === 0 && minor.length > 0 ? (
            <View style={styles.noMajorRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.skytrainCanada} />
              <Text style={styles.noMajorText}>{tf('alerts.noMajor')}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          alerts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={52} color={Colors.skytrainCanada} />
              <Text style={styles.allClearText}>{tf('alerts.allClear')}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          minor.length > 0 ? (
            <View>
              <TouchableOpacity
                style={styles.minorToggle}
                onPress={() => setShowMinor((v) => !v)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={showMinor ? tf('alerts.hideMinor', { count: minor.length }) : tf('alerts.showMinor', { count: minor.length })}
              >
                <Text style={styles.minorToggleText}>
                  {showMinor ? tf('alerts.hideMinor', { count: minor.length }) : tf('alerts.showMinor', { count: minor.length })}
                </Text>
                <Ionicons name={showMinor ? 'chevron-up' : 'chevron-down'} size={16} color={c.textSecondary} />
              </TouchableOpacity>
              {showMinor && minor.map((a) => <AlertBanner key={a.id} alert={a} />)}
            </View>
          ) : null
        }
        renderItem={({ item }) => <AlertBanner alert={item} />}
      />
    </View>
  );
}
