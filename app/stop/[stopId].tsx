import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStopArrivals } from '../../hooks/useStopArrivals';
import { useScheduledArrivals } from '../../hooks/useScheduledArrivals';
import { useFavoritesStore } from '../../store/favorites';
import { useRecentStopsStore } from '../../store/recentStops';
import { useLocation } from '../../hooks/useLocation';
import { getStop, getStopRoutes, getRoute } from '../../services/gtfsStatic';
import { haversineDistance } from '../../services/translink';
import { isRateLimited } from '../../services/gtfsRealtime';
import { RouteChip } from '../../components/ui/RouteChip';
import type { Route } from '../../types/translink';
import { ArrivalRow } from '../../components/stop/ArrivalRow';
import { NextBusBanner } from '../../components/stop/NextBusBanner';
import { ScheduledList } from '../../components/stop/ScheduledList';
import { ArrivalListSkeleton } from '../../components/ui/Skeleton';
import { SCHEDULE_ENABLED } from '../../constants/config';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';

const WALK_SPEED_M_PER_MIN = 80;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    stopInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    stopInfoText: { flex: 1 },
    shareBtn: { padding: 4 },
    stopName: { fontSize: 16, fontWeight: '700', color: c.text },
    stopId: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    // flexGrow:0 keeps the chip row hugging its content — otherwise the horizontal
    // ScrollView grows to fill vertical space while arrivals load, floating the chips
    // in the middle of the screen. alignItems:center guards against vertical stretch too.
    routeScroll: { flexGrow: 0 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
    walkBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
    },
    // Tints work on both light + dark backgrounds.
    walkMake: { backgroundColor: 'rgba(0,166,80,0.12)' },
    walkHurry: { backgroundColor: 'rgba(199,119,0,0.15)' },
    walkMiss: { backgroundColor: 'rgba(229,0,43,0.12)' },
    walkText: { fontSize: 13, fontWeight: '500', flex: 1 },
    updatedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 10,
      paddingHorizontal: 16,
      backgroundColor: c.background,
    },
    freshDot: { width: 7, height: 7, borderRadius: 3.5 },
    updated: { fontSize: 11, color: c.textSecondary },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    errorText: { fontSize: 15, fontWeight: '600', color: c.text },
    emptyText: { fontSize: 14, color: c.textSecondary, textAlign: 'center' },
    retryBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
    retryText: { color: '#fff', fontWeight: '600' },
  });

export default function StopDetailScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();
  const navigation = useNavigation();
  const stop = getStop(stopId ?? '');
  const { data: arrivals, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useStopArrivals(stopId ?? null);
  const hasArrivals = !!(arrivals && arrivals.length > 0);
  // Fall back to the timetable when there's no live bus (only when the proxy is
  // configured; the schedule endpoint is served from the proxy's static data, so
  // it works even if the real-time feed is down/rate-limited).
  const { data: scheduled } = useScheduledArrivals(
    stopId ?? null,
    SCHEDULE_ENABLED && !isLoading && !hasArrivals,
  );
  const hasSchedule = !!(scheduled && scheduled.length > 0);
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

  const shareStop = () => {
    if (!stop) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Share.share({
      message: `${stop.stop_name} — Stop #${stop.stop_code}. Check live bus arrivals on BusPulse.`,
    }).catch(() => {});
  };

  // Routes that serve this stop — shown as badges so you know your buses at a glance.
  const servingRoutes = useMemo<Route[]>(
    () =>
      getStopRoutes(stopId ?? '')
        .map((rid) => getRoute(rid))
        .filter((r): r is Route => !!r),
    [stopId],
  );

  const nextBusSeconds = arrivals?.[0]?.arrivalTime
    ? Math.max(0, arrivals[0].arrivalTime - Math.floor(Date.now() / 1000))
    : null;
  const nextBusMinutes = nextBusSeconds !== null ? Math.round(nextBusSeconds / 60) : null;
  const slack = walkMinutes !== null && nextBusMinutes !== null ? nextBusMinutes - walkMinutes : null;
  const makeIt: 'make' | 'hurry' | 'miss' | null =
    slack === null ? null : slack < 0 ? 'miss' : slack <= 2 ? 'hurry' : 'make';

  // On spotty signal, keep the times we already have rather than blanking them.
  const staleError = isError && hasArrivals;
  const updatedSecondsAgo = dataUpdatedAt ? Math.round((Date.now() - dataUpdatedAt) / 1000) : null;
  const lastUpdated = staleError
    ? "Couldn't refresh — showing last known times"
    : updatedSecondsAgo !== null
      ? `Updated ${updatedSecondsAgo}s ago · auto-refreshes every 60s`
      : '';
  // Green while fresh; amber once older than a refresh cycle; red if the last refresh failed.
  const freshColor = staleError
    ? Colors.due
    : updatedSecondsAgo !== null && updatedSecondsAgo < 90
      ? '#00A650'
      : '#C77700';

  return (
    <View style={styles.container}>
      <View style={styles.stopInfo}>
        <View style={styles.stopInfoText}>
          <Text style={styles.stopName}>{stop?.stop_name ?? `Stop #${stop?.stop_code ?? stopId}`}</Text>
          <Text style={styles.stopId}>Stop #{stop?.stop_code ?? stopId}</Text>
        </View>
        {stop && (
          <TouchableOpacity
            onPress={shareStop}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.shareBtn}
            accessibilityRole="button"
            accessibilityLabel="Share this stop"
          >
            <Ionicons name="share-outline" size={20} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {servingRoutes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.routeScroll}
          contentContainerStyle={styles.routeRow}
        >
          {servingRoutes.map((r) => (
            <RouteChip
              key={r.route_id}
              shortName={r.route_short_name}
              color={r.route_color}
              textColor={r.route_text_color}
            />
          ))}
        </ScrollView>
      )}

      {arrivals && arrivals.length > 0 && (
        <NextBusBanner arrival={arrivals[0]} stopName={stop?.stop_name} />
      )}

      {makeIt && (
        <View
          style={[
            styles.walkBanner,
            makeIt === 'make' ? styles.walkMake : makeIt === 'hurry' ? styles.walkHurry : styles.walkMiss,
          ]}
          accessibilityLabel={`${walkMinutes} minute walk, next bus in ${nextBusMinutes} minutes. ${
            makeIt === 'make' ? 'You can make it.' : makeIt === 'hurry' ? 'Better hurry.' : 'You might miss it.'
          }`}
        >
          <Ionicons
            name={makeIt === 'make' ? 'walk' : makeIt === 'hurry' ? 'flash' : 'close-circle'}
            size={16}
            color={makeIt === 'make' ? '#00A650' : makeIt === 'hurry' ? '#C77700' : Colors.due}
          />
          <Text
            style={[
              styles.walkText,
              { color: makeIt === 'make' ? '#00A650' : makeIt === 'hurry' ? '#C77700' : Colors.due },
            ]}
          >
            ~{walkMinutes} min walk · next bus in {nextBusMinutes} min
            {makeIt === 'make' ? ' — you can make it' : makeIt === 'hurry' ? ' — better hurry' : ' — you might miss it'}
          </Text>
        </View>
      )}

      {isLoading ? (
        <ArrivalListSkeleton />
      ) : isError && !hasArrivals && !hasSchedule ? (
        <View style={styles.center}>
          <Ionicons
            name={isRateLimited(error) ? 'time-outline' : 'cloud-offline-outline'}
            size={44}
            color={c.border}
          />
          <Text style={styles.errorText}>
            {isRateLimited(error) ? 'Live data is busy right now' : 'Could not load arrivals.'}
          </Text>
          {isRateLimited(error) && (
            <Text style={styles.emptyText}>The real-time feed has hit its limit — try again in a bit.</Text>
          )}
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
            hasArrivals && lastUpdated ? (
              <View style={styles.updatedRow}>
                <View style={[styles.freshDot, { backgroundColor: freshColor }]} />
                <Text style={styles.updated}>{lastUpdated}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            hasSchedule ? (
              <ScheduledList items={scheduled} />
            ) : (
              <View style={styles.center}>
                <Ionicons name="time-outline" size={44} color={c.border} />
                <Text style={styles.errorText}>No real-time arrivals</Text>
                <Text style={styles.emptyText}>
                  No live bus arrivals for this stop right now. Pull down to refresh.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => <ArrivalRow arrival={item} stopName={stop?.stop_name} stopId={stopId} />}
        />
      )}
    </View>
  );
}
