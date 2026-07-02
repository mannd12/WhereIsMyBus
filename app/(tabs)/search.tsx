import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { searchStops, searchRoutes, getStop, getRoute } from '../../services/gtfsStatic';
import { haversineDistance } from '../../services/translink';
import { useRecentStopsStore } from '../../store/recentStops';
import { useRecentRoutesStore } from '../../store/recentRoutes';
import { useFavoritesStore } from '../../store/favorites';
import { useLocation } from '../../hooks/useLocation';
import type { Stop, Route } from '../../types/translink';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { getRouteColor } from '../../constants/routeTypes';
import { formatDistance } from '../../constants/format';

type SearchMode = 'stops' | 'routes';
interface Coords { latitude: number; longitude: number }

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      margin: 12,
      marginBottom: 0,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    input: { flex: 1, fontSize: 15, color: c.text },
    modeRow: {
      flexDirection: 'row',
      margin: 12,
      gap: 8,
    },
    modeChip: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    modeChipActive: { backgroundColor: '#005CA9', borderColor: '#005CA9' },
    modeChipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
    modeChipTextActive: { color: '#fff' },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    clearText: { fontSize: 13, color: '#005CA9' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 13,
      gap: 12,
    },
    typeDot: { width: 10, height: 10, borderRadius: 5 },
    rowText: { flex: 1 },
    stopName: { fontSize: 14, fontWeight: '600', color: c.text },
    stopMeta: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 38 },
    empty: { textAlign: 'center', color: c.textSecondary, marginTop: 32, fontSize: 14, paddingHorizontal: 24 },
    hint: { textAlign: 'center', color: c.textSecondary, margin: 32, fontSize: 14, lineHeight: 22 },
  });

function StopRow({ item, origin }: { item: Stop; origin: Coords | null }) {
  const isFav = useFavoritesStore((s) => s.isFavorite(item.stop_id));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const distance = origin
    ? haversineDistance(origin.latitude, origin.longitude, item.stop_lat, item.stop_lon)
    : null;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/stop/${item.stop_id}`)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.stop_name}, stop ${item.stop_code}, open arrivals`}
    >
      <View style={[styles.typeDot, { backgroundColor: getRouteColor(item.route_types[0] ?? 3) }]} />
      <View style={styles.rowText}>
        <Text style={styles.stopName}>{item.stop_name}</Text>
        <Text style={styles.stopMeta}>
          #{item.stop_code}
          {distance !== null ? ` · ${formatDistance(distance)}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          toggleFav(item.stop_id);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isFav ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Ionicons name={isFav ? 'star' : 'star-outline'} size={18} color={isFav ? '#FFB800' : c.textSecondary} />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
    </TouchableOpacity>
  );
}

function RouteRow({ item }: { item: Route }) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const addRecentRoute = useRecentRoutesStore((s) => s.addRecentRoute);
  const color = item.route_color ? `#${item.route_color}` : '#005CA9';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        addRecentRoute(item.route_id);
        router.push(`/route/${item.route_id}`);
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Route ${item.route_short_name}, ${item.route_long_name}, view stops`}
    >
      <View style={[styles.typeDot, { backgroundColor: color }]} />
      <View style={styles.rowText}>
        <Text style={styles.stopName}>{item.route_short_name} — {item.route_long_name}</Text>
        <Text style={styles.stopMeta}>Route · tap to see all stops</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('stops');
  const { location } = useLocation();
  const origin = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const { stopIds: recentIds, clearRecent } = useRecentStopsStore();
  const { routeIds: recentRouteIds, clearRecent: clearRecentRoutes } = useRecentRoutesStore();
  const showRecent = mode === 'stops' && query.length < 2 && recentIds.length > 0;
  const showRecentRoutes = mode === 'routes' && query.length < 1 && recentRouteIds.length > 0;

  const recentStops = useMemo(
    () => recentIds.map((id) => getStop(id)).filter((s): s is Stop => s !== undefined),
    [recentIds],
  );
  const recentRoutes = useMemo(
    () => recentRouteIds.map((id) => getRoute(id)).filter((r): r is Route => r !== undefined),
    [recentRouteIds],
  );
  const stopResults = useMemo<Stop[]>(
    () => (mode === 'stops' && query.length >= 2 ? searchStops(query) : []),
    [mode, query],
  );
  const routeResults = useMemo<Route[]>(
    () => (mode === 'routes' && query.length >= 1 ? searchRoutes(query) : []),
    [mode, query],
  );

  const showEmpty =
    query.length >= (mode === 'routes' ? 1 : 2) &&
    (mode === 'stops' ? stopResults.length === 0 : routeResults.length === 0);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={c.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder={mode === 'stops' ? 'Stop name or number (e.g. 57123)' : 'Route number or name (e.g. 99)'}
          placeholderTextColor={c.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.modeRow}>
        {(['stops', 'routes'] as SearchMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeChip, mode === m && styles.modeChipActive]}
            onPress={() => { setMode(m); setQuery(''); }}
          >
            <Text style={[styles.modeChipText, mode === m && styles.modeChipTextActive]}>
              {m === 'stops' ? 'Stops' : 'Routes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showEmpty && (
        <Text style={styles.empty}>No {mode} found for "{query}"</Text>
      )}

      {(showRecent || showRecentRoutes) && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={showRecentRoutes ? clearRecentRoutes : clearRecent}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'stops' ? (
        <FlatList
          data={showRecent ? recentStops : stopResults}
          keyExtractor={(s) => s.stop_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <StopRow item={item} origin={origin} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListFooterComponent={
            !query && !showRecent ? <Text style={styles.hint}>Search by stop name or 5-digit stop number.{'\n'}Tap any result to see live arrivals.</Text> : null
          }
        />
      ) : (
        <FlatList
          data={showRecentRoutes ? recentRoutes : routeResults}
          keyExtractor={(r) => r.route_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <RouteRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListFooterComponent={
            !query && !showRecentRoutes ? <Text style={styles.hint}>Search by route number (99, 49) or name (B-Line, RapidBus).</Text> : null
          }
        />
      )}
    </View>
  );
}
