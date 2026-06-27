import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStopArrivals } from '../../hooks/useStopArrivals';
import { useFavoritesStore } from '../../store/favorites';
import { useRecentStopsStore } from '../../store/recentStops';
import { useLocation } from '../../hooks/useLocation';
import { getStop } from '../../services/gtfsStatic';
import { haversineDistance } from '../../services/translink';
import { ArrivalRow } from '../../components/stop/ArrivalRow';
import { NextBusBanner } from '../../components/stop/NextBusBanner';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

const WALK_SPEED_M_PER_MIN = 80;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    stopInfo: {
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    stopName: { fontSize: 16, fontWeight: '700', color: c.text },
    stopId: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    walkBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    walkBannerGreen: { backgroundColor: '#F0FFF4' },
    walkBannerRed: { backgroundColor: '#FFF5F5' },
    walkText: { fontSize: 13, fontWeight: '500', flex: 1 },
    updated: {
      fontSize: 11,
      color: c.textSecondary,
      padding: 10,
      paddingHorizontal: 16,
      backgroundColor: c.background,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    loadingText: { fontSize: 14, color: c.textSecondary },
    errorText: { fontSize: 15, fontWeight: '600', color: c.text },
    emptyText: { fontSize: 14, color: c.textSecondary, textAlign: 'center' },
    retryBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
    retryText: { color: '#fff', fontWeight: '600' },
  });

export default function StopDetailScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();
  const navigation = useNavigation();
  const stop = getStop(stopId ?? '');
  const { data: arrivals, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    useStopArrivals(stopId ?? null);
  const isFav = useFavoritesStore((s) => s.isFavorite(stopId ?? ''));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);
  const addRecentStop = useRecentStopsStore((s) => s.addRecentStop);
  const { location } = useLocation();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  useEffect(() => {
    if (stopId) addRecentStop(stopId);
  }, [stopId]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Arrivals',
      headerBackVisible: false,
      // Bookmark (star) on the LEFT
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            toggleFav(stopId ?? '');
          }}
          style={{ marginLeft: 4, paddingRight: 12 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={isFav ? 'star' : 'star-outline'} size={24} color={isFav ? '#FFB800' : '#fff'} />
        </TouchableOpacity>
      ),
      // Clear close (X) on the RIGHT
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 4 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [stop, isFav, stopId]);

  const walkMinutes = useMemo(() => {
    if (!location || !stop) return null;
    const dist = haversineDistance(
      location.coords.latitude, location.coords.longitude,
      stop.stop_lat, stop.stop_lon,
    );
    return Math.round(dist / WALK_SPEED_M_PER_MIN);
  }, [location, stop]);

  const nextBusSeconds = arrivals?.[0]?.arrivalTime
    ? Math.max(0, arrivals[0].arrivalTime - Math.floor(Date.now() / 1000))
    : null;
  const nextBusMinutes = nextBusSeconds !== null ? Math.round(nextBusSeconds / 60) : null;
  const canMakeIt = walkMinutes !== null && nextBusMinutes !== null ? walkMinutes <= nextBusMinutes : null;

  const lastUpdated = dataUpdatedAt
    ? `Updated ${Math.round((Date.now() - dataUpdatedAt) / 1000)}s ago`
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.stopInfo}>
        <Text style={styles.stopName}>{stop?.stop_name ?? `Stop #${stop?.stop_code ?? stopId}`}</Text>
        <Text style={styles.stopId}>Stop #{stop?.stop_code ?? stopId}</Text>
      </View>

      {arrivals && arrivals.length > 0 && (
        <NextBusBanner arrival={arrivals[0]} stopName={stop?.stop_name} />
      )}

      {walkMinutes !== null && nextBusMinutes !== null && (
        <View style={[styles.walkBanner, canMakeIt ? styles.walkBannerGreen : styles.walkBannerRed]}>
          <Ionicons
            name={canMakeIt ? 'walk-outline' : 'close-circle-outline'}
            size={16}
            color={canMakeIt ? '#00A650' : Colors.due}
          />
          <Text style={[styles.walkText, { color: canMakeIt ? '#00A650' : Colors.due }]}>
            ~{walkMinutes} min walk · next bus in {nextBusMinutes} min
            {canMakeIt ? ' — you can make it' : ' — you might miss it'}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching arrivals…</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={c.border} />
          <Text style={styles.errorText}>Could not load arrivals.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={arrivals ?? []}
          keyExtractor={(a) => `${a.tripId}-${a.arrivalTime}`}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListHeaderComponent={
            lastUpdated ? <Text style={styles.updated}>{lastUpdated} · auto-refreshes every 60s</Text> : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="time-outline" size={44} color={c.border} />
              <Text style={styles.errorText}>No buses scheduled</Text>
              <Text style={styles.emptyText}>
                There are no buses scheduled for this stop in the next hour. Pull down to refresh.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ArrivalRow arrival={item} stopName={stop?.stop_name} stopId={stopId} />}
        />
      )}
    </View>
  );
}
