import { useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRelevantAlerts } from '../../hooks/useRelevantAlerts';
import { useAlertsSeenStore } from '../../store/alertsSeen';
import { AlertBanner } from '../../components/stop/AlertBanner';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: { backgroundColor: c.background },
    content: { paddingTop: 8, paddingBottom: 24 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    header: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    clearAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
    loadingText: { color: c.textSecondary, fontSize: 14 },
    errorTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    errorSub: { fontSize: 13, color: c.textSecondary, textAlign: 'center' },
    empty: { alignItems: 'center', marginTop: 60, gap: 12 },
    allClearText: { fontSize: 15, color: c.textSecondary },
  });

export default function AlertsScreen() {
  const { alerts, isLoading, isError, refetch, isFetching } = useRelevantAlerts();
  const markSeen = useAlertsSeenStore((s) => s.markSeen);
  const dismissAll = useAlertsSeenStore((s) => s.dismissAll);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  // Opening the tab clears the badge for today (it returns next day at 3am).
  useFocusEffect(useCallback(() => { markSeen(); }, [markSeen]));

  const handleClearAll = useCallback(() => {
    dismissAll(alerts.map((a) => a.id));
  }, [dismissAll, alerts]);

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading alerts…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={48} color={c.border} />
        <Text style={styles.errorTitle}>Could not load alerts</Text>
        <Text style={styles.errorSub}>Check your connection and API key in settings.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={alerts ?? []}
      keyExtractor={(a) => a.id}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />}
      ListHeaderComponent={
        alerts.length > 0 ? (
          <View style={styles.headerRow}>
            <Text style={styles.header}>
              {`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
            </Text>
            <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={52} color={Colors.skytrainCanada} />
          <Text style={styles.allClearText}>All clear — no service disruptions.</Text>
        </View>
      }
      renderItem={({ item }) => <AlertBanner alert={item} />}
    />
  );
}
