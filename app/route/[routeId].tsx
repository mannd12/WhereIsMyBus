import { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRoute, getStopsForRoute } from '../../services/gtfsStatic';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { useFavoritesStore } from '../../store/favorites';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      backgroundColor: c.surface,
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    routeName: { fontSize: 18, fontWeight: '700', color: c.text },
    routeSub: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    mapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
      backgroundColor: Colors.primary,
      borderRadius: 10,
      paddingVertical: 11,
    },
    mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    count: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingVertical: 13,
      gap: 12,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    rowText: { flex: 1 },
    stopName: { fontSize: 14, fontWeight: '600', color: c.text },
    stopId: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
    sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 38 },
    empty: { textAlign: 'center', color: c.textSecondary, margin: 32, fontSize: 14 },
  });

export default function RouteDetailScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const route = getRoute(routeId ?? '');
  const stops = useMemo(() => getStopsForRoute(routeId ?? ''), [routeId]);
  const isFav = useFavoritesStore((s) => s.isFavorite);
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);

  const routeColor = route?.route_color ? `#${route.route_color}` : Colors.primary;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: route ? `Route ${route.route_short_name}` : 'Route',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/(tabs)');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginRight: 4 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.routeName}>
          {route?.route_short_name ?? routeId} — {route?.route_long_name ?? ''}
        </Text>
        <Text style={styles.routeSub}>{stops.length} stops serve this route</Text>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => router.push(`/route-map/${routeId}`)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show live buses on this route on the map"
        >
          <Ionicons name="map" size={16} color="#fff" />
          <Text style={styles.mapBtnText}>Show live buses on map</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{stops.length} stops</Text>

      <FlatList
        data={stops}
        keyExtractor={(s) => s.stop_id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No stop data found. Run node scripts/fetchGtfsStatic.js to refresh.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/stop/${item.stop_id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: routeColor }]} />
            <View style={styles.rowText}>
              <Text style={styles.stopName}>{item.stop_name}</Text>
              <Text style={styles.stopId}>#{item.stop_code}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFav(item.stop_id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFav(item.stop_id) ? 'star' : 'star-outline'}
                size={18}
                color={isFav(item.stop_id) ? '#FFB800' : c.textSecondary}
              />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
