import { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, type Region } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVehiclePositions } from '../../hooks/useVehiclePositions';
import { getRouteShape, getRoute } from '../../services/gtfsStatic';
import { VehicleMarker } from '../../components/map/VehicleMarker';
import { useThemeColors, type ThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/colors';
import { VANCOUVER_REGION } from '../../constants/config';
import { useT } from '../../locales/i18n';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    map: { flex: 1 },
    closeBtn: {
      position: 'absolute',
      right: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.62)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    banner: {
      position: 'absolute',
      left: 16,
      backgroundColor: c.surface,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      maxWidth: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    bannerText: { fontSize: 14, fontWeight: '700', color: c.text },
    bannerSub: { fontSize: 12, color: c.textSecondary, marginTop: 1 },
  });

export default function RouteMapScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const tf = useT();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const fitted = useRef(false);

  const route = getRoute(routeId ?? '');
  const { data: vehicles } = useVehiclePositions();
  const routeVehicles = useMemo(
    () => (vehicles ?? []).filter((v) => v.routeId === routeId),
    [vehicles, routeId],
  );

  // One polyline per direction; `allCoords` is the flat list for fit/region.
  const lines = useMemo(
    () => getRouteShape(routeId ?? '').map((pts) => pts.map(([latitude, longitude]) => ({ latitude, longitude }))),
    [routeId],
  );
  const allCoords = useMemo(() => lines.flat(), [lines]);
  const color = route?.route_color ? `#${route.route_color}` : Colors.primary;

  const initialRegion: Region =
    allCoords.length > 0
      ? {
          latitude: allCoords[Math.floor(allCoords.length / 2)].latitude,
          longitude: allCoords[Math.floor(allCoords.length / 2)].longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : VANCOUVER_REGION;

  // Fit the whole route into view once the native map is laid out. (Shape data
  // is synchronous, so calling this from an effect on first render would fire
  // before layout — a silent no-op on iOS.)
  const fitRoute = () => {
    if (!fitted.current && allCoords.length > 1) {
      fitted.current = true;
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: { top: 90, right: 60, bottom: 120, left: 60 },
        animated: false,
      });
    }
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation onMapReady={fitRoute}>
        {lines.map((coords, i) => (
          <Polyline key={i} coordinates={coords} strokeColor={color} strokeWidth={4} />
        ))}
        {routeVehicles.map((v) => (
          <VehicleMarker key={v.vehicleId} vehicle={v} />
        ))}
      </MapView>

      <View style={[styles.banner, { top: insets.top + 8 }]}>
        <Text style={styles.bannerText} numberOfLines={1}>
          {route?.route_short_name ?? tf('common.route')} {route?.route_long_name ? `· ${route.route_long_name}` : ''}
        </Text>
        <Text style={styles.bannerSub}>
          {tf('route.liveOnRoute', { count: routeVehicles.length })}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={close}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={tf('route.closeMap')}
      >
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
