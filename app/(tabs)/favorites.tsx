import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/favorites';
import { getStop } from '../../services/gtfsStatic';
import { haversineDistance } from '../../services/translink';
import { useFavoriteArrivals } from '../../hooks/useFavoriteArrivals';
import { useLocation } from '../../hooks/useLocation';
import { ArrivalRow } from '../../components/stop/ArrivalRow';
import { ArrivalListSkeleton } from '../../components/ui/Skeleton';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { formatDistance, walkMinutes } from '../../constants/format';
import type { Arrival } from '../../types/translink';

interface Coords { latitude: number; longitude: number }

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
    reorder: { alignItems: 'center', justifyContent: 'center' },
    stopName: { fontSize: 15, fontWeight: '700', color: c.text },
    stopId: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    walk: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
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
    emptyIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: 'rgba(0,92,169,0.10)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text },
    emptySubtitle: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
    emptyCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: Colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 22,
      marginTop: 8,
    },
    emptyCtaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });

function FavoriteStopCard({
  stopId,
  index,
  total,
  origin,
  arrivals,
  isLoading,
}: {
  stopId: string;
  index: number;
  total: number;
  origin: Coords | null;
  arrivals: Arrival[] | undefined;
  isLoading: boolean;
}) {
  const stop = getStop(stopId);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const moveFavorite = useFavoritesStore((s) => s.moveFavorite);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const next = (arrivals ?? []).slice(0, 2);

  const distance = useMemo(() => {
    if (!origin || !stop) return null;
    return haversineDistance(origin.latitude, origin.longitude, stop.stop_lat, stop.stop_lon);
  }, [origin, stop]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardTitle}
          onPress={() => router.push(`/stop/${stopId}`)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${stop?.stop_name ?? 'Stop'} ${stop?.stop_code ?? stopId}, open arrivals`}
        >
          <Text style={styles.stopName} numberOfLines={2}>{stop?.stop_name ?? `Stop #${stopId}`}</Text>
          <Text style={styles.stopId}>#{stop?.stop_code ?? stopId}</Text>
          {distance !== null && (
            <Text style={styles.walk}>
              {formatDistance(distance)}
              {/* Walk time only when it's plausibly walkable — a "211 min walk" is noise. */}
              {distance < 3000 ? ` · ~${walkMinutes(distance)} min walk` : ''}
            </Text>
          )}
        </TouchableOpacity>
        {total > 1 && (
          <View style={styles.reorder}>
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => moveFavorite(stopId, -1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Move favourite up"
            >
              <Ionicons name="chevron-up" size={20} color={index === 0 ? c.border : c.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={index === total - 1}
              onPress={() => moveFavorite(stopId, 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Move favourite down"
            >
              <Ionicons name="chevron-down" size={20} color={index === total - 1 ? c.border : c.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          onPress={() => removeFavorite(stopId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Remove from favourites"
        >
          <Ionicons name="star" size={20} color="#FFB800" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ArrivalListSkeleton rows={2} />
      ) : next.length === 0 ? (
        <Text style={styles.noArrivals}>No upcoming arrivals</Text>
      ) : (
        next.map((a) => (
          <ArrivalRow key={a.tripId + a.arrivalTime} arrival={a} stopName={stop?.stop_name} stopId={stopId} />
        ))
      )}
    </View>
  );
}

export default function FavoritesScreen() {
  const stopIds = useFavoritesStore((s) => s.stopIds);
  const { location } = useLocation();
  const origin = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;
  const { data: arrivalsByStop, isLoading, isFetching, refetch } = useFavoriteArrivals(stopIds);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  if (stopIds.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="star" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No favourites yet</Text>
        <Text style={styles.emptySubtitle}>
          Star a stop and it'll show up here with live arrivals at a glance.
        </Text>
        <TouchableOpacity
          style={styles.emptyCta}
          onPress={() => router.push('/search')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Find a stop to add"
        >
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.emptyCtaText}>Find a stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={stopIds}
      keyExtractor={(id) => id}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />
      }
      renderItem={({ item, index }) => (
        <FavoriteStopCard
          stopId={item}
          index={index}
          total={stopIds.length}
          origin={origin}
          arrivals={arrivalsByStop?.[item]}
          isLoading={isLoading}
        />
      )}
      contentContainerStyle={styles.listContent}
    />
  );
}
