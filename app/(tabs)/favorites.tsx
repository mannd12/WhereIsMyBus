import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/favorites';
import { getStop } from '../../services/gtfsStatic';
import { useStopArrivals } from '../../hooks/useStopArrivals';
import { ArrivalRow } from '../../components/stop/ArrivalRow';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import type { Arrival } from '../../types/translink';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: { backgroundColor: c.background },
    listContent: { padding: 12, gap: 12 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    cardTitle: { flex: 1 },
    stopName: { fontSize: 15, fontWeight: '700', color: c.text },
    stopId: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    loading: { fontSize: 13, color: c.textSecondary, padding: 12 },
    noArrivals: { fontSize: 13, color: c.textSecondary, padding: 12 },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.background,
      gap: 12,
      padding: 32,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text },
    emptySubtitle: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
  });

function FavoriteStopCard({ stopId }: { stopId: string }) {
  const stop = getStop(stopId);
  const { data: arrivals, isLoading } = useStopArrivals(stopId);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const next = (arrivals ?? []).slice(0, 2) as Arrival[];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.cardTitle} onPress={() => router.push(`/stop/${stopId}`)} activeOpacity={0.7}>
          <Text style={styles.stopName} numberOfLines={2}>{stop?.stop_name ?? `Stop #${stopId}`}</Text>
          <Text style={styles.stopId}>#{stopId}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeFavorite(stopId)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="star" size={20} color="#FFB800" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading arrivals…</Text>
      ) : next.length === 0 ? (
        <Text style={styles.noArrivals}>No upcoming arrivals</Text>
      ) : (
        next.map((a) => (
          <ArrivalRow key={a.tripId + a.arrivalTime} arrival={a} stopName={stop?.stop_name} />
        ))
      )}
    </View>
  );
}

export default function FavoritesScreen() {
  const stopIds = useFavoritesStore((s) => s.stopIds);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  if (stopIds.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="star-outline" size={52} color={c.border} />
        <Text style={styles.emptyTitle}>No favourites yet</Text>
        <Text style={styles.emptySubtitle}>Open any stop and tap the star to add it here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={stopIds}
      keyExtractor={(id) => id}
      renderItem={({ item }) => <FavoriteStopCard stopId={item} />}
      contentContainerStyle={styles.listContent}
    />
  );
}
